package handlers

import (
	"encoding/json"
	"net/http"
	"snake-game/backend/internal/storage"
	"strconv"
)

func GetLeaderboard(store *storage.PostgresStorage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		limitStr := r.URL.Query().Get("limit")
		limit := 10

		if limitStr != "" {
			if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
				limit = l
			}
		}

		scores, err := store.GetLeaderboard(r.Context(), limit)
		if err != nil {
			http.Error(w, "Failed to get leaderboard", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(scores)
	}
}
