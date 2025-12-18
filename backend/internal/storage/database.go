package storage

import (
	"database/sql"
	"time"

	"snake-game/backend/internal/models"

	_ "github.com/lib/pq"
)

type PostgresStorage struct {
	db *sql.DB
}

func NewPostgresStorage(connStr string) (*PostgresStorage, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(20) // max amount of contemporary connections
	db.SetMaxIdleConns(10) // idle in pool
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(1 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &PostgresStorage{db: db}, nil
}

func (s *PostgresStorage) SaveScore(score models.Score) error {
	query := `INSERT INTO scores (player_id, score, length) VALUES ($1, $2, $3)`
	_, err := s.db.Exec(query, score.PlayerID, score.Score, score.Length)
	return err
}

func (s *PostgresStorage) GetLeaderboard(limit int) ([]models.Score, error) {
	query := `
        SELECT id, player_id, score, length, timestamp
        FROM scores
        ORDER BY score DESC
        LIMIT $1
    `
	rows, err := s.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var scores []models.Score
	for rows.Next() {
		var sc models.Score
		if err := rows.Scan(&sc.ID, &sc.PlayerID, &sc.Score, &sc.Length, &sc.Timestamp); err != nil {
			return nil, err
		}
		scores = append(scores, sc)
	}
	return scores, nil
}

func (s *PostgresStorage) GetStats() (models.Stats, error) {
	var stats models.Stats
	query := `
        SELECT
            COUNT(*) as total_games,
            COALESCE(AVG(score), 0) as avg_score,
            COALESCE(MAX(score), 0) as max_score
        FROM scores
    `
	err := s.db.QueryRow(query).Scan(&stats.TotalGames, &stats.AvgScore, &stats.MaxScore)
	return stats, err
}

func (s *PostgresStorage) UnlockAchievement(playerID, name, description, icon string) error {
	query := `
        INSERT INTO achievements (player_id, name, description, icon)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (player_id, name) DO NOTHING
    `
	_, err := s.db.Exec(query, playerID, name, description, icon)
	return err
}

func (s *PostgresStorage) GetUserAchievements(playerID string) ([]models.Achievement, error) {
	query := `
        SELECT id, player_id, name, description, icon, unlocked_at
        FROM achievements
        WHERE player_id = $1
        ORDER BY unlocked_at DESC
    `
	rows, err := s.db.Query(query, playerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var achs []models.Achievement
	for rows.Next() {
		var a models.Achievement
		if err := rows.Scan(&a.ID, &a.PlayerID, &a.Name, &a.Description, &a.Icon, &a.UnlockedAt); err != nil {
			return nil, err
		}
		achs = append(achs, a)
	}
	return achs, nil
}

func (s *PostgresStorage) SaveUserWallet(playerID, wallet string) error {
	_, err := s.db.Exec(`
        INSERT INTO wallets (player_id, wallet)
        VALUES ($1, $2)
        ON CONFLICT (player_id) DO UPDATE SET wallet = $2
    `, playerID, wallet)
	return err
}

func (s *PostgresStorage) CreateTournament(t *models.Tournament) error {
	query := `
        INSERT INTO tournaments (id, name, max_players, prize, start_time, end_time, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `
	_, err := s.db.Exec(query, t.ID, t.Name, t.MaxPlayers, t.Prize, t.StartTime, t.EndTime, t.Status)
	return err
}

func (s *PostgresStorage) JoinTournament(tournamentID, playerID string) (bool, string) {
	var status string
	var currentPlayers int
	var maxPlayers int

	err := s.db.QueryRow(`
        SELECT status, 
               (SELECT COUNT(*) FROM tournament_players WHERE tournament_id = t.id),
               max_players
        FROM tournaments t WHERE id = $1
    `, tournamentID).Scan(&status, &currentPlayers, &maxPlayers)

	if err != nil {
		return false, "Tournament not found"
	}

	if status != "waiting" {
		return false, "Tournament already started or finished"
	}
	if currentPlayers >= maxPlayers {
		return false, "Tournament is full"
	}

	_, err = s.db.Exec(`
        INSERT INTO tournament_players (tournament_id, player_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
    `, tournamentID, playerID)

	if err != nil {
		return false, "Database error"
	}
	return true, ""
}

func (s *PostgresStorage) getTournamentsByStatus(status string) ([]models.Tournament, error) {
	var rows *sql.Rows
	var err error

	if status == "" {
		rows, err = s.db.Query(`
            SELECT
				t.id,
				t.name,
				t.max_players,
				t.prize,
				t.start_time,
				t.end_time,
				t.status,
				COUNT(tp.player_id) AS current_players
			FROM tournaments t
			LEFT JOIN tournament_players tp
				ON tp.tournament_id = t.id
			GROUP BY t.id
			ORDER BY t.created_at DESC
        `)
	} else {
		rows, err = s.db.Query(`
            SELECT
				t.id,
				t.name,
				t.max_players,
				t.prize,
				t.start_time,
				t.end_time,
				t.status,
				COUNT(tp.player_id) AS current_players
			FROM tournaments t
			LEFT JOIN tournament_players tp
				ON tp.tournament_id = t.id
			WHERE t.status = $1
			GROUP BY t.id
			ORDER BY t.created_at DESC
        `, status)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tournaments []models.Tournament
	for rows.Next() {
		var t models.Tournament
		if err := rows.Scan(&t.ID, &t.Name, &t.MaxPlayers, &t.Prize, &t.StartTime, &t.EndTime, &t.Status, &t.CurrentPlayers); err != nil {
			return nil, err
		}

		// s.db.QueryRow(`SELECT COUNT(*) FROM tournament_players WHERE tournament_id = $1`, t.ID).Scan(&t.CurrentPlayers)
		tournaments = append(tournaments, t)
	}
	return tournaments, nil
}

func (s *PostgresStorage) SaveMintedSkin(playerID, skinName, txHash string) error {
	query := `
		INSERT INTO player_minted_skins (player_id, skin_name, tx_hash)
		VALUES ($1, $2, $3)
		ON CONFLICT (player_id, skin_name) DO UPDATE SET tx_hash = EXCLUDED.tx_hash
	`
	_, err := s.db.Exec(query, playerID, skinName, txHash)
	return err
}

func (s *PostgresStorage) GetPlayerNFTs(playerID string) []string {
	var skins []string
	query := `SELECT skin_name FROM player_skins WHERE player_id = $1`
	rows, err := s.db.Query(query, playerID)
	if err != nil {
		// фейк, якщо помилка
		return []string{"default", "golden", "neon", "crypto"}
	}
	defer rows.Close()
	for rows.Next() {
		var skin string
		if err := rows.Scan(&skin); err != nil {
			continue
		}
		skins = append(skins, skin)
	}
	if len(skins) == 0 {
		return []string{"default", "golden", "neon"}
	}
	return skins
}

func (s *PostgresStorage) GetAllTournaments() ([]models.Tournament, error) {
	return s.getTournamentsByStatus("")
}

func (s *PostgresStorage) GetWaitingTournaments() ([]models.Tournament, error) {
	return s.getTournamentsByStatus("waiting")
}

func (s *PostgresStorage) GetActiveTournaments() ([]models.Tournament, error) {
	return s.getTournamentsByStatus("active")
}

func (s *PostgresStorage) GetFinishedTournaments() ([]models.Tournament, error) {
	return s.getTournamentsByStatus("finished")
}

func (s *PostgresStorage) Close() error {
	if s.db == nil {
		return nil
	}
	return s.db.Close()
}
