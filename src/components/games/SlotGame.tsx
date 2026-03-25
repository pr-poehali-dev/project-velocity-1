import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

const SYMBOLS = [
  { id: 'seven', emoji: '7️⃣', name: 'Семёрка', mult: 50, color: 'text-red-400' },
  { id: 'diamond', emoji: '💎', name: 'Бриллиант', mult: 20, color: 'text-cyan-400' },
  { id: 'crown', emoji: '👑', name: 'Корона', mult: 15, color: 'text-yellow-400' },
  { id: 'star', emoji: '⭐', name: 'Звезда', mult: 10, color: 'text-yellow-300' },
  { id: 'cherry', emoji: '🍒', name: 'Вишня', mult: 8, color: 'text-red-300' },
  { id: 'lemon', emoji: '🍋', name: 'Лимон', mult: 5, color: 'text-yellow-200' },
  { id: 'grape', emoji: '🍇', name: 'Виноград', mult: 4, color: 'text-purple-400' },
  { id: 'bell', emoji: '🔔', name: 'Колокол', mult: 6, color: 'text-orange-400' },
  { id: 'horseshoe', emoji: '🧲', name: 'Подкова', mult: 3, color: 'text-gray-400' },
  { id: 'watermelon', emoji: '🍉', name: 'Арбуз', mult: 3, color: 'text-green-400' },
]

const REEL_SIZE = 20
const VISIBLE = 3

function buildReel(): string[] {
  const reel: string[] = []
  for (let i = 0; i < REEL_SIZE; i++) {
    const weights = [1, 2, 2, 3, 4, 5, 5, 4, 6, 6]
    const total = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    let idx = 0
    for (let j = 0; j < weights.length; j++) {
      r -= weights[j]
      if (r <= 0) { idx = j; break }
    }
    reel.push(SYMBOLS[idx].id)
  }
  return reel
}

function getSymbol(id: string) {
  return SYMBOLS.find((s) => s.id === id) || SYMBOLS[0]
}

function checkWin(rows: string[][], bet: number): { amount: number; lines: number[] } {
  let amount = 0
  const lines: number[] = []
  for (let row = 0; row < 3; row++) {
    const line = rows[row]
    if (line[0] === line[1] && line[1] === line[2]) {
      const sym = getSymbol(line[0])
      amount += bet * sym.mult
      lines.push(row)
    } else if (line[0] === line[1]) {
      amount += bet * Math.floor(getSymbol(line[0]).mult / 4)
    } else if (line[1] === line[2]) {
      amount += bet * Math.floor(getSymbol(line[1]).mult / 4)
    }
  }
  // Диагонали
  const grid = rows
  if (grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
    amount += bet * getSymbol(grid[1][1]).mult
    lines.push(3)
  }
  if (grid[2][0] === grid[1][1] && grid[1][1] === grid[0][2]) {
    amount += bet * getSymbol(grid[1][1]).mult
    lines.push(4)
  }
  return { amount, lines }
}

interface ReelState {
  symbols: string[]
  offset: number
  spinning: boolean
  finalOffset: number
}

const CHIP_BETS = [50, 100, 250, 500]

export function SlotGame({ onClose, gameName = 'Book of Dead' }: { onClose: () => void; gameName?: string }) {
  const { user, updateBalance } = useAppStore()
  const [bet, setBet] = useState(100)
  const [reels, setReels] = useState<ReelState[]>(() =>
    Array.from({ length: 3 }, () => ({ symbols: buildReel(), offset: 0, spinning: false, finalOffset: 0 }))
  )
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ amount: number; lines: number[] } | null>(null)
  const [message, setMessage] = useState('')
  const [autoSpin, setAutoSpin] = useState(false)
  const autoRef = useRef(false)
  const animFrames = useRef<number[]>([])
  const [displaySymbols, setDisplaySymbols] = useState<string[][]>(() =>
    Array.from({ length: 3 }, () => ['cherry', 'lemon', 'grape'])
  )
  const [winLines, setWinLines] = useState<number[]>([])

  useEffect(() => {
    return () => { autoRef.current = false; animFrames.current.forEach(cancelAnimationFrame) }
  }, [])

  const getVisibleSymbols = (reel: string[], offset: number): string[] => {
    const len = reel.length
    const start = Math.floor(offset) % len
    return [
      reel[(start) % len],
      reel[(start + 1) % len],
      reel[(start + 2) % len],
    ]
  }

  const doSpin = () => {
    if (spinning) return
    if ((user?.balance || 0) < bet) { setMessage('❌ Недостаточно средств'); return }
    updateBalance(-bet)
    setSpinning(true)
    setResult(null)
    setMessage('')
    setWinLines([])

    const newReels = reels.map((r) => ({ ...r, symbols: buildReel(), spinning: true }))
    const finalOffsets = newReels.map(() => Math.floor(Math.random() * REEL_SIZE))
    setReels(newReels)

    const startTime = Date.now()
    const stopTimes = [1800, 2400, 3000]
    const stopped = [false, false, false]
    const currentOffsets = newReels.map((r) => r.offset)

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime

      setDisplaySymbols((prev) => {
        const next = prev.map((col, i) => {
          if (stopped[i]) return col
          currentOffsets[i] = (currentOffsets[i] + 0.5) % REEL_SIZE
          return getVisibleSymbols(newReels[i].symbols, currentOffsets[i])
        })
        return next
      })

      stopTimes.forEach((t, i) => {
        if (!stopped[i] && elapsed >= t) {
          stopped[i] = true
          const final = getVisibleSymbols(newReels[i].symbols, finalOffsets[i])
          setDisplaySymbols((prev) => prev.map((col, j) => j === i ? final : col))
        }
      })

      if (!stopped[2]) {
        animFrames.current[0] = requestAnimationFrame(animate)
      } else {
        setTimeout(() => {
          const grid = [0, 1, 2].map((col) => getVisibleSymbols(newReels[col].symbols, finalOffsets[col]))
          const rows: string[][] = [
            [grid[0][0], grid[1][0], grid[2][0]],
            [grid[0][1], grid[1][1], grid[2][1]],
            [grid[0][2], grid[1][2], grid[2][2]],
          ]
          const win = checkWin(rows, bet)
          setSpinning(false)
          setWinLines(win.lines)
          if (win.amount > 0) {
            updateBalance(win.amount)
            setMessage(`🎉 ВЫИГРЫШ ${win.amount.toLocaleString()} ₽!`)
            setResult({ amount: win.amount, lines: win.lines })
          } else {
            setMessage('Попробуй ещё раз!')
            setResult({ amount: 0, lines: [] })
            if (autoRef.current) {
              setTimeout(() => { if (autoRef.current) doSpin() }, 800)
            }
          }
          if (win.amount > 0 && autoRef.current) {
            setTimeout(() => { if (autoRef.current) doSpin() }, 1200)
          }
        }, 200)
      }
    }

    animFrames.current[0] = requestAnimationFrame(animate)
  }

  const toggleAuto = () => {
    const next = !autoSpin
    setAutoSpin(next)
    autoRef.current = next
    if (next && !spinning) doSpin()
  }

  const winMultiplier = result ? (result.amount / bet) : 0

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] overflow-y-auto">
      <div className="min-h-screen p-4 flex flex-col max-w-lg mx-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-gray-400 hover:text-white bg-[#1a1a1a] border border-[#333] rounded-xl p-2">
              ← Назад
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">🎰 {gameName}</h1>
              <p className="text-gray-500 text-xs">RTP 96.2% · Play'n GO</p>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-white font-bold text-sm">
            💰 {(user?.balance || 0).toLocaleString()} ₽
          </div>
        </div>

        {/* Слот-машина */}
        <div className="bg-gradient-to-b from-[#1a0a2e] to-[#0d0d1a] border-2 border-violet-800/60 rounded-3xl p-5 mb-4 shadow-2xl shadow-violet-900/40">
          {/* Декоративная рамка */}
          <div className="text-center mb-3">
            <span className="text-yellow-400 text-lg font-bold tracking-widest">✦ LUCKY ACE ✦</span>
          </div>

          {/* Барабаны */}
          <div className="flex gap-2 mb-3">
            {[0, 1, 2].map((col) => (
              <div key={col} className={`flex-1 bg-[#0a0a16] border-2 rounded-xl overflow-hidden transition-all ${
                spinning ? 'border-violet-500/50' : winLines.length > 0 ? 'border-yellow-400/60' : 'border-[#2a2a4a]'
              }`}>
                {displaySymbols[col].map((symId, row) => {
                  const sym = getSymbol(symId)
                  const isWinLine = winLines.includes(row)
                  return (
                    <div key={row} className={`flex items-center justify-center h-20 transition-all ${
                      isWinLine ? 'bg-yellow-400/10 border-y border-yellow-400/30' : ''
                    } ${spinning ? 'blur-[1px]' : ''}`}>
                      <span className={`text-4xl transition-transform ${spinning ? 'scale-90' : isWinLine ? 'scale-110' : 'scale-100'}`}>
                        {sym.emoji}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Линии выплат */}
          <div className="flex justify-center gap-1 mb-3">
            {[0,1,2].map((i) => (
              <div key={i} className={`h-0.5 flex-1 rounded-full transition-all ${winLines.includes(i) ? 'bg-yellow-400' : 'bg-[#333]'}`} />
            ))}
          </div>

          {/* Сообщение о выигрыше */}
          <div className={`text-center h-10 flex items-center justify-center`}>
            {message ? (
              <span className={`text-sm font-bold ${message.includes('🎉') ? 'text-yellow-400' : 'text-gray-400'}`}>
                {message}
                {winMultiplier > 0 && <span className="ml-2 text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full">x{winMultiplier}</span>}
              </span>
            ) : (
              <span className="text-gray-600 text-sm">Нажми SPIN!</span>
            )}
          </div>
        </div>

        {/* Таблица выплат (свёрнутая) */}
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 mb-4">
          <p className="text-gray-500 text-xs mb-2 font-medium uppercase tracking-wide">Таблица выплат (3 одинаковых)</p>
          <div className="grid grid-cols-2 gap-1">
            {SYMBOLS.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span>{s.emoji} {s.name}</span>
                <span className="text-yellow-400 font-bold">x{s.mult}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ставка */}
        <div className="flex items-center justify-between bg-[#141414] border border-[#262626] rounded-xl p-3 mb-4">
          <span className="text-gray-400 text-sm">Ставка:</span>
          <div className="flex gap-2">
            {CHIP_BETS.map((v) => (
              <button key={v} onClick={() => setBet(v)} disabled={spinning}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${bet === v ? 'bg-violet-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-[#333] hover:border-violet-500'}`}>
                {v}₽
              </button>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <Button onClick={toggleAuto}
            className={`flex-1 rounded-xl py-5 font-bold text-sm ${autoSpin ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#1a1a1a] border border-[#333] text-gray-300 hover:bg-[#222] hover:text-white'}`}>
            {autoSpin ? '⏹ Стоп' : '🔁 Авто'}
          </Button>
          <Button onClick={doSpin} disabled={spinning}
            className="flex-[2] bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-500 hover:to-violet-700 text-white rounded-xl py-5 text-lg font-black disabled:opacity-50 shadow-lg shadow-violet-900/40">
            {spinning ? '🌀 ...' : '▶ SPIN'}
          </Button>
          <Button onClick={() => { setBet(Math.min(bet * 2, 500)) }} disabled={spinning} variant="outline"
            className="flex-1 border-[#333] text-gray-400 hover:bg-[#1a1a1a] rounded-xl py-5 text-xs font-bold">
            BET MAX
          </Button>
        </div>
      </div>
    </div>
  )
}
