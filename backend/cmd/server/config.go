package main

import (
	"os"
	"time"

	"snake-game/backend/internal/storage"
	"snake-game/backend/internal/telemetry/sentry"
)

type Config struct {
	Port  string
	Store *storage.PostgresStorage
}

func LoadConfig() (*Config, error) {
	if dsn := os.Getenv("SENTRY_DSN"); dsn != "" {
		if err := sentry.Init(dsn); err != nil {
			return nil, err
		}
		defer sentry.Flush(2 * time.Second)
	}

	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgres://snake:snake123@localhost:5432/snake_game?sslmode=disable"
	}

	store, err := storage.NewPostgresStorage(connStr)
	if err != nil {
		return nil, err
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		Port:  port,
		Store: store,
	}, nil
}
