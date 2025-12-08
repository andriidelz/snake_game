# backend/Makefile
.PHONY: lint lint-fix test

lint:
	golangci-lint run ./...

lint-fix:
	golangci-lint run --fix ./...

test:
	go test -v ./...

run ./...

mod:
	go mod tidy

run:
	go run ./cmd/server

dev: lint mod run