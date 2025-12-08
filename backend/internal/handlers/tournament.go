package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"snake-game/backend/internal/models"
	"snake-game/backend/internal/storage"

	"github.com/google/uuid"
)

type CreateTournamentRequest struct {
	Name       string `json:"name"`
	MaxPlayers int    `json:"max_players"`
	Prize      string `json:"prize,omitempty"`
	Duration   int    `json:"duration_minutes"` // duration in minutes
}

type JoinTournamentRequest struct {
	TournamentID string `json:"tournament_id"`
	PlayerID     string `json:"player_id"`
}

func CreateTournament(store *storage.PostgresStorage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req CreateTournamentRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
			return
		}

		if req.Name == "" || req.MaxPlayers < 2 || req.MaxPlayers > 100 || req.Duration < 1 {
			http.Error(w, `{"error": "Invalid tournament parameters"}`, http.StatusBadRequest)
			return
		}

		t := models.Tournament{
			ID:         uuid.New().String(),
			Name:       req.Name,
			MaxPlayers: req.MaxPlayers,
			Prize:      req.Prize,
			StartTime:  time.Now().Add(2 * time.Minute), // start in 2 min
			EndTime:    time.Now().Add(2*time.Minute + time.Duration(req.Duration)*time.Minute),
			Status:     "waiting",
			Players:    []string{},
		}

		if err := store.CreateTournament(&t); err != nil {
			http.Error(w, `{"error": "Failed to create tournament"}`, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(t)
	}
}

func JoinTournament(store *storage.PostgresStorage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req JoinTournamentRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
			return
		}

		if req.TournamentID == "" || req.PlayerID == "" {
			http.Error(w, `{"error": "Missing tournament_id or player_id"}`, http.StatusBadRequest)
			return
		}

		success, msg := store.JoinTournament(req.TournamentID, req.PlayerID)
		if !success {
			http.Error(w, `{"error": "`+msg+`"}`, http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": "Successfully joined tournament!",
		})
	}
}

func GetTournaments(store *storage.PostgresStorage) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		status := r.URL.Query().Get("status") // ?status=waiting | active | all

		var tournaments []models.Tournament
		var err error

		switch status {
		case "waiting":
			tournaments, err = store.GetWaitingTournaments()
		case "active":
			tournaments, err = store.GetActiveTournaments()
		case "finished":
			tournaments, err = store.GetFinishedTournaments()
		default:
			tournaments, err = store.GetAllTournaments()
		}

		if err != nil {
			http.Error(w, `{"error": "Failed to fetch tournaments"}`, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string][]models.Tournament{
			"tournaments": tournaments,
		})
	}
}
