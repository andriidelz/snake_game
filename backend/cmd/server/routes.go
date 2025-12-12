package main

import (
	"net/http"
	"time"

	"snake-game/backend/internal/handlers"
	"snake-game/backend/internal/middleware"
	"snake-game/backend/internal/storage"
	"snake-game/backend/internal/telemetry/metrics"

	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func SetupRoutes(r *mux.Router, store *storage.PostgresStorage) {
	r.Use(middleware.Recover)
	r.Use(middleware.RequestID)
	r.Use(metrics.InstrumentHTTP)
	r.Use(middleware.Gzip)
	r.Use(middleware.Security)
	r.Use(middleware.RateLimiter)
	r.Use(middleware.Timeout(15 * time.Second))
	r.Use(middleware.CORS)

	r.Handle("/metrics", promhttp.Handler()).Methods("GET")

	api := r.PathPrefix("/api").Subrouter()

	api.HandleFunc("/health", handlers.HealthCheck).Methods("GET")
	api.HandleFunc("/leaderboard", handlers.GetLeaderboard(store)).Methods("GET")
	api.HandleFunc("/stats", handlers.GetStats(store)).Methods("GET")
	api.HandleFunc("/achievements", handlers.GetAchievements(store)).Methods("GET")
	api.HandleFunc("/multiplayer/ws", handlers.MultiplayerWS(store)).Methods("GET")
	api.HandleFunc("/skins", handlers.GetSkins).Methods("GET")
	api.HandleFunc("/mint-info", handlers.GetMintInfo).Methods("GET")
	api.HandleFunc("/tournaments", handlers.GetTournaments(store)).Methods("GET")
	api.HandleFunc("/tournament/create", handlers.CreateTournament(store)).Methods("POST")
	api.HandleFunc("/tournament/join", handlers.JoinTournament(store)).Methods("POST")
	api.HandleFunc("/metrics/mobile", handlers.MobileMetrics).Methods("POST")
	api.HandleFunc("/mint", handlers.HandleNFTMint(store)).Methods("POST")

	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(middleware.Auth)

	protected.Handle("/score",
		middleware.ValidateJSON(&handlers.SaveScoreRequest{})(http.HandlerFunc(handlers.SaveScore(store))),
	).Methods("POST")

	protected.Handle("/achievement/unlock",
		middleware.ValidateJSON(&handlers.UnlockAchievementRequest{})(http.HandlerFunc(handlers.UnlockAchievement(store))),
	).Methods("POST")
}
