import { useState } from 'react';

const skins = [
  { id: 'default', color: '#10b981', name: 'Зелений' },
  { id: 'red', color: '#ef4444', name: 'Червоний' },
  { id: 'blue', color: '#3b82f6', name: 'Синій' },
  { id: 'purple', color: '#8b5cf6', name: 'Фіолетовий' },
  { id: 'yellow', color: '#f59e0b', name: 'Жовтий' },
  { id: 'pink', color: '#ec4899', name: 'Рожевий' },
  { id: 'cyan', color: '#06b6d4', name: 'Блакитний' },
  { id: 'orange', color: '#f97316', name: 'Оранжевий' },
  { id: 'rainbow', color: '#8b5cf6', light: '#ec4899', name: 'Веселка', rainbow: true },
];

const SkinSelector = ({ onSelect }) => {
  const [selected, setSelected] = useState('default');

  const handleSelect = (skin) => {
    setSelected(skin.id);
    onSelect(skin);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white text-center mb-4">
        Обери скін змійки
      </h3>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-5 max-w-2xl mx-auto">
        {skins.map(skin => (
          <button
            key={skin.id}
            onClick={() => handleSelect(skin)}
            className={`
              relative group overflow-hidden rounded-2xl transition-all duration-300 transform
              ${selected === skin.id 
                ? 'ring-4 ring-yellow-400 scale-110 shadow-2xl' 
                : 'hover:scale-105 hover:shadow-xl'
              }
            `}
          >
            {/* Прев’ю змійки */}
            <div className="relative h-28 bg-gray-900 rounded-t-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Змійка з 5 сегментів */}
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="absolute w-6 h-6 rounded-lg shadow-lg"
                    style={{
                      backgroundColor: skin.rainbow 
                        ? `hsl(${(i * 60) % 360}, 100%, 60%)`
                        : i === 0 ? skin.color : skin.light,
                      transform: `translateX(${(i - 2) * 28}px)`,
                      zIndex: 5 - i,
                      boxShadow: skin.rainbow ? `0 0 20px ${skin.color}` : '0 4px 10px rgba(0,0,0,0.6)',
                      segment: {
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        shadowColor: '#000',
                        shadowOpacity: 0.8,
                        shadowRadius: 10,
                        elevation: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  />
                ))}
              </div>

              {/* Ефект світіння */}
              {selected === skin.id && (
                <div className="absolute inset-0 bg-white/20 animate-ping" />
              )}
            </div>

            {/* Назва */}
            <div className="py-3 bg-gradient-to-b from-black/50 to-black/80">
              <p className="text-white font-bold text-sm">{skin.name}</p>
              {skin.id === 'rainbow' && (
                <p className="text-xs text-yellow-400">Ексклюзив!</p>
              )}
            </div>

            {/* Позначка обраного */}
            {selected === skin.id && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                Check
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SkinSelector;