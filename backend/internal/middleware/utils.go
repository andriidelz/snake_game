package middleware

import (
	"net"
	"net/http"
	"strings"
)

func GetIP(r *http.Request) string {
	// X-Forwarded-For
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		parts := strings.Split(fwd, ",")
		ip := strings.TrimSpace(parts[0])
		if parsed := net.ParseIP(ip); parsed != nil {
			return parsed.String()
		}
	}

	if real := r.Header.Get("X-Real-IP"); real != "" {
		if parsed := net.ParseIP(real); parsed != nil {
			return parsed.String()
		}
	}

	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return "unknown"
	}
	if parsed := net.ParseIP(host); parsed != nil {
		return parsed.String()
	}
	return host
}
