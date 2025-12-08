package handlers

import (
	"encoding/json"
	"net/http"

	"snake-game/backend/internal/models"
)

type Storage interface {
	SaveScore(models.Score) error
	GetLeaderboard(int) ([]models.Score, error)
	GetStats() (models.Stats, error)
}

func SaveScore(store Storage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		playerID, ok := r.Context().Value("player_id").(string)
		if !ok || playerID == "" {
			http.Error(w, `{"error":"unauthorized — login required"}`, http.StatusUnauthorized)
			return
		}

		var req struct {
			Score  int `json:"score"`
			Length int `json:"length"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
			return
		}

		if req.Score < 0 || req.Length < 0 {
			http.Error(w, `{"error":"score cannot be negative"}`, http.StatusBadRequest)
			return
		}

		err := store.SaveScore(models.Score{
			PlayerID: playerID,
			Score:    req.Score,
			Length:   req.Length,
		})
		if err != nil {
			http.Error(w, `{"error":"failed to save score"}`, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{
			"status":  "success",
			"message": "Score saved successfully",
			"player":  playerID,
		})
	}
}
