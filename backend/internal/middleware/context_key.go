package middleware

type contextKey string

func (c contextKey) String() string {
	return "snake-game/context/" + string(c)
}

var (
	// Ключі для контексту — тепер без колізій!
	KeyPlayerID  = contextKey("player_id")
	KeyRequestID = contextKey("request_id")
)
