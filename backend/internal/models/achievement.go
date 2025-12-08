package models

import "time"

type Achievement struct {
	ID          int       `json:"id"`
	PlayerID    string    `json:"player_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	UnlockedAt  time.Time `json:"unlocked_at"`
}

type UserAchievements struct {
	Achievements []Achievement `json:"achievements"`
	Total        int           `json:"total"`
}
