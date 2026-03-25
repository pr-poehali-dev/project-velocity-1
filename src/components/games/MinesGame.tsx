import { useState, useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'

const GRID = 25 // 5x5

function calcMultiplier(opened: number, mines: number): number {
  // Честный расчёт коэффициента по комбинаторике
  let prob = 1
  for (let i = 0; i < opened; i++) {
    prob *= (GRID - mines - i) / (GRID - i)
  }
  const raw = (0.97 / prob)
  return Math.round(raw * 100) / 100
}

function placeMines(count: number, revealed: Set<number>): Set<number> {
  const mines = new Set<number>()
  const safe = Array.from({ length: GRID }, (_, i) => i).filter(i => !revealed.has(i))
  while (mines.size < count && mines.size < safe.length) {
    const idx = safe[Math.floor(Math.random() * safe.length)]
    mines.add(idx)
  }
  return mines
}

const MINE_COUNTS = [1, 3, 5, 10, 15, 20, 24]

export function MinesGame({ onClose }: { onClose: () => void }) {
  const { user, updateBalance } = useAppStore()
  const [bet, setBet] = useState(200)
  const [mineCount, setMineCount] = useState(3)
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'dead'>('idle')
  const [mines, setMines] = useState<Set<number>>(new Set())
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [exploded, setExploded] = useState<number | null>(null)
  const [profit, setProfit] = useState(0)

  const mult = gameState === 'playing' || gameState === 'won'
    ? calcMultiplier(revealed.size, mineCount)
    : calcMultiplier(0, mineCount)

  const nextMult = calcMultiplier(revealed.size + 1, mineCount)
  const currentWin = Math.round(bet * mult)

  const startGame = () => {
    if ((user?.balance || 0) < bet) return
    updateBalance(-bet)
    setMines(new Set())
    setRevealed(new Set())
    setExploded(null)
    setProfit(0)
    setGameState('playing')
  }

  const handleCell = useCallback((idx: number) => {
    if (gameState !== 'playing') return
    if (revealed.has(idx)) return

    // Генерируем мины вокруг уже открытых + кликнутой клетки при первом клике
    let currentMines = mines
    if (mines.size === 0) {
      const safe = new Set([idx, ...revealed])
      const pool = Array.from({ length: GRID }, (_, i) => i).filter(i => !safe.has(i))
      const newMines = new Set<number>()
      while (newMines.size < mineCount) {
        const r = pool[Math.floor(Math.random() * pool.length)]
        newMines.add(r)
      }
      currentMines = newMines
      setMines(newMines)
    }

    if (currentMines.has(idx)) {
      // Взрыв — показываем все мины
      setExploded(idx)
      setGameState('dead')
      setMines(currentMines)
      const lost = -bet + (revealed.size > 0 ? Math.round(bet * calcMultiplier(revealed.size, mineCount)) - bet : 0)
      setProfit(lost)
    } else {
      const newRevealed = new Set([...revealed, idx])
      setRevealed(newRevealed)
      const newMult = calcMultiplier(newRevealed.size, mineCount)
      setProfit(Math.round(bet * newMult) - bet)

      // Авто-победа если открыли все безопасные
      if (newRevealed.size === GRID - mineCount) {
        const win = Math.round(bet * newMult)
        updateBalance(win)
        setProfit(win - bet)
        setGameState('won')
      }
    }
  }, [gameState, mines, revealed, mineCount, bet, updateBalance])

  const cashOut = () => {
    if (gameState !== 'playing' || revealed.size === 0) return
    const win = Math.round(bet * mult)
    updateBalance(win)
    setProfit(win - bet)
    setGameState('won')
  }

  const safeLeft = GRID - mineCount - revealed.size

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] overflow-y-auto">
      <div className="min-h-screen p-4 flex flex-col max-w-lg mx-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-gray-400 hover:text-white bg-[#1a1a1a] border border-[#333] rounded-xl p-2 text-sm">
              ← Назад
            </button>
            <div>
              <h1 className="text-white font-bold text-xl">💣 Mines</h1>
              <p className="text-gray-500 text-xs">Открывай клетки — избегай мин</p>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-white font-bold text-sm">
            💰 {(user?.balance || 0).toLocaleString()} ₽
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">Множитель</p>
            <p className="text-yellow-400 font-bold text-xl">{gameState === 'playing' ? mult.toFixed(2) : '—'}x</p>
          </div>
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">Выигрыш</p>
            <p className={`font-bold text-xl ${gameState === 'playing' && revealed.size > 0 ? 'text-green-400' : 'text-white'}`}>
              {gameState === 'playing' && revealed.size > 0 ? `${currentWin.toLocaleString()} ₽` : '—'}
            </p>
          </div>
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">Следующий</p>
            <p className="text-blue-400 font-bold text-xl">
              {gameState === 'playing' ? `${nextMult.toFixed(2)}x` : '—'}
            </p>
          </div>
        </div>

        {/* Результат */}
        {gameState === 'dead' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4 text-center">
            <p className="text-red-400 font-bold text-lg">💥 Взрыв! Мина!</p>
            <p className="text-gray-400 text-sm">Потеряно: {bet.toLocaleString()} ₽</p>
          </div>
        )}
        {gameState === 'won' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-4 text-center">
            <p className="text-green-400 font-bold text-lg">🎉 Забрано!</p>
            <p className="text-white text-sm font-bold">+{profit.toLocaleString()} ₽ прибыли (x{mult.toFixed(2)})</p>
          </div>
        )}

        {/* Поле 5x5 */}
        <div className="grid grid-cols-5 gap-2 mb-5">
          {Array.from({ length: GRID }, (_, i) => {
            const isRevealed = revealed.has(i)
            const isMine = (gameState === 'dead' || gameState === 'won') && mines.has(i)
            const isExploded = i === exploded
            const isClickable = gameState === 'playing' && !isRevealed

            return (
              <button
                key={i}
                onClick={() => handleCell(i)}
                disabled={!isClickable}
                className={`aspect-square rounded-xl text-2xl flex items-center justify-center font-bold transition-all border
                  ${isExploded ? 'bg-red-600 border-red-400 scale-110 shadow-lg shadow-red-500/50' :
                    isMine ? 'bg-red-900/60 border-red-800' :
                    isRevealed ? 'bg-green-900/40 border-green-600/50 scale-95' :
                    isClickable ? 'bg-[#1a1a1a] border-[#333] hover:border-violet-500/70 hover:bg-[#252525] hover:scale-105 cursor-pointer active:scale-95' :
                    'bg-[#141414] border-[#222] cursor-default'
                  }`}
              >
                {isExploded ? '💥' : isMine ? '💣' : isRevealed ? '💎' : gameState === 'idle' || gameState === 'dead' || gameState === 'won' ? '' : ''}
              </button>
            )
          })}
        </div>

        {/* Настройки ставки и мин */}
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 mb-4 space-y-4">
          {/* Ставка */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400 font-medium">Ставка</label>
              <span className="text-white font-bold text-sm">{bet.toLocaleString()} ₽</span>
            </div>
            <div className="flex gap-2">
              {[100, 200, 500, 1000, 2000, 5000].map((v) => (
                <button key={v} onClick={() => setBet(v)} disabled={gameState === 'playing'}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${bet === v ? 'bg-violet-600 text-white' : 'bg-[#0f0f0f] border border-[#333] text-gray-400 hover:border-violet-500 disabled:opacity-40'}`}>
                  {v >= 1000 ? `${v/1000}K` : v}
                </button>
              ))}
            </div>
          </div>

          {/* Количество мин */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400 font-medium">Мины</label>
              <span className="text-red-400 font-bold text-sm">💣 {mineCount} мин</span>
            </div>
            <div className="flex gap-2">
              {MINE_COUNTS.map((v) => (
                <button key={v} onClick={() => setMineCount(v)} disabled={gameState === 'playing'}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mineCount === v ? 'bg-red-700 text-white border-red-500' : 'bg-[#0f0f0f] border border-[#333] text-gray-400 hover:border-red-500 disabled:opacity-40'} border`}>
                  {v}
                </button>
              ))}
            </div>
            <p className="text-gray-600 text-xs mt-2 text-center">
              Безопасных: {GRID - mineCount} · Старт x{calcMultiplier(1, mineCount).toFixed(2)} · Макс x{calcMultiplier(GRID - mineCount, mineCount).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Кнопки */}
        {gameState === 'idle' || gameState === 'dead' || gameState === 'won' ? (
          <button onClick={startGame} disabled={(user?.balance || 0) < bet}
            className="w-full bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-500 hover:to-violet-700 disabled:opacity-50 text-white font-black text-lg rounded-xl py-5 transition-all active:scale-95 shadow-lg shadow-violet-900/40">
            {gameState === 'idle' ? '💣 Начать игру' : '🔄 Играть снова'}
          </button>
        ) : (
          <button onClick={cashOut} disabled={revealed.size === 0}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-40 text-white font-black text-lg rounded-xl py-5 transition-all active:scale-95 shadow-lg shadow-green-900/40">
            {revealed.size === 0
              ? '← Открой клетку!'
              : `💸 Забрать ${currentWin.toLocaleString()} ₽ (x${mult.toFixed(2)})`}
          </button>
        )}

        {gameState === 'playing' && (
          <p className="text-gray-600 text-xs text-center mt-2">
            Открыто: {revealed.size} · Осталось безопасных: {safeLeft}
          </p>
        )}
      </div>
    </div>
  )
}
