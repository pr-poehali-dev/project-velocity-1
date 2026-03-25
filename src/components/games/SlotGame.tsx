import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'

const SYMS = [
  { id: '7',    emoji: '7️⃣', mult3: 100, mult2: 5  },
  { id: 'bar3', emoji: '📊', mult3: 50,  mult2: 3  },
  { id: 'diam', emoji: '💎', mult3: 30,  mult2: 2  },
  { id: 'crown',emoji: '👑', mult3: 20,  mult2: 2  },
  { id: 'star', emoji: '⭐', mult3: 15,  mult2: 1  },
  { id: 'bell', emoji: '🔔', mult3: 10,  mult2: 1  },
  { id: 'cherry',emoji:'🍒', mult3: 8,   mult2: 1  },
  { id: 'lemon',emoji: '🍋', mult3: 5,   mult2: 0  },
  { id: 'grape',emoji: '🍇', mult3: 4,   mult2: 0  },
  { id: 'water',emoji: '🍉', mult3: 3,   mult2: 0  },
]

// Взвешенный пул — редкие символы реже
const POOL = [
  '7','7',
  'bar3','bar3','bar3',
  'diam','diam','diam','diam',
  'crown','crown','crown','crown','crown',
  'star','star','star','star','star','star',
  'bell','bell','bell','bell','bell','bell','bell',
  'cherry','cherry','cherry','cherry','cherry','cherry','cherry','cherry',
  'lemon','lemon','lemon','lemon','lemon','lemon','lemon','lemon','lemon',
  'grape','grape','grape','grape','grape','grape','grape','grape','grape','grape',
  'water','water','water','water','water','water','water','water','water','water',
]

function randSym() { return POOL[Math.floor(Math.random() * POOL.length)] }
function getSym(id: string) { return SYMS.find(s => s.id === id)! }

function calcWin(grid: string[][], bet: number): { total: number; lines: {row: number; mult: number; sym: string}[] } {
  const lines: {row: number; mult: number; sym: string}[] = []
  let total = 0
  for (let r = 0; r < 3; r++) {
    const row = [grid[0][r], grid[1][r], grid[2][r]]
    if (row[0] === row[1] && row[1] === row[2]) {
      const s = getSym(row[0])
      const win = bet * s.mult3
      total += win
      lines.push({ row: r, mult: s.mult3, sym: row[0] })
    } else if (row[0] === row[1]) {
      const s = getSym(row[0])
      if (s.mult2 > 0) { total += bet * s.mult2; lines.push({ row: r, mult: s.mult2, sym: row[0] }) }
    } else if (row[1] === row[2]) {
      const s = getSym(row[1])
      if (s.mult2 > 0) { total += bet * s.mult2; lines.push({ row: r, mult: s.mult2, sym: row[1] }) }
    }
  }
  return { total, lines }
}

const ROWS = 3
const REEL_LEN = 30

function makeReel(): string[] {
  return Array.from({ length: REEL_LEN }, () => randSym())
}

const BETS = [50, 100, 250, 500, 1000, 2500]

export function SlotGame({ onClose, gameName = 'Book of Dead' }: { onClose: () => void; gameName?: string }) {
  const { user, updateBalance } = useAppStore()
  const [bet, setBet] = useState(100)
  const [reels] = useState<string[][]>(() => [makeReel(), makeReel(), makeReel()])
  const [offsets, setOffsets] = useState([0, 0, 0])
  const [display, setDisplay] = useState<string[][]>(() => [[randSym(),randSym(),randSym()],[randSym(),randSym(),randSym()],[randSym(),randSym(),randSym()]])
  const [spinning, setSpinning] = useState(false)
  const [winLines, setWinLines] = useState<{row:number;mult:number;sym:string}[]>([])
  const [message, setMessage] = useState('')
  const [lastWin, setLastWin] = useState(0)
  const [autoOn, setAutoOn] = useState(false)
  const autoRef = useRef(false)
  const rafRef = useRef<number>(0)
  const speedRef = useRef([0, 0, 0])
  const posRef = useRef([0, 0, 0])
  const stoppedRef = useRef([false, false, false])
  const finalRef = useRef([[0,1,2],[0,1,2],[0,1,2]])

  const getVisible = useCallback((reelIdx: number, offset: number): string[] => {
    const r = reels[reelIdx]
    const start = Math.floor(offset) % REEL_LEN
    return [r[(start) % REEL_LEN], r[(start+1) % REEL_LEN], r[(start+2) % REEL_LEN]]
  }, [reels])

  const doSpin = useCallback(() => {
    if (spinning) return
    if ((user?.balance || 0) < bet) { setMessage('❌ Недостаточно средств'); return }
    updateBalance(-bet)
    setSpinning(true)
    setWinLines([])
    setMessage('')
    setLastWin(0)

    // Выбираем финальные позиции
    const finals = [0,1,2].map(() => Math.floor(Math.random() * REEL_LEN))
    finalRef.current = finals.map((f, i) => [reels[i][f % REEL_LEN], reels[i][(f+1)%REEL_LEN], reels[i][(f+2)%REEL_LEN]] as unknown as number[])
    const finalSyms = finals.map((f, i) => [reels[i][f%REEL_LEN], reels[i][(f+1)%REEL_LEN], reels[i][(f+2)%REEL_LEN]])

    stoppedRef.current = [false, false, false]
    speedRef.current = [1.2, 1.2, 1.2]
    posRef.current = [...offsets]

    const stopTimes = [1500, 2200, 2900]
    const startT = Date.now()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startT

      const newPos = posRef.current.map((p, i) => {
        if (stoppedRef.current[i]) return p
        if (elapsed >= stopTimes[i] && !stoppedRef.current[i]) {
          stoppedRef.current[i] = true
          return finals[i]
        }
        return (p + speedRef.current[i]) % REEL_LEN
      })

      posRef.current = newPos
      setDisplay(newPos.map((p, i) => getVisible(i, p)))
      setOffsets(newPos)

      if (stoppedRef.current.every(Boolean)) {
        // Финальный кадр
        setDisplay(finalSyms)
        const grid = finalSyms
        const { total, lines } = calcWin(grid, bet)
        setWinLines(lines)
        setLastWin(total)
        if (total > 0) {
          updateBalance(total)
          setMessage(`🎉 ВЫИГРЫШ! +${total.toLocaleString()} ₽ (x${(total/bet).toFixed(1)})`)
        } else {
          setMessage('Попробуй снова!')
          if (autoRef.current) setTimeout(() => { if (autoRef.current) doSpin() }, 600)
        }
        if (total > 0 && autoRef.current) setTimeout(() => { if (autoRef.current) doSpin() }, 1000)
        setSpinning(false)
        return
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [spinning, user, bet, offsets, reels, getVisible, updateBalance])

  useEffect(() => { return () => { cancelAnimationFrame(rafRef.current); autoRef.current = false } }, [])

  const toggleAuto = () => {
    const next = !autoOn
    setAutoOn(next)
    autoRef.current = next
    if (next && !spinning) doSpin()
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] overflow-y-auto">
      <div className="min-h-screen p-4 flex flex-col max-w-md mx-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-gray-400 hover:text-white bg-[#1a1a1a] border border-[#333] rounded-xl p-2 text-sm">← Назад</button>
            <div>
              <h1 className="text-white font-bold text-lg">🎰 {gameName}</h1>
              <p className="text-gray-500 text-xs">RTP 96.5% · 3 барабана · 3 линии</p>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-white font-bold text-sm">
            💰 {(user?.balance || 0).toLocaleString()} ₽
          </div>
        </div>

        {/* Машина */}
        <div className="bg-gradient-to-b from-[#1a0630] to-[#0d0518] border-2 border-violet-700/50 rounded-3xl p-5 mb-4 shadow-2xl shadow-violet-900/50">
          <div className="text-center mb-3">
            <span className="text-yellow-400 font-black tracking-widest text-sm">✦ LUCKY ACE SLOTS ✦</span>
          </div>

          {/* Барабаны */}
          <div className="flex gap-2 mb-2">
            {[0,1,2].map(col => (
              <div key={col} className={`flex-1 bg-[#06020f] border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                spinning && !stoppedRef.current[col] ? 'border-violet-500/80 shadow-inner shadow-violet-900' :
                winLines.length > 0 ? 'border-yellow-500/60' : 'border-violet-900/40'
              }`}>
                {display[col].map((symId, row) => {
                  const sym = getSym(symId)
                  const isWin = winLines.some(l => l.row === row)
                  return (
                    <div key={row} className={`flex items-center justify-center h-20 transition-all ${
                      isWin ? 'bg-yellow-400/15' : ''
                    } ${spinning && !stoppedRef.current[col] ? 'blur-[1.5px]' : ''}`}>
                      <span className={`text-4xl select-none transition-transform duration-200 ${
                        isWin ? 'scale-125 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' :
                        spinning ? 'scale-90' : 'scale-100'
                      }`}>{sym.emoji}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Линии выплат */}
          <div className="flex flex-col gap-1">
            {[0,1,2].map(r => (
              <div key={r} className={`h-0.5 rounded-full transition-all ${winLines.some(l=>l.row===r) ? 'bg-yellow-400 shadow shadow-yellow-400/50' : 'bg-[#2a1a4a]'}`}/>
            ))}
          </div>

          {/* Выигрышное сообщение */}
          <div className="h-12 flex items-center justify-center mt-2">
            {message ? (
              <div className={`text-sm font-bold px-3 py-1 rounded-xl ${message.includes('🎉') ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-500/20' : 'text-gray-500'}`}>
                {message}
                {lastWin > 0 && <span className="ml-2 text-xs bg-yellow-600/30 text-yellow-300 px-1.5 py-0.5 rounded-full">x{(lastWin/bet).toFixed(1)}</span>}
              </div>
            ) : <span className="text-gray-700 text-sm">Нажми SPIN!</span>}
          </div>
        </div>

        {/* Таблица выплат */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-3 mb-4">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Таблица выплат × ставку</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {SYMS.map(s => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{s.emoji} × 3</span>
                <span className="text-yellow-400 font-bold">x{s.mult3}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ставка */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Ставка:</span>
            <span className="text-white font-bold">{bet.toLocaleString()} ₽</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {BETS.map(v => (
              <button key={v} onClick={() => setBet(v)} disabled={spinning}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${bet===v ? 'bg-violet-600 text-white' : 'bg-[#0f0f0f] border border-[#333] text-gray-400 hover:border-violet-500 disabled:opacity-40'}`}>
                {v>=1000?`${v/1000}K`:v}
              </button>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button onClick={toggleAuto}
            className={`flex-1 rounded-xl py-5 font-bold text-sm transition-all ${autoOn ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-[#1a1a1a] border border-[#333] text-gray-400 hover:text-white hover:bg-[#222]'}`}>
            {autoOn ? '⏹ Стоп' : '🔁 Авто'}
          </button>
          <button onClick={doSpin} disabled={spinning}
            className="flex-[2] bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 disabled:opacity-50 text-white rounded-xl py-5 font-black text-xl transition-all active:scale-95 shadow-xl shadow-violet-900/50">
            {spinning ? '🌀' : '▶ SPIN'}
          </button>
          <button onClick={() => setBet(BETS[BETS.length-1])} disabled={spinning} className="flex-1 bg-[#1a1a1a] border border-[#333] text-gray-400 hover:text-white rounded-xl py-5 text-xs font-bold hover:bg-[#222] disabled:opacity-40 transition-all">
            MAX<br/>BET
          </button>
        </div>
      </div>
    </div>
  )
}
