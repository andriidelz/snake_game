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

	NFTMintAttempts = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "snake_nft_mint_attempts_total",
		Help: "Кількість спроб мінту NFT (включаючи помилки)",
	})

	NFTMintSuccess = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "snake_nft_mint_success_total",
		Help: "Кількість успішних мінтів NFT",
	})

	NFTMintFailed = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "snake_nft_mint_failed_total",
		Help: "Кількість невдалих мінтів NFT",
	})

	TournamentJoins = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "snake_tournament_joins_total",
		Help: "Кількість приєднань до турнірів",
	})

	TournamentCreated = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "snake_tournament_created_total",
		Help: "Кількість створених турнірів",
	})
)

func init() {
	prometheus.MustRegister(
		ActivePlayers,
		ScoresSavedTotal,
		AchievementsUnlocked,
		NFTMintAttempts,
		NFTMintSuccess,
		NFTMintFailed,
		TournamentJoins,
		TournamentCreated,
	)
}

func IncActivePlayers() { ActivePlayers.Inc() }
func DecActivePlayers() { ActivePlayers.Dec() }
func IncScoresSaved()   { ScoresSavedTotal.Inc() }
func IncAchievement()   { AchievementsUnlocked.Inc() }

func IncNFTMintAttempt() { NFTMintAttempts.Inc() }
func IncNFTMintSuccess() { NFTMintSuccess.Inc() }
func IncNFTMintFailed()  { NFTMintFailed.Inc() }

func IncTournamentJoin()    { TournamentJoins.Inc() }
func IncTournamentCreated() { TournamentCreated.Inc() }
