package storage

import (
	"sync"
	"time"

	"snake-game/backend/internal/models"
)

type MemoryStorage struct {
	mu           sync.RWMutex
	scores       []models.Score
	achievements []models.Achievement
	nextID       int
	nextAchID    int
}

func NewMemoryStorage() *MemoryStorage {
	return &MemoryStorage{
		scores:       make([]models.Score, 0),
		achievements: make([]models.Achievement, 0),
		nextID:       1,
		nextAchID:    1,
	}
}

func (s *MemoryStorage) SaveScore(score models.Score) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	score.ID = s.nextID
	score.Timestamp = time.Now()
	s.scores = append(s.scores, score)
	s.nextID++

	return nil
}

func (s *MemoryStorage) GetLeaderboard(limit int) ([]models.Score, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	scores := make([]models.Score, len(s.scores))
	copy(scores, s.scores)

	for i := 0; i < len(scores)-1; i++ {
		for j := i + 1; j < len(scores); j++ {
			if scores[j].Score > scores[i].Score {
				scores[i], scores[j] = scores[j], scores[i]
			}
		}
	}

	if len(scores) > limit {
		scores = scores[:limit]
	}

	return scores, nil
}

func (s *MemoryStorage) GetStats() (models.Stats, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	stats := models.Stats{
		TotalGames: len(s.scores),
	}

	if stats.TotalGames > 0 {
		sum := 0
		maxScore := 0

		for _, score := range s.scores {
			sum += score.Score
			if score.Score > maxScore {
				maxScore = score.Score
			}
		}

		stats.AvgScore = float64(sum) / float64(stats.TotalGames)
		stats.MaxScore = maxScore
	}

	return stats, nil
}

func (s *MemoryStorage) UnlockAchievement(playerID, name, description, icon string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, a := range s.achievements {
		if a.PlayerID == playerID && a.Name == name {
			return nil
		}
	}

	s.achievements = append(s.achievements, models.Achievement{
		ID:          s.nextAchID,
		PlayerID:    playerID,
		Name:        name,
		Description: description,
		Icon:        icon,
		UnlockedAt:  time.Now(),
	})
	s.nextAchID++
	return nil
}

func (s *MemoryStorage) GetUserAchievements(playerID string) ([]models.Achievement, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Achievement
	for _, a := range s.achievements {
		if a.PlayerID == playerID {
			result = append(result, a)
		}
	}
	return result, nil
}
