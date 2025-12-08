package sentry

import (
	"log"
	"os"
	"time"

	"github.com/getsentry/sentry-go"
)

func Init(dsn string) error {
	if dsn == "" {
		log.Println("SENTRY_DSN not set — Sentry disabled")
		return nil
	}

	err := sentry.Init(sentry.ClientOptions{
		Dsn:              dsn,
		Environment:      getEnv(),
		Release:          "snake-game@1.0.0",
		TracesSampleRate: 0.2, // 20% трас для економії
		BeforeSend: func(event *sentry.Event, hint *sentry.EventHint) *sentry.Event {
			if event.Exception != nil {
				for _, exc := range event.Exception {
					if exc.Value != "" {
						lower := exc.Value
						if contains([]string{
							"context deadline exceeded",
							"i/o timeout",
							"broken pipe",
							"connection reset by peer",
						}, lower) {
							return nil
						}
					}
				}
			}
			return event
		},
	})

	if err != nil {
		log.Printf("Sentry initialization failed: %v", err)
		return err
	}

	log.Println("Sentry initialized nicely")
	return nil
}

func Flush(timeout time.Duration) {
	sentry.Flush(timeout)
}

func getEnv() string {
	if env := os.Getenv("ENV"); env != "" {
		return env
	}
	return "development"
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
