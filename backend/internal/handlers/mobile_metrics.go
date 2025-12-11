package handlers

import (
	"encoding/json"
	"net/http"
	"snake-game/backend/internal/telemetry/metrics"
)

type MobileEvent struct {
	Event     string                 `json:"event"`
	Data      map[string]interface{} `json:"data"`
	PlayerID  string                 `json:"player_id"`
	Timestamp int64                  `json:"timestamp"`
}

func MobileMetrics(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload struct {
		Event     string                 `json:"event"`
		Data      map[string]interface{} `json:"data"`
		PlayerID  string                 `json:"player_id"`
		Timestamp int64                  `json:"timestamp"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	switch payload.Event {
	case "game_start":
		metrics.IncActivePlayers()
	case "game_over":
		metrics.DecActivePlayers()
		metrics.IncScoresSaved()
		if score, ok := payload.Data["score"].(float64); ok && score >= 100 {
			metrics.IncAchievement()
		}
	case "new_record":
		metrics.IncAchievement()
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
