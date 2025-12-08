const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

export const saveScore = async (playerID: string, score: number, length: number) => {
  await fetch(`${API_URL}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerID, score, length })
  });
};

export const unlockAchievement = async (playerID: string, title: string, desc: string, icon: string) => {
  await fetch(`${API_URL}/achievement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerID, title, description: desc, icon })
  });
};

export const api = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (data.details && Array.isArray(data.details)) {
      const message = data.details.join('\n');
      alert(message); // або toast
    } else {
      alert(data.error || 'Щось пішло не так');
    }
    throw new Error(data.error || 'Network error');
  }

  return data;
};