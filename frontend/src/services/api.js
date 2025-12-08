const API_URL = '/api';

export const saveScore = async (playerID, score, length) => {
  try {
    const response = await fetch(`${API_URL}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerID, score, length })
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to save score:', error);
    throw error;
  }
};

export const getLeaderboard = async (limit = 10) => {
  try {
    const response = await fetch(`${API_URL}/leaderboard?limit=${limit}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    throw error;
  }
};

export const getStats = async () => {
  try {
    const response = await fetch(`${API_URL}/stats`);
    return await response.json();
  } catch (error) {
    console.error('Failed to get stats:', error);
    throw error;
  }
};

export const unlockAchievement = async (playerID, name, description = "", icon = "🏆") => {
  try {
    await fetch(`${API_URL}/achievement/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_id: playerID,
        name,
        description,
        icon
      })
    });
  } catch (error) {
    console.error('Failed to unlock achievement:', error);
  }
};

export const getAchievements = async (playerID) => {
  try {
    const response = await fetch(`${API_URL}/achievements?player_id=${playerID}`);
    const data = await response.json();
    return data.achievements || [];
  } catch (error) {
    console.error('Failed to get achievements:', error);
    return [];
  }
};
