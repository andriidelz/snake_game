package models

import "time"

type PowerUpType string

const (
	PowerUpSpeed  PowerUpType = "speed"
	PowerUpSlow   PowerUpType = "slow"
	PowerUpShield PowerUpType = "shield"
	PowerUpMagnet PowerUpType = "magnet"
	PowerUpDouble PowerUpType = "double"
)

type PowerUp struct {
	ID       string        `json:"id"`
	Type     PowerUpType   `json:"type"`
	Position []int         `json:"pos"`
	Duration time.Duration `json:"duration"`
}
