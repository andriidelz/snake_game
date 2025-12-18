package main

import (
	"log"
	"net/http"
	"snake-game/backend/internal/telemetry/logger"

	"github.com/gorilla/mux"
)

func main() {
	logger.Init()

	cfg, err := LoadConfig()
	if err != nil {
		log.Fatalf("Config error: %v", err)
	}
	defer cfg.Store.Close()

	router := mux.NewRouter()
	SetupRoutes(router, cfg.Store)

	log.Printf("Snake Game API starting on :%s", cfg.Port)
	log.Printf("Metrics: http://localhost:%s/metrics", cfg.Port)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router, // ← просто mux роутер!
		ReadTimeout:       15,
		WriteTimeout:      15,
		IdleTimeout:       60,
		ReadHeaderTimeout: 10,
	}

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server crashed: %v", err)
	}
}