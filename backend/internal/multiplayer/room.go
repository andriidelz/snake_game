package multiplayer

import (
	"encoding/json"
	"math/rand"
	"sync"
	"time"

	"snake-game/backend/internal/models"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const GRID_SIZE = 20

type Room struct {
	ID               string
	Players          map[string]*websocket.Conn
	Snakes           map[string][][2]int
	Food             [2]int
	Powerups         []models.PowerUp
	lastPowerupSpawn time.Time
	Directions       map[string][2]int
	mu               sync.Mutex
	store            interface{}
	gameLoopRunning  bool
}

var globalMu sync.Mutex
var rooms = make(map[string]*Room)

func GetOrCreateRoom(id string, store interface{}) *Room {
	globalMu.Lock()
	defer globalMu.Unlock()

	if _, ok := rooms[id]; !ok {
		rooms[id] = &Room{
			ID:               id,
			Players:          make(map[string]*websocket.Conn),
			Snakes:           make(map[string][][2]int),
			Powerups:         make([]models.PowerUp, 0),
			Directions:       make(map[string][2]int),
			lastPowerupSpawn: time.Now(),
			store:            store,
		}
		go rooms[id].Run()
	}
	return rooms[id]
}

func (r *Room) AddPlayer(id string, conn *websocket.Conn) {
	r.mu.Lock()
	r.Players[id] = conn
	startX, startY := rand.Intn(GRID_SIZE), rand.Intn(GRID_SIZE)
	r.Snakes[id] = [][2]int{{startX, startY}} // random start position
	r.Directions[id] = [2]int{1, 0}
	r.mu.Unlock()

	go r.handlePlayer(id, conn)
}

func (r *Room) Run() {
	if r.gameLoopRunning {
		return
	}
	r.gameLoopRunning = true

	ticker := time.NewTicker(150 * time.Millisecond)
	defer ticker.Stop()

	for range ticker.C {
		r.mu.Lock()

		// === АВТОРИТЕТНИЙ РУХ ЗМІЙОК ===
		for playerID, snake := range r.Snakes {
			dir := r.Directions[playerID]
			if dir == [2]int{0, 0} {
				continue // немає напрямку
			}

			head := snake[0]
			newHead := [2]int{head[0] + dir[0], head[1] + dir[1]}

			// Зіткнення зі стінами → смерть
			if newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE {
				delete(r.Snakes, playerID)
				delete(r.Directions, playerID)
				continue
			}

			// Зіткнення з будь-якою змійкою (включаючи себе)
			collided := false
			for _, otherSnake := range r.Snakes {
				for _, seg := range otherSnake {
					if seg == newHead {
						collided = true
						break
					}
				}
				if collided {
					break
				}
			}
			if collided {
				delete(r.Snakes, playerID)
				delete(r.Directions, playerID)
				continue
			}

			ateFood := false
			if newHead == r.Food {
				ateFood = true
				r.Food = [2]int{0, 0} // респавн в наступному тику
			}

			// З'їдання power-up
			for i, pu := range r.Powerups {
				if newHead[0] == pu.Position[0] && newHead[1] == pu.Position[1] {
					// Простий ефект: ростемо на 3
					snake = append(snake, snake[len(snake)-1], snake[len(snake)-1], snake[len(snake)-1])
					r.Powerups = append(r.Powerups[:i], r.Powerups[i+1:]...)
					break
				}
			}

			// Новий стан змійки
			newSnake := append([][2]int{newHead}, snake...)
			if !ateFood {
				newSnake = newSnake[:len(newSnake)-1]
			}
			r.Snakes[playerID] = newSnake
		}

		if r.Food == [2]int{0, 0} || rand.Float64() < 0.02 {
			r.Food = [2]int{rand.Intn(20), rand.Intn(20)}
		}

		if time.Since(r.lastPowerupSpawn) > 10*time.Second && len(r.Powerups) < 3 && rand.Float64() < 0.3 {
			types := []models.PowerUpType{
				models.PowerUpSpeed, models.PowerUpSlow, models.PowerUpShield,
				models.PowerUpMagnet, models.PowerUpDouble,
			}
			r.Powerups = append(r.Powerups, models.PowerUp{
				ID:       uuid.New().String(),
				Type:     types[rand.Intn(len(types))],
				Position: []int{rand.Intn(GRID_SIZE), rand.Intn(GRID_SIZE)},
				Duration: 10 * time.Second,
			})
			r.lastPowerupSpawn = time.Now()
		}

		r.broadcastGameState()
		r.mu.Unlock()
	}
}

func (r *Room) handlePlayer(id string, conn *websocket.Conn) {
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			r.mu.Lock()
			delete(r.Players, id)
			delete(r.Snakes, id)
			delete(r.Directions, id)
			r.mu.Unlock()
			r.broadcastGameState()
			return
		}

		var data struct {
			Dir struct {
				X int `json:"x"`
				Y int `json:"y"`
			} `json:"dir"`
		}
		if json.Unmarshal(msg, &data) != nil {
			continue
		}

		r.mu.Lock()
		if snake, exists := r.Snakes[id]; exists && len(snake) > 0 {
			currentDir := r.Directions[id]
			newDir := [2]int{data.Dir.X, data.Dir.Y}
			// Заборона руху назад
			if newDir[0] != -currentDir[0] || newDir[1] != -currentDir[1] {
				r.Directions[id] = newDir
			}
		}
		r.mu.Unlock()
	}
}

func (r *Room) broadcastGameState() {
	state := map[string]interface{}{
		"snakes":   r.Snakes,
		"food":     r.Food,
		"powerups": r.Powerups,
		"gameOver": false,
	}
	data, _ := json.Marshal(state)

	r.mu.Lock()
	defer r.mu.Unlock()
	for playerID, conn := range r.Players {
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			// клієнт відпав
			delete(r.Players, playerID)
			delete(r.Snakes, playerID)
			delete(r.Directions, playerID)
		}
	}
}

func (r *Room) StartGameLoop() {
	if r.gameLoopRunning {
		return
	}
	r.gameLoopRunning = true
	go r.Run()
}
