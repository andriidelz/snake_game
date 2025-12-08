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

type Room struct {
	ID               string
	Players          map[string]*websocket.Conn
	Snakes           map[string][][2]int
	Food             [2]int
	Powerups         []models.PowerUp
	lastPowerupSpawn time.Time
	mu               sync.Mutex
	store            interface{}
}

var mu sync.Mutex
var rooms = make(map[string]*Room)

func GetOrCreateRoom(id string, store interface{}) *Room {
	mu.Lock()
	defer mu.Unlock()

	if _, ok := rooms[id]; !ok {
		rooms[id] = &Room{
			ID:               id,
			Players:          make(map[string]*websocket.Conn),
			Snakes:           make(map[string][][2]int),
			Powerups:         make([]models.PowerUp, 0),
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
	r.Snakes[id] = [][2]int{{rand.Intn(20), rand.Intn(20)}} // random start position
	r.mu.Unlock()
	go r.handlePlayer(id, conn)
}

func (r *Room) Run() {
	ticker := time.NewTicker(150 * time.Millisecond)
	defer ticker.Stop()

	for range ticker.C {
		r.mu.Lock()

		if r.Food == [2]int{0, 0} || rand.Float64() < 0.02 {
			r.Food = [2]int{rand.Intn(20), rand.Intn(20)}
		}

		if time.Since(r.lastPowerupSpawn) > 10*time.Second && len(r.Powerups) < 3 && rand.Float64() < 0.3 {
			types := []models.PowerUpType{
				models.PowerUpSpeed,
				models.PowerUpSlow,
				models.PowerUpShield,
				models.PowerUpMagnet,
				models.PowerUpDouble,
			}
			r.Powerups = append(r.Powerups, models.PowerUp{
				ID:       uuid.New().String(),
				Type:     types[rand.Intn(len(types))],
				Position: []int{rand.Intn(20), rand.Intn(20)},
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
			r.mu.Unlock()
			return
		}

		var dir [2]int
		if json.Unmarshal(msg, &dir) != nil {
			continue
		}

		r.mu.Lock()
		snake, exists := r.Snakes[id]
		if !exists {
			r.mu.Unlock()
			continue
		}

		head := snake[0]
		newHead := [2]int{head[0] + dir[0], head[1] + dir[1]}

		if newHead[0] < 0 || newHead[0] >= 20 || newHead[1] < 0 || newHead[1] >= 20 {
			r.mu.Unlock()
			continue
		}

		for otherID, otherSnake := range r.Snakes {
			for _, seg := range otherSnake {
				if otherID != id && seg == newHead {
					// player died
					delete(r.Snakes, id)
					r.broadcastGameState()
					r.mu.Unlock()
					return
				}
			}
		}

		ateFood := false
		if newHead == r.Food {
			ateFood = true
			r.Food = [2]int{0, 0}
		}

		for i, pu := range r.Powerups {
			if newHead == [2]int(pu.Position) {
				// Use effect (simple example - increase on 3)
				snake = append(snake, snake[len(snake)-1], snake[len(snake)-1], snake[len(snake)-1])
				r.Powerups = append(r.Powerups[:i], r.Powerups[i+1:]...)
				break
			}
		}

		newSnake := append([][2]int{newHead}, snake...)
		if !ateFood {
			newSnake = newSnake[:len(newSnake)-1]
		}
		r.Snakes[id] = newSnake

		r.mu.Unlock()
	}
}

func (r *Room) broadcastGameState() {
	state := map[string]interface{}{
		"snakes":   r.Snakes,
		"food":     r.Food,
		"powerups": r.Powerups,
	}

	data, _ := json.Marshal(state)

	for _, conn := range r.Players {
		conn.WriteMessage(websocket.TextMessage, data)
	}
}
