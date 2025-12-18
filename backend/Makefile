.PHONY: lint lint-fix test mod run dev

lint:
	golangci-lint run ./backend/...

lint-fix:
	golangci-lint run --fix ./backend/...

test:
	go test -v ./backend/...

mod:
	cd backend && go mod tidy

run:
	cd backend && go run ./cmd/server

dev: lint mod run

web-dev:
	cd frontend && npm run dev

web-build:
	cd frontend && npm run build

mobile:
	cd mobile && expo start

migrate:
	docker-compose run --rm migrate

up:
	make migrate
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

dev-all: lint web-dev