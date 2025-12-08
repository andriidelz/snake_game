package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

type Server struct {
	httpSrv *http.Server
	wg      sync.WaitGroup
}

func NewServer(addr string, handler http.Handler) *Server {
	s := &http.Server{
		Addr:              addr,
		Handler:           handler,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
	}

	return &Server{
		httpSrv: s,
	}
}

func (s *Server) Start() {
	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		log.Printf("Snake Game API running on http://localhost%s", s.httpSrv.Addr)
		log.Printf("Metrics → http://localhost%s/metrics", s.httpSrv.Addr)

		if err := s.httpSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server crashed: %v", err)
		}
	}()
}

func (s *Server) Shutdown() {
	log.Println("\nShutting down gracefully... (Ctrl+C received)")

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	if err := s.httpSrv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	} else {
		log.Println("Server stopped gracefully")
	}

	s.wg.Wait()
	log.Println("Snake backend stopped. Bye!")
}
