package handlers

import (
	"encoding/json"
	"net/http"

	"snake-game/backend/internal/models"
	"snake-game/backend/internal/storage"
)

type UnlockAchievementRequest struct {
	PlayerID    string `json:"player_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
}

func UnlockAchievement(store *storage.PostgresStorage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req UnlockAchievementRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if req.PlayerID == "" || req.Name == "" {
			http.Error(w, "Missing required fields", http.StatusBadRequest)
			return
		}

		err := store.UnlockAchievement(r.Context(), req.PlayerID, req.Name, req.Description, req.Icon)
		if err != nil {
			http.Error(w, "Failed to unlock achievement", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": "Achievement unlocked!",
		})
	}
}

func GetAchievements(store *storage.PostgresStorage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		playerID := r.URL.Query().Get("player_id")
		if playerID == "" {
			http.Error(w, "Missing player_id parameter", http.StatusBadRequest)
			return
		}

		achievements, err := store.GetUserAchievements(r.Context(), playerID)
		if err != nil {
			http.Error(w, "Failed to get achievements", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(models.UserAchievements{
			Achievements: achievements,
			Total:        len(achievements),
		})
	}
}
