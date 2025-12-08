package handlers

import (
	"encoding/json"
	"net/http"
)

type SkinResponse struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Color   string `json:"color"`
	Light   string `json:"light,omitempty"`
	Rainbow bool   `json:"rainbow,omitempty"`
}

var availableSkins = []SkinResponse{
	{ID: "default", Name: "Зелений", Color: "#10b981", Light: "#34d399"},
	{ID: "red", Name: "Червоний", Color: "#ef4444", Light: "#f87171"},
	{ID: "blue", Name: "Синій", Color: "#3b82f6", Light: "#60a5fa"},
	{ID: "purple", Name: "Фіолетовий", Color: "#8b5cf6", Light: "#a78bfa"},
	{ID: "yellow", Name: "Жовтий", Color: "#f59e0b", Light: "#fbbf24"},
	{ID: "pink", Name: "Рожевий", Color: "#ec4899", Light: "#f472b6"},
	{ID: "cyan", Name: "Блакитний", Color: "#06b6d4", Light: "#22d3ee"},
	{ID: "orange", Name: "Оранжевий", Color: "#f97316", Light: "#fb923c"},
	{ID: "rainbow", Name: "Веселка", Color: "#8b5cf6", Rainbow: true},
}

func GetSkins(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string][]SkinResponse{"skins": availableSkins})
}
