import { useState } from 'react'
import Icon from '@/components/ui/icon'
import { RouletteGame } from '@/components/games/RouletteGame'
import { SlotGame } from '@/components/games/SlotGame'
import { MinesGame } from '@/components/games/MinesGame'

const categories = ['Все', 'Слоты', 'Рулетка', 'Мины', 'Покер', 'Блэкджек']

type GameId = 'slot' | 'roulette' | 'mines' | null

const games = [
  { name: 'Book of Dead',      provider: "Play'n GO",    category: 'Слоты',   emoji: '📖', color: 'from-amber-900 to-amber-700',   badge: '🔥 Хит',     rtp: '96.2%', type: 'slot' as GameId,    playable: true  },
  { name: 'Sweet Bonanza',     provider: 'Pragmatic',    category: 'Слоты',   emoji: '🍭', color: 'from-pink-900 to-pink-700',     badge: '⭐ Топ',     rtp: '96.5%', type: 'slot' as GameId,    playable: true  },
  { name: 'Gates of Olympus',  provider: 'Pragmatic',    category: 'Слоты',   emoji: '⚡', color: 'from-blue-900 to-blue-700',     badge: '💎 VIP',    rtp: '96.5%', type: 'slot' as GameId,    playable: true  },
  { name: 'Starburst',         provider: 'NetEnt',       category: 'Слоты',   emoji: '⭐', color: 'from-violet-900 to-violet-700', badge: '🆕 Новинка', rtp: '96.1%', type: 'slot' as GameId,    playable: true  },
  { name: 'Wolf Gold',         provider: 'Pragmatic',    category: 'Слоты',   emoji: '🐺', color: 'from-green-900 to-green-700',   badge: '💰 Jackpot', rtp: '96.0%', type: 'slot' as GameId,    playable: true  },
  { name: 'Mega Moolah',       provider: 'Microgaming',  category: 'Слоты',   emoji: '🦁', color: 'from-yellow-900 to-yellow-700', badge: '💰 Jackpot', rtp: '88.1%', type: 'slot' as GameId,    playable: true  },
  { name: 'European Roulette', provider: 'NetEnt',       category: 'Рулетка', emoji: '🎡', color: 'from-red-900 to-red-800',       badge: '🎯 x35',    rtp: '97.3%', type: 'roulette' as GameId, playable: true  },
  { name: 'American Roulette', provider: 'Evolution',    category: 'Рулетка', emoji: '🎰', color: 'from-red-900 to-orange-800',    badge: '',           rtp: '94.7%', type: 'roulette' as GameId, playable: true  },
  { name: 'Mines',             provider: 'LuckyAce',     category: 'Мины',    emoji: '💣', color: 'from-gray-900 to-gray-800',     badge: '💥 x500',   rtp: '97%',   type: 'mines' as GameId,    playable: true  },
  { name: 'Mines Hard',        provider: 'LuckyAce',     category: 'Мины',    emoji: '☢️', color: 'from-red-950 to-gray-900',      badge: '🔥 Хардкор', rtp: '97%',  type: 'mines' as GameId,    playable: true  },
  { name: "Texas Hold'em",     provider: 'Playtech',     category: 'Покер',   emoji: '🃏', color: 'from-emerald-900 to-emerald-700', badge: 'Скоро',   rtp: '97.8%', type: null,                  playable: false },
  { name: 'Classic Blackjack', provider: 'Evolution',    category: 'Блэкджек',emoji: '🂡', color: 'from-zinc-900 to-zinc-700',     badge: 'Скоро',     rtp: '99.5%', type: null,                  playable: false },
]

export function GamesTab() {
  const [activeCategory, setActiveCategory] = useState('Все')
  const [search, setSearch] = useState('')
  const [activeGame, setActiveGame] = useState<{ type: GameId; name: string } | null>(null)

  const filtered = games.filter(g => {
    const matchCat = activeCategory === 'Все' || g.category === activeCategory
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (activeGame?.type === 'roulette') return <RouletteGame onClose={() => setActiveGame(null)} />
  if (activeGame?.type === 'slot') return <SlotGame onClose={() => setActiveGame(null)} gameName={activeGame.name} />
  if (activeGame?.type === 'mines') return <MinesGame onClose={() => setActiveGame(null)} />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Игровой зал</h2>
          <p className="text-gray-500 text-sm">{games.filter(g => g.playable).length} игр доступны прямо сейчас</p>
        </div>
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск игры..."
            className="bg-[#1a1a1a] border border-[#333] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-500 w-full sm:w-56" />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat ? 'bg-violet-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333] hover:border-violet-500/50 hover:text-white'
            }`}>{cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map(game => (
          <div key={game.name}
            onClick={() => game.playable && game.type && setActiveGame({ type: game.type, name: game.name })}
            className={`group relative rounded-xl overflow-hidden bg-[#141414] border transition-all ${
              game.playable
                ? 'border-[#262626] cursor-pointer hover:border-violet-500/60 hover:scale-[1.03] hover:shadow-lg hover:shadow-violet-900/30'
                : 'border-[#1e1e1e] opacity-50 cursor-not-allowed'
            }`}>
            <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center relative`}>
              <span className="text-5xl group-hover:scale-110 transition-transform duration-200">{game.emoji}</span>
              {!game.playable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-xs text-gray-300 bg-black/70 px-2 py-1 rounded-full">Скоро</span>
                </div>
              )}
            </div>
            {game.badge && game.playable && (
              <span className="absolute top-2 left-2 text-xs bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full text-white">{game.badge}</span>
            )}
            {game.playable && (
              <span className="absolute top-2 right-2 text-xs bg-violet-600/90 px-2 py-0.5 rounded-full text-white">▶</span>
            )}
            <div className="p-3">
              <p className="text-white text-sm font-semibold truncate">{game.name}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-gray-500 text-xs">{game.provider}</p>
                <span className="text-xs text-green-400 font-medium">RTP {game.rtp}</span>
              </div>
            </div>
            {game.playable && (
              <div className="absolute inset-0 bg-violet-600/0 group-hover:bg-violet-600/8 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-violet-600 text-white text-xs px-4 py-2 rounded-full font-bold shadow-lg">Играть</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
