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

// package main

// import (
// 	"context"
// 	"log"
// 	"net/http"
// 	"os"
// 	"os/signal"
// 	"sync"
// 	"syscall"
// 	"time"

// 	"snake-game/backend/internal/handlers"
// 	"snake-game/backend/internal/middleware"
// 	"snake-game/backend/internal/storage"

// 	"snake-game/backend/internal/telemetry/metrics"
// 	"snake-game/backend/internal/telemetry/sentry"

// 	"snake-game/backend/internal/telemetry/logger"

// 	"github.com/gorilla/mux"
// 	"github.com/prometheus/client_golang/prometheus/promhttp"
// 	"github.com/rs/cors"
// )

// func main() {
// 	if dsn := os.Getenv("SENTRY_DSN"); dsn != "" {
// 		if err := sentry.Init(dsn); err != nil {
// 			log.Printf("Sentry init failed: %v", err)
// 		} else {
// 			log.Println("Sentry initialized nicely")
// 			defer sentry.Flush(2 * time.Second)
// 		}
// 	}

// 	connStr := os.Getenv("DATABASE_URL")
// 	if connStr == "" {
// 		connStr = "postgres://snake:snake123@localhost:5432/snake_game?sslmode=disable"
// 	}

// 	dbStore, err := storage.NewPostgresStorage(connStr)
// 	if err != nil {
// 		log.Fatalf("Failed to connect to database: %v", err)
// 	}
// 	defer func() {
// 		if err := dbStore.Close(); err != nil {
// 			log.Printf("Error closing database: %v", err)
// 		} else {
// 			log.Println("Database connection closed")
// 		}
// 	}()

// 	r := mux.NewRouter()

// 	r.Use(middleware.Recover)
// 	r.Use(middleware.RequestID)
// 	r.Use(logger.Logger)
// 	r.Use(middleware.Gzip)
// 	r.Use(middleware.Security)
// 	r.Use(middleware.RateLimiter)
// 	r.Use(middleware.Timeout(15 * time.Second))
// 	r.Use(metrics.InstrumentHTTP)
// 	r.Use(middleware.CORS)

// 	r.Handle("/metrics", promhttp.Handler())

// 	api := r.PathPrefix("/api").Subrouter()

// 	api.HandleFunc("/score", handlers.SaveScore(dbStore)).Methods("POST")
// 	api.HandleFunc("/leaderboard", handlers.GetLeaderboard(dbStore)).Methods("GET")
// 	api.HandleFunc("/stats", handlers.GetStats(dbStore)).Methods("GET")
// 	api.HandleFunc("/health", handlers.HealthCheck).Methods("GET")
// 	api.HandleFunc("/multiplayer/ws", handlers.MultiplayerWS(dbStore)).Methods("GET")
// 	api.HandleFunc("/achievement/unlock", handlers.UnlockAchievement(dbStore)).Methods("POST")
// 	api.HandleFunc("/achievements", handlers.GetAchievements(dbStore)).Methods("GET")

// 	protected := r.PathPrefix("/api").Subrouter()
// 	protected.Use(middleware.Auth)
// 	protected.Use(middleware.RateLimiter)
// 	protected.Use(logger.Logger)

// 	protected.HandleFunc("/score", handlers.SaveScore(dbStore)).Methods("POST")
// 	protected.HandleFunc("/achievement/unlock", handlers.UnlockAchievement(dbStore)).Methods("POST")
// 	protected.HandleFunc("/achievements", handlers.GetAchievements(dbStore)).Methods("GET")

// 	r.HandleFunc("/api/multiplayer/ws", handlers.MultiplayerWS(dbStore))

// 	c := cors.New(cors.Options{
// 		AllowedOrigins:   []string{"*"},
// 		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
// 		AllowedHeaders:   []string{"Content-Type", "Authorization"},
// 		AllowCredentials: true,
// 	})
// 	handler := c.Handler(r)

// 	port := os.Getenv("PORT")
// 	if port == "" {
// 		port = "8080"
// 	}

// 	srv := &http.Server{
// 		Addr:              ":" + port,
// 		Handler:           handler,
// 		ReadTimeout:       15 * time.Second,
// 		WriteTimeout:      15 * time.Second,
// 		IdleTimeout:       60 * time.Second,
// 		ReadHeaderTimeout: 10 * time.Second,
// 	}

// 	var wg sync.WaitGroup
// 	wg.Add(1)
// 	go func() {
// 		defer wg.Done()
// 		log.Printf("Server starting on :%s", port)
// 		log.Printf("Metrics:  http://localhost:%s/metrics", port)
// 		log.Printf("API: http://localhost:%s/api", port)
// 		log.Printf("WS:  ws://localhost:%s/api/multiplayer/ws", port)

// 		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
// 			log.Fatalf("Server crashed: %v", err)
// 		}
// 	}()

// 	stop := make(chan os.Signal, 1)
// 	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

// 	<-stop
// 	log.Println("\nShutdown signal received...")

// 	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
// 	defer cancel()

// 	log.Println("Shutting down HTTP server...")
// 	if err := srv.Shutdown(ctx); err != nil {
// 		log.Printf("Server forced to shutdown: %v", err)
// 	} else {
// 		log.Println("HTTP server gracefully stopped")
// 	}

// 	log.Println("Snake backend stopped. Bye!")
// 	wg.Wait()
// }
