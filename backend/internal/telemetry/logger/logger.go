package logger

import (
	"os"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

var (
	Info  = log.Info
	Warn  = log.Warn
	Error = log.Error
	Debug = log.Debug
	Fatal = log.Fatal
)

func Init() {
	level := zerolog.InfoLevel
	if os.Getenv("DEBUG") == "true" || os.Getenv("ENV") == "development" {
		level = zerolog.DebugLevel
	}
	zerolog.SetGlobalLevel(level)

	if os.Getenv("ENV") != "production" {
		log.Logger = log.Output(zerolog.ConsoleWriter{
			Out:        os.Stderr,
			TimeFormat: time.RFC3339,
		})
	} else {
		log.Logger = zerolog.New(os.Stderr).With().Timestamp().Logger()
	}

	log.Logger = log.Logger.With().
		Str("service", "snake-game-backend").
		Str("version", "1.0.0").
		Logger()

	log.Info().Msg("Structured logger initialized (zerolog)")
}
