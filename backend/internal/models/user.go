package models

import "time"

type User struct {
	PlayerID   string    `json:"player_id" db:"player_id"`
	Wallet     string    `json:"wallet" db:"wallet"` // for NFT
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	LastActive time.Time `json:"last_active" db:"last_active"`
	Skin       string    `json:"skin" db:"skin"` // skin
}
