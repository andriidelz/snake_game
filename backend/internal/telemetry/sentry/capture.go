package sentry

import (
	"github.com/getsentry/sentry-go"
)

// Зручні обгортки
func CaptureException(err error) {
	sentry.CaptureException(err)
}

func CaptureMessage(msg string) {
	sentry.CaptureMessage(msg)
}

func WithPlayerID(playerID string) *sentry.Scope {
	scope := sentry.NewScope()
	scope.SetUser(sentry.User{ID: playerID})
	return scope
}

// Приклад використання в хендлері:
// sentry.CurrentHub().WithScope(func(scope *sentry.Scope) {
//     scope.SetUser(sentry.User{ID: playerID})
//     sentry.CaptureException(err)
// })
