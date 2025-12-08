package logger

import (
	"net/http"
	"time"

	"snake-game/backend/internal/middleware"

	"github.com/rs/zerolog/log"
)

func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		ww := middleware.NewResponseWriter(w)

		requestID := "unknown"
		if rid := r.Context().Value(middleware.KeyRequestID); rid != nil {
			if id, ok := rid.(string); ok {
				requestID = id
			}
		}

		next.ServeHTTP(ww, r)

		duration := time.Since(start)

		log.Info().
			Str("request_id", requestID).
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Int("status", ww.Status()).
			Dur("duration_ms", duration).
			Str("ip", middleware.GetIP(r)).
			Msg("HTTP request")
	})
}
