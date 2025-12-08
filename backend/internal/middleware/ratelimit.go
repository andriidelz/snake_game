package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	mu       sync.Mutex
	visitors = make(map[string]*visitor) // key: IP + optional path prefix
	cleanup  = time.NewTicker(10 * time.Minute)
)

func init() {
	go func() {
		for range cleanup.C {
			mu.Lock()
			for ip, v := range visitors {
				if time.Since(v.lastSeen) > 15*time.Minute {
					delete(visitors, ip)
				}
			}
			mu.Unlock()
		}
	}()
}

func RateLimiter(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := GetIP(r)

		mu.Lock()
		v, exists := visitors[ip]
		if !exists {
			// По дефолту: 100 запитів на хвилину (1.6 rps) + burst 20
			limiter := rate.NewLimiter(rate.Every(time.Minute/100), 20)

			if strings.HasPrefix(r.URL.Path, "/api/scores") ||
				strings.HasPrefix(r.URL.Path, "/api/achievements") ||
				strings.HasPrefix(r.URL.Path, "/api/multiplayer") {
				limiter = rate.NewLimiter(rate.Every(time.Second/5), 10) // 5 rps
			}

			v = &visitor{limiter: limiter, lastSeen: time.Now()}
			visitors[ip] = v
		}
		v.lastSeen = time.Now()
		mu.Unlock()

		if !v.limiter.Allow() {
			http.Error(w,
				"Занадто багато запитів. Спробуй через хвилину :)",
				http.StatusTooManyRequests,
			)
			return
		}

		next.ServeHTTP(w, r)
	})
}
