package metrics

import "github.com/prometheus/client_golang/prometheus"

var (
	ActivePlayers = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "snake_active_players",
		Help: "Кількість активних гравців зараз",
	})

	ScoresSavedTotal = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "snake_scores_saved_total",
		Help: "Всього збережено рахунків",
	})

	AchievementsUnlocked = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "snake_achievements_unlocked_total",
		Help: "Всього розблоковано досягнень",
	})
)

func init() {
	prometheus.MustRegister(ActivePlayers, ScoresSavedTotal, AchievementsUnlocked)
}

// Функції для використання в хендлерах
func IncActivePlayers() { ActivePlayers.Inc() }
func DecActivePlayers() { ActivePlayers.Dec() }
func IncScoresSaved()   { ScoresSavedTotal.Inc() }
func IncAchievement()   { AchievementsUnlocked.Inc() }
