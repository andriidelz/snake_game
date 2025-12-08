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

**Backend:**

- Go 1.21
- Gorilla Mux
- PostgreSQL
- CORS middleware

## 🛠 Встановлення

### Швидкий старт з Docker

```bash
# Клонуйте репозиторій
git clone https://github.com/yourusername/snake-game.git
cd snake-game

# Запустіть через Docker Compose
docker-compose up -d

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

### Linters

- перевірка: ./golangci-lint run ./...
- Авто-виправлення (де можливо): ./golangci-lint run --fix ./...

### Codecov.io

[![Codecov](https://codecov.io/gh/ваш-юзернейм/snake-game/branch/main/graph/badge.svg)](https://codecov.io/gh/ваш-юзернейм/snake-game)
