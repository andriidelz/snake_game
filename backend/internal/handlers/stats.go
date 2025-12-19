package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"snake-game/backend/internal/models"
	"snake-game/backend/internal/storage"
)

func GetStats(store *storage.PostgresStorage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		stats, err := store.GetStats(ctx)
		if err != nil && err != sql.ErrNoRows {
			log.Printf("Error getting stats: %v", err)
			http.Error(w, "Failed to get stats", http.StatusInternalServerError)
			return
		}

		if err == sql.ErrNoRows {
			stats = models.Stats{TotalGames: 0, AvgScore: 0, MaxScore: 0}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(stats)
	}
}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "ok",
		"service": "snake-game-backend",
	})
}
