const POWER_UPS = {
  speed:   { icon: '⚡',    color: '#fbbf24', effect: 'Швидкість ×2', duration: 6000 },
  slow:    { icon: '🐌',   color: '#3b82f6', effect: 'Уповільнення', duration: 8000 },
  shield:  { icon: '🛡️',  color: '#8b5cf6', effect: 'Безсмертя',    duration: 10000 },
  magnet:  { icon: '🧲',  color: '#ec4899', effect: 'Магніт їжі',   duration: 8000 },
  double:  { icon: '💎',     color: '#06b6d4', effect: 'Подвійні очки',duration: 10000 },
};

const PowerUp = ({ type = 'speed' }) => {
  const p = POWER_UPS[type] || POWER_UPS.speed;

  return (
    <div className="relative group">
      {/* Основне коло */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-70 animate-pulse"
        style={{ backgroundColor: p.glow }}
      />

      {/* Головний power-up */}
      <div
        className="relative w-12 h-12 rounded-full flex items-center justify-center border-4 border-white/50 shadow-2xl animate-pulse"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${p.color}ee, ${p.color}cc)`,
          boxShadow: `0 0 30px ${p.glow}, inset 0 0 20px rgba(255,255,255,0.4)`,
        }}
      >
        <span className="text-3xl drop-shadow-2xl">{p.icon}</span>
      </div>

      {/* Tooltip — з’являється при hover */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-4 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        <div className="font-bold text-yellow-400">{p.name}</div>
        <div className="text-white/80">Натисни, щоб активувати</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-black/90" />
      </div>
    </div>
  );
};

export default PowerUp;