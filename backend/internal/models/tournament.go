package models

import "time"

type Tournament struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	StartTime      time.Time `json:"start_time"`
	EndTime        time.Time `json:"end_time"`
	Prize          string    `json:"prize"` // example "Legendary NFT" (потім можна розширити)
	MaxPlayers     int       `json:"max_players"`
	Players        []string  `json:"players"`
	Status         string    `json:"status"` // "waiting", "active", "finished"
	CurrentPlayers int       `json:"current_players"`
}
