import { useState, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'

const RED = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
const WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26]

function getColor(n: number) {
  if (n === 0) return 'green'
  return RED.includes(n) ? 'red' : 'black'
}

interface Bet { type: string; label: string; amount: number; payout: number }

function calcWin(bets: Bet[], result: number): number {
  let total = 0
  const col = getColor(result)
  bets.forEach(b => {
    let win = false
    if (b.type === `n${result}`) win = true
    if (b.type === 'red' && col === 'red') win = true
    if (b.type === 'black' && col === 'black') win = true
    if (b.type === 'even' && result !== 0 && result % 2 === 0) win = true
    if (b.type === 'odd' && result % 2 === 1) win = true
    if (b.type === 'low' && result >= 1 && result <= 18) win = true
    if (b.type === 'high' && result >= 19) win = true
    if (b.type === 'd1' && result >= 1 && result <= 12) win = true
    if (b.type === 'd2' && result >= 13 && result <= 24) win = true
    if (b.type === 'd3' && result >= 25) win = true
    if (win) total += b.amount * (b.payout + 1)
  })
  return total
}

const CHIPS = [50, 100, 500, 1000, 5000]

export function RouletteGame({ onClose }: { onClose: () => void }) {
  const { user, updateBalance } = useAppStore()
  const [chip, setChip] = useState(100)
  const [bets, setBets] = useState<Bet[]>([])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [rotation, setRotation] = useState(0)
  const rotRef = useRef(0)

  const totalBet = bets.reduce((s, b) => s + b.amount, 0)

  const addBet = (type: string, label: string, payout: number) => {
    if ((user?.balance || 0) < chip) return
    updateBalance(-chip)
    setBets(prev => {
      const ex = prev.find(b => b.type === type)
      if (ex) return prev.map(b => b.type === type ? { ...b, amount: b.amount + chip } : b)
      return [...prev, { type, label, amount: chip, payout }]
    })
  }

  const clearBets = () => {
    updateBalance(totalBet)
    setBets([])
  }

  const spin = () => {
    if (!bets.length || spinning) return
    setSpinning(true)
    setResult(null)
    setMessage('')

    const outcome = Math.floor(Math.random() * 37)
    const outcomeIdx = WHEEL_ORDER.indexOf(outcome)
    const segDeg = 360 / 37
    const targetSeg = outcomeIdx * segDeg + segDeg / 2
    const spins = 8 + Math.random() * 4
    const newRot = rotRef.current + spins * 360 + (360 - targetSeg - rotRef.current % 360)
    rotRef.current = newRot
    setRotation(newRot)

    setTimeout(() => {
      setSpinning(false)
      setResult(outcome)
      const win = calcWin(bets, outcome)
      if (win > 0) {
        updateBalance(win)
        const profit = win - totalBet
        setMessage(`🎉 ${outcome} ${getColor(outcome) === 'red' ? '🔴' : getColor(outcome) === 'black' ? '⚫' : '🟢'} — Выигрыш ${win.toLocaleString()} ₽ (+${profit.toLocaleString()} ₽)`)
      } else {
        setMessage(`😔 ${outcome} ${getColor(outcome) === 'red' ? '🔴' : getColor(outcome) === 'black' ? '⚫' : '🟢'} — Не угадали. Потеряно ${totalBet.toLocaleString()} ₽`)
      }
      setBets([])
    }, 5000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] overflow-y-auto">
      <div className="min-h-screen p-4 flex flex-col max-w-2xl mx-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-gray-400 hover:text-white bg-[#1a1a1a] border border-[#333] rounded-xl p-2 text-sm">← Назад</button>
            <div>
              <h1 className="text-white font-bold text-xl">🎡 European Roulette</h1>
              <p className="text-gray-500 text-xs">RTP 97.3% · 1 нулевое поле</p>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-white font-bold text-sm">
            💰 {(user?.balance || 0).toLocaleString()} ₽
          </div>
        </div>

        {/* Колесо */}
        <div className="flex justify-center mb-5 relative">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 rounded-full border-4 border-yellow-600/60 shadow-2xl shadow-yellow-900/30" />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 240"
              style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 5s cubic-bezier(0.15,0.6,0.1,1)' : 'none' }}>
              {WHEEL_ORDER.map((num, i) => {
                const a1 = ((i * 360/37 - 90) * Math.PI) / 180
                const a2 = (((i+1) * 360/37 - 90) * Math.PI) / 180
                const r = 115
                const x1 = 120 + r * Math.cos(a1), y1 = 120 + r * Math.sin(a1)
                const x2 = 120 + r * Math.cos(a2), y2 = 120 + r * Math.sin(a2)
                const mid = (i + 0.5) * 360/37
                const tr = 88
                const tx = 120 + tr * Math.cos((mid-90)*Math.PI/180)
                const ty = 120 + tr * Math.sin((mid-90)*Math.PI/180)
                const fill = num===0 ? '#16a34a' : RED.includes(num) ? '#b91c1c' : '#1c1c1c'
                return (
                  <g key={num}>
                    <path d={`M 120 120 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`} fill={fill} stroke="#111" strokeWidth="0.8"/>
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="700"
                      transform={`rotate(${mid},${tx},${ty})`}>{num}</text>
                  </g>
                )
              })}
              <circle cx="120" cy="120" r="25" fill="#0a0a0a" stroke="#d97706" strokeWidth="3"/>
              <circle cx="120" cy="120" r="13" fill="#d97706"/>
            </svg>
            {/* Шарик */}
            <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ transform: `translate(-50%,-50%) rotate(${-rotation * 1.3}deg)`, transition: spinning ? 'transform 5s cubic-bezier(0.15,0.6,0.1,1)' : 'none' }}>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-white/60 border-2 border-gray-300"/>
            </div>
            {/* Стрелка */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-400 text-xl z-10">▼</div>
            {/* Результат */}
            {result !== null && !spinning && (
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl border-2 shadow-xl ${
                  result===0 ? 'bg-green-600 border-green-400 shadow-green-500/50' :
                  RED.includes(result) ? 'bg-red-600 border-red-400 shadow-red-500/50' :
                  'bg-gray-800 border-gray-500'}`}>{result}</div>
              </div>
            )}
          </div>
        </div>

        {/* Сообщение */}
        {message && (
          <div className={`text-center text-sm font-bold px-4 py-3 rounded-xl mb-4 ${message.includes('🎉') ? 'bg-green-500/15 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* Ставки сводка */}
        {bets.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {bets.map(b => (
              <span key={b.type} className="text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2 py-1 rounded-full">
                {b.label}: {b.amount} ₽
              </span>
            ))}
          </div>
        )}

        {/* Фишки */}
        <div className="flex gap-2 mb-4 justify-center">
          {CHIPS.map(v => (
            <button key={v} onClick={() => setChip(v)}
              className={`w-14 h-14 rounded-full text-xs font-black border-2 transition-all ${chip===v ? 'border-yellow-400 bg-yellow-600 text-black scale-110 shadow-lg shadow-yellow-600/30' : 'border-[#444] bg-[#1a1a1a] text-white hover:border-yellow-500/50'}`}>
              {v>=1000 ? `${v/1000}K` : v}
            </button>
          ))}
        </div>

        {/* Поле ставок */}
        <div className="bg-[#0a1a0a] border border-green-900/40 rounded-2xl p-3 mb-4">
          {/* Зеро */}
          <div className="flex justify-center mb-2">
            <button onClick={() => addBet('n0','0',35)} className="w-16 h-10 rounded-lg bg-green-700 hover:bg-green-600 text-white font-black text-sm border border-green-500 transition-all hover:scale-105 active:scale-95">
              0
            </button>
          </div>
          {/* Числа */}
          <div className="grid grid-cols-12 gap-1 mb-2">
            {Array.from({length:36},(_,i)=>i+1).map(n => {
              const hasBet = bets.some(b => b.type===`n${n}`)
              return (
                <button key={n} onClick={() => addBet(`n${n}`,String(n),35)}
                  className={`h-8 rounded text-white text-xs font-bold transition-all hover:scale-110 active:scale-95 border ${
                    RED.includes(n) ? 'bg-red-700 border-red-600 hover:bg-red-500' : 'bg-[#1c1c1c] border-[#333] hover:bg-[#2a2a2a]'
                  } ${hasBet ? 'ring-2 ring-yellow-400' : ''}`}>
                  {n}
                </button>
              )
            })}
          </div>
          {/* Дюжины */}
          <div className="grid grid-cols-3 gap-1 mb-2">
            {[['d1','1–12 (2:1)',2],['d2','13–24 (2:1)',2],['d3','25–36 (2:1)',2]].map(([t,l,p]) => (
              <button key={String(t)} onClick={() => addBet(String(t),String(l),Number(p))}
                className={`py-2 rounded-lg text-white text-xs font-semibold border transition-all hover:scale-105 active:scale-95 ${bets.some(b=>b.type===t) ? 'border-yellow-400 bg-yellow-600/20' : 'border-[#333] bg-[#1a1a1a] hover:border-yellow-500/40'}`}>
                {l}
              </button>
            ))}
          </div>
          {/* Внешние */}
          <div className="grid grid-cols-6 gap-1">
            {[
              ['low','1–18',1],['even','Чёт',1],['red','🔴 Красное',1],
              ['black','⚫ Чёрное',1],['odd','Нечёт',1],['high','19–36',1]
            ].map(([t,l,p]) => (
              <button key={String(t)} onClick={() => addBet(String(t),String(l),Number(p))}
                className={`py-2 rounded-lg text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${
                  t==='red' ? 'bg-red-700 border-red-600 text-white hover:bg-red-600' :
                  t==='black' ? 'bg-[#111] border-[#444] text-white hover:bg-[#222]' :
                  bets.some(b=>b.type===t) ? 'border-yellow-400 bg-yellow-600/20 text-yellow-300' :
                  'border-[#333] bg-[#1a1a1a] text-white hover:border-violet-500/50'
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button onClick={clearBets} disabled={spinning || !bets.length}
            className="flex-1 border border-[#333] text-gray-400 hover:bg-[#1a1a1a] disabled:opacity-30 rounded-xl py-4 font-semibold transition-all">
            ✕ Убрать ({totalBet.toLocaleString()} ₽)
          </button>
          <button onClick={spin} disabled={spinning || !bets.length}
            className="flex-[2] bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-40 text-white font-black text-lg rounded-xl py-4 transition-all active:scale-95 shadow-lg shadow-red-900/40">
            {spinning ? '🌀 Крутится...' : '🎡 SPIN!'}
          </button>
        </div>
      </div>
    </div>
  )
}
