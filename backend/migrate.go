package main

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "postgres://snake:snakepass@postgres:5432/snakedb?sslmode=disable"

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("failed to connect to DB:", err)
	}
	defer db.Close()

	tables := []string{
		`CREATE TABLE IF NOT EXISTS scores (
			id SERIAL PRIMARY KEY,
			player_id VARCHAR(100) NOT NULL,
			score INT NOT NULL,
			length INT NOT NULL,
			timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE INDEX IF NOT EXISTS idx_scores_score_desc ON scores (score DESC);`,
		`CREATE INDEX IF NOT EXISTS idx_scores_timestamp_desc ON scores (timestamp DESC);`,
		`CREATE TABLE IF NOT EXISTS achievements (
			id SERIAL PRIMARY KEY,
			player_id VARCHAR(100) NOT NULL,
			name VARCHAR(100) NOT NULL,
			description TEXT,
			icon VARCHAR(50),
			unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(player_id, name)
		);`,
		`CREATE TABLE IF NOT EXISTS wallets (
			player_id VARCHAR(100) PRIMARY KEY,
			wallet VARCHAR(255)
		);`,
		`CREATE TABLE IF NOT EXISTS player_skins (
			player_id VARCHAR(100),
			skin_name VARCHAR(50),
			PRIMARY KEY (player_id, skin_name)
		);`,
		`CREATE TABLE IF NOT EXISTS tournaments (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			max_players INT NOT NULL,
			prize TEXT,
			start_time TIMESTAMP NOT NULL,
			end_time TIMESTAMP NOT NULL,
			status VARCHAR(20) DEFAULT 'waiting',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS tournament_players (
			tournament_id VARCHAR(36) REFERENCES tournaments(id) ON DELETE CASCADE,
			player_id VARCHAR(100),
			joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (tournament_id, player_id)
		);`,
		`CREATE TABLE IF NOT EXISTS player_minted_skins (
			player_id VARCHAR(100) NOT NULL,
			skin_name VARCHAR(100) NOT NULL,
			tx_hash VARCHAR(255),
			minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (player_id, skin_name)
		);`,
	}

	for _, tbl := range tables {
		if _, err := db.Exec(tbl); err != nil {
			log.Fatalf("failed to execute: %v\nquery: %s", err, tbl)
		}
	}

	log.Println("Migrations finished successfully")
}
