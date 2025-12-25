package handlers

import (
	"log"
	"net/http"

	"snake-game/backend/internal/multiplayer"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func MultiplayerWS(store interface{}) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}
		roomID := r.URL.Query().Get("room")
		playerID := r.URL.Query().Get("player")

		room := multiplayer.GetOrCreateRoom(roomID, store)
		room.AddPlayer(playerID, conn)

		room.StartGameLoop()
	}
}
