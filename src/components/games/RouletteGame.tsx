import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
const NUMBERS = Array.from({ length: 37 }, (_, i) => i)

type BetType = 'number' | 'red' | 'black' | 'even' | 'odd' | 'low' | 'high' | '1st12' | '2nd12' | '3rd12'

interface Bet {
  type: BetType
  value: number | string
  amount: number
  label: string
}

function getColor(n: number) {
  if (n === 0) return 'green'
  return RED_NUMBERS.includes(n) ? 'red' : 'black'
}

function calcWin(bet: Bet, result: number): number {
  const c = getColor(result)
  if (bet.type === 'number' && bet.value === result) return bet.amount * 35
  if (bet.type === 'red' && c === 'red') return bet.amount
  if (bet.type === 'black' && c === 'black') return bet.amount
  if (bet.type === 'even' && result !== 0 && result % 2 === 0) return bet.amount
  if (bet.type === 'odd' && result % 2 === 1) return bet.amount
  if (bet.type === 'low' && result >= 1 && result <= 18) return bet.amount
  if (bet.type === 'high' && result >= 19 && result <= 36) return bet.amount
  if (bet.type === '1st12' && result >= 1 && result <= 12) return bet.amount * 2
  if (bet.type === '2nd12' && result >= 13 && result <= 24) return bet.amount * 2
  if (bet.type === '3rd12' && result >= 25 && result <= 36) return bet.amount * 2
  return -bet.amount
}

const CHIP_VALUES = [50, 100, 500, 1000]

export function RouletteGame({ onClose }: { onClose: () => void }) {
  const { user, updateBalance } = useAppStore()
  const [selectedChip, setSelectedChip] = useState(100)
  const [bets, setBets] = useState<Bet[]>([])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [winMessage, setWinMessage] = useState('')
  const [ballAngle, setBallAngle] = useState(0)
  const [wheelRotation, setWheelRotation] = useState(0)
  const wheelRef = useRef(0)
  const ballRef = useRef(0)

  const totalBet = bets.reduce((s, b) => s + b.amount, 0)

  const addBet = (type: BetType, value: number | string, label: string) => {
    if ((user?.balance || 0) < selectedChip) return
    setBets((prev) => {
      const existing = prev.find((b) => b.type === type && b.value === value)
      if (existing) return prev.map((b) => b.type === type && b.value === value ? { ...b, amount: b.amount + selectedChip } : b)
      return [...prev, { type, value, label, amount: selectedChip }]
    })
  }

  const clearBets = () => setBets([])

  const spin = () => {
    if (bets.length === 0 || spinning) return
    updateBalance(-totalBet)
    setSpinning(true)
    setResult(null)
    setWinMessage('')

    const outcome = Math.floor(Math.random() * 37)
    const spins = 5 + Math.random() * 3
    const newWheel = wheelRef.current + spins * 360
    const newBall = ballRef.current - spins * 360 * 1.4
    wheelRef.current = newWheel
    ballRef.current = newBall
    setWheelRotation(newWheel)
    setBallAngle(newBall)

    setTimeout(() => {
      setResult(outcome)
      setSpinning(false)
      let totalWin = 0
      bets.forEach((bet) => {
        const w = calcWin(bet, outcome)
        if (w > 0) totalWin += w + bet.amount
      })
      if (totalWin > 0) {
        updateBalance(totalWin)
        setWinMessage(`🎉 Выпало ${outcome}! Вы выиграли ${totalWin.toLocaleString()} ₽!`)
      } else {
        setWinMessage(`😔 Выпало ${outcome}. Удачи в следующий раз!`)
      }
      setBets([])
    }, 4500)
  }

  const rouletteOrder = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26]

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] overflow-y-auto">
      <div className="min-h-screen p-4 flex flex-col max-w-4xl mx-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-gray-400 hover:text-white bg-[#1a1a1a] border border-[#333] rounded-xl p-2">
              ← Назад
            </button>
            <div>
              <h1 className="text-white font-bold text-xl">🎡 European Roulette</h1>
              <p className="text-gray-500 text-xs">RTP 97.3% · NetEnt</p>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2 text-white font-bold">
            💰 {(user?.balance || 0).toLocaleString()} ₽
          </div>
        </div>

        {/* Колесо рулетки */}
        <div className="flex justify-center mb-6">
          <div className="relative w-56 h-56">
            {/* Внешнее кольцо */}
            <div className="absolute inset-0 rounded-full border-4 border-yellow-600 bg-[#1a1a1a]" />

            {/* Колесо с цветными секторами */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 200 200"
              style={{ transform: `rotate(${wheelRotation}deg)`, transition: spinning ? 'transform 4.5s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }}
            >
              {rouletteOrder.map((num, i) => {
                const angle = (360 / 37) * i
                const rad = (angle * Math.PI) / 180
                const nextRad = (((angle + 360 / 37) * Math.PI) / 180)
                const r = 95
                const x1 = 100 + r * Math.cos(rad - Math.PI / 2)
                const y1 = 100 + r * Math.sin(rad - Math.PI / 2)
                const x2 = 100 + r * Math.cos(nextRad - Math.PI / 2)
                const y2 = 100 + r * Math.sin(nextRad - Math.PI / 2)
                const color = num === 0 ? '#16a34a' : RED_NUMBERS.includes(num) ? '#dc2626' : '#1c1c1c'
                const midAngle = angle + 360 / 37 / 2
                const tr = 72
                const tx = 100 + tr * Math.cos((midAngle - 90) * Math.PI / 180)
                const ty = 100 + tr * Math.sin((midAngle - 90) * Math.PI / 180)
                return (
                  <g key={num}>
                    <path d={`M 100 100 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`} fill={color} stroke="#0a0a0a" strokeWidth="1" />
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8" fontWeight="bold"
                      transform={`rotate(${midAngle}, ${tx}, ${ty})`}>{num}</text>
                  </g>
                )
              })}
              <circle cx="100" cy="100" r="22" fill="#0a0a0a" stroke="#d97706" strokeWidth="3" />
              <circle cx="100" cy="100" r="12" fill="#d97706" />
            </svg>

            {/* Шарик */}
            <div
              className="absolute w-4 h-4 rounded-full bg-white shadow-lg shadow-white/50 top-3 left-1/2 -translate-x-1/2"
              style={{
                transformOrigin: '50% 125px',
                transform: `rotate(${ballAngle}deg) translateY(-4px)`,
                transition: spinning ? 'transform 4.5s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none',
              }}
            />

            {/* Результат по центру */}
            {result !== null && !spinning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 ${
                  result === 0 ? 'bg-green-600 border-green-400' : RED_NUMBERS.includes(result) ? 'bg-red-600 border-red-400' : 'bg-gray-800 border-gray-600'
                }`}>
                  {result}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Сообщение */}
        {winMessage && (
          <div className={`text-center text-sm font-semibold px-4 py-3 rounded-xl mb-4 ${winMessage.includes('🎉') ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {winMessage}
          </div>
        )}

        {/* Фишки */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {CHIP_VALUES.map((v) => (
            <button key={v} onClick={() => setSelectedChip(v)}
              className={`w-12 h-12 rounded-full text-xs font-bold border-2 transition-all ${selectedChip === v ? 'border-yellow-400 bg-yellow-600 text-black scale-110' : 'border-[#444] bg-[#1a1a1a] text-white hover:border-violet-500'}`}>
              {v >= 1000 ? `${v/1000}K` : v}
            </button>
          ))}
          <div className="h-8 w-px bg-[#333] mx-2" />
          <span className="text-gray-400 text-sm">Ставка: <span className="text-white font-bold">{totalBet} ₽</span></span>
        </div>

        {/* Поле ставок */}
        <div className="bg-[#0f1a0f] border border-green-900/50 rounded-2xl p-4 mb-4">
          {/* Нулевое поле */}
          <div className="flex justify-center mb-2">
            <button onClick={() => addBet('number', 0, '0')}
              className="w-12 h-10 rounded-lg bg-green-700 text-white text-sm font-bold hover:bg-green-600 border border-green-500 transition-all hover:scale-105">
              0
            </button>
          </div>

          {/* Сетка чисел 1–36 */}
          <div className="grid grid-cols-12 gap-1 mb-3">
            {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => {
              const hasBet = bets.some((b) => b.type === 'number' && b.value === n)
              const col = getColor(n)
              return (
                <button key={n} onClick={() => addBet('number', n, String(n))}
                  className={`h-9 rounded text-white text-xs font-bold transition-all hover:scale-110 relative border ${
                    col === 'red' ? 'bg-red-700 border-red-500 hover:bg-red-600' : 'bg-[#1c1c1c] border-[#333] hover:bg-[#2a2a2a]'
                  } ${hasBet ? 'ring-2 ring-yellow-400' : ''}`}>
                  {n}
                  {hasBet && (() => {
                    const betFound = bets.find(b => b.type === 'number' && b.value === n)
                    if (!betFound) return null
                    return <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full text-[8px] text-black flex items-center justify-center font-bold">{betFound.amount >= 1000 ? `${betFound.amount/1000}K` : betFound.amount}</span>
                  })()}
                </button>
              )
            })}
          </div>

          {/* Дюжины */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {([['1st12','1st12','1–12'],['2nd12','2nd12','13–24'],['3rd12','3rd12','25–36']] as [BetType,string,string][]).map(([type,val,label]) => (
              <button key={type} onClick={() => addBet(type, val, label)}
                className={`py-2 rounded-lg text-white text-xs font-semibold border transition-all hover:scale-105 ${bets.some(b=>b.type===type) ? 'border-yellow-400 bg-yellow-600/20' : 'border-[#333] bg-[#1a1a1a] hover:border-violet-500'}`}>
                {label} <span className="text-gray-400">(2:1)</span>
              </button>
            ))}
          </div>

          {/* Внешние ставки */}
          <div className="grid grid-cols-6 gap-2">
            {([
              ['low','low','1–18'],['even','even','Чёт'],['red','red','Красное'],
              ['black','black','Чёрное'],['odd','odd','Нечёт'],['high','high','19–36']
            ] as [BetType,string,string][]).map(([type,val,label]) => (
              <button key={type} onClick={() => addBet(type, val, label)}
                className={`py-2 rounded-lg text-xs font-semibold border transition-all hover:scale-105 ${
                  type === 'red' ? 'bg-red-700 border-red-500 text-white hover:bg-red-600' :
                  type === 'black' ? 'bg-[#1c1c1c] border-[#444] text-white hover:bg-[#2a2a2a]' :
                  bets.some(b=>b.type===type) ? 'border-yellow-400 bg-yellow-600/20 text-white' :
                  'border-[#333] bg-[#1a1a1a] text-white hover:border-violet-500'
                } ${bets.some(b=>b.type===type) && type !== 'red' && type !== 'black' ? 'ring-1 ring-yellow-400' : ''}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex gap-3">
          <Button onClick={clearBets} variant="outline" className="border-[#333] text-gray-400 hover:bg-[#1a1a1a] rounded-xl flex-1">
            Очистить
          </Button>
          <Button onClick={spin} disabled={spinning || bets.length === 0 || (user?.balance || 0) < 0}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl flex-[2] py-5 text-base font-bold disabled:opacity-50">
            {spinning ? '🌀 Крутится...' : '🎡 Запустить!'}
          </Button>
        </div>
      </div>
    </div>
  )
}