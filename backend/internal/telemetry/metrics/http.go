package metrics

import (
	"net/http"
	"snake-game/backend/internal/middleware"
	"snake-game/backend/internal/telemetry/logger"
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	HTTPRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Тривалість HTTP-запитів",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "route", "code"},
	)

	HTTPRequestTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Кількість HTTP-запитів",
		},
		[]string{"method", "route", "code"},
	)
)

type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

func InstrumentHTTP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &responseWriter{ResponseWriter: w, status: http.StatusOK}

		next.ServeHTTP(rw, r)

		duration := time.Since(start)
		status := strconv.Itoa(rw.status)
		requestID := middleware.GetRequestID(r.Context())

		logger.Info().
			Str("request_id", requestID).
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Int("status", rw.status).
			Dur("duration_ms", duration).
			Str("ip", middleware.GetIP(r)).
			Msg("HTTP request")

		HTTPRequestDuration.WithLabelValues(r.Method, r.URL.Path, status).Observe(duration.Seconds())
		HTTPRequestTotal.WithLabelValues(r.Method, r.URL.Path, status).Inc()
	})
}
