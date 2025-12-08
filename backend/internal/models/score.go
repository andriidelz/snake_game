package models

import "time"

type Score struct {
	ID        int       `json:"id"`
	PlayerID  string    `json:"player_id"`
	Score     int       `json:"score"`
	Length    int       `json:"length"`
	Timestamp time.Time `json:"timestamp"`
}

type Leaderboard struct {
	Scores []Score `json:"scores"`
}

type Stats struct {
	TotalGames int     `json:"total_games"`
	AvgScore   float64 `json:"avg_score"`
	MaxScore   int     `json:"max_score"`
	TotalPlays int     `json:"total_plays"`
}
