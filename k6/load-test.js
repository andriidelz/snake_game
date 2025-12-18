import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  stages: [
    { duration: '30s', target: 5 },    // hotting
    { duration: '1m', target: 10 },   // top — 100 simultaneously
    { duration: '30s', target: 0 },       // descending
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% requests < 500ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  },
};

const BASE_URL = 'http://backend:8080';

export default function () {
  const res = http.post(`${BASE_URL}/api/score`, JSON.stringify({
    player_id: `stress_${__VU}`,
    score: Math.floor(Math.random() * 1000),
    length: 42
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {'Score saved': (r) => r.status === 200});

  const lbRes = http.get(`${BASE_URL}/api/leaderboard?limit=10`);
  check(lbRes, { 'leaderboard ok': (r) => r.status === 200 });

  http.get(`${BASE_URL}/api/leaderboard?limit=10`);

  sleep(1);
}