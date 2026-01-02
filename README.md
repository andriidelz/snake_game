# 🐍 Snake Game - Монетизація через рекламу

Повнофункціональна гра Snake з системою підрахунку очок, таблицею лідерів та інтеграцією реклами.

## 🚀 Особливості

- ✅ Класичний геймплей Snake
- 📊 Таблиця лідерів в реальному часі
- 💰 Інтеграція реклами (Google AdSense готова)
- 🎮 Responsive дизайн
- 🔥 Golang backend з PostgreSQL
- ⚡ React frontend з Tailwind CSS

## 📦 Технології

**Frontend:**

- React 18
- Tailwind CSS
- Lucide Icons
- Fetch API
- Vite

**Backend:**

- Go 1.24
- Gorilla Mux
- PostgreSQL
- CORS middleware
- Grafana
- Prometheus

## 🛠 Встановлення

### Швидкий старт з Docker

```bash
# Клонуйте репозиторій
git clone https://github.com/yourusername/snake-game.git
cd snake-game

# Запустіть через Docker Compose
docker-compose up -d
docker-compose up --build backend postgres
docker-compose up --build backend frontend postgres

# Доступ:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### Посилання

Веб: <http://localhost>
API: <http://localhost/api>
Мобільний: Expo Go → expo start

### Локальна розробка

**Backend:**

```bash
cd backend
go mod download
go run cmd/server/main.go
```

**Frontend:**

```bash
cd frontend
npm install
npm start
```

**Mobile:**

```bash
cd mobile && expo start - локально тестувати
eas build --platform android - зібрати АРК (Android)
eas build --platform ios - Зібрати IPA (iOS)
npm install --legacy-peer-deps
npx expo start --lan --clear - використовує локальну мережу (твій IP 192.168.0.148 — ідеально для телефону в тій самій Wi-Fi)
npx expo start --tunnel --clear - через ngrok (працює навіть якщо телефон в іншій мережі)
npx expo run:android
npx expo run:ios
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

- Опублікувати в сториЧерез Expo Application Services (EAS)

### Linters

- перевірка: ./golangci-lint run ./...
- Авто-виправлення (де можливо): ./golangci-lint run --fix ./...

### Codecov.io

[![Codecov](https://codecov.io/gh/ваш-юзернейм/snake-game/branch/main/graph/badge.svg)](https://codecov.io/gh/ваш-юзернейм/snake-game)

### K6 Grafana

- <http://localhost:3000>
- docker-compose run --rm k6
- docker-compose up -d postgres backend grafana
- docker-compose run --rm k6 run /scripts/load-test.js

### Prometheus

- <http://localhost:9090>
- docker-compose up -d prometheus grafana
- docker-compose up -d backend prometheus grafana
- docker-compose up -d backend frontend nginx prometheus grafana

### entrypoint.sh

- chmod +x entrypoint.sh - додати права 1 раз

## Test on mobile phone

- bash: ipconfig (Windows) або ifconfig / ip a (Mac/Linux)
