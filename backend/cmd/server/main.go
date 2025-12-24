package main

import (
	"log"
	"net/http"
	"snake-game/backend/internal/telemetry/logger"
	"time"

	"github.com/gorilla/mux"
)

func main() {
	logger.Init()

	cfg, err := LoadConfig()
	if err != nil {
		log.Fatalf("Config error: %v", err)
	}
	defer cfg.Store.Close()

	log.Println("✅ Config loaded successfully")
	log.Println("✅ Database connection established")

	router := mux.NewRouter()
	SetupRoutes(router, cfg.Store)

	log.Println("✅ Routes registered")
	log.Printf("Snake Game API starting on :%s", cfg.Port)
	log.Printf("Metrics: http://localhost:%s/metrics", cfg.Port)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router, // ← просто mux роутер!
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
	}

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server crashed: %v", err)
	}
}
