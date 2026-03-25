import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

const WHEEL_SEGMENTS = [
  { label: '100 ₽', value: 100, color: '#7c3aed' },
  { label: 'Бесплатно', value: 50, color: '#1d4ed8' },
  { label: '500 ₽', value: 500, color: '#065f46' },
  { label: '50 ₽', value: 50, color: '#92400e' },
  { label: '1 000 ₽', value: 1000, color: '#9f1239' },
  { label: 'Повтор', value: 0, color: '#374151' },
  { label: '250 ₽', value: 250, color: '#4338ca' },
  { label: '25 фриспинов', value: 75, color: '#065f46' },
]

function FortuneWheel({ onSpin, disabled }: { onSpin: (prize: typeof WHEEL_SEGMENTS[0]) => void; disabled: boolean }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)

  const spin = () => {
    if (spinning || disabled) return
    setSpinning(true)
    const idx = Math.floor(Math.random() * WHEEL_SEGMENTS.length)
    const segAngle = 360 / WHEEL_SEGMENTS.length
    const targetAngle = 360 * 8 + (360 - idx * segAngle - segAngle / 2)
    const newRotation = rotation + targetAngle
    setRotation(newRotation)
    setTimeout(() => {
      setSpinning(false)
      onSpin(WHEEL_SEGMENTS[idx])
    }, 4000)
  }

  const segAngle = 360 / WHEEL_SEGMENTS.length

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        {/* Указатель */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-2xl">▼</div>

        <svg
          width="260"
          height="260"
          viewBox="-130 -130 260 260"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {WHEEL_SEGMENTS.map((seg, i) => {
            const startAngle = ((i * segAngle - 90) * Math.PI) / 180
            const endAngle = (((i + 1) * segAngle - 90) * Math.PI) / 180
            const x1 = 120 * Math.cos(startAngle)
            const y1 = 120 * Math.sin(startAngle)
            const x2 = 120 * Math.cos(endAngle)
            const y2 = 120 * Math.sin(endAngle)
            const midAngle = (((i + 0.5) * segAngle - 90) * Math.PI) / 180
            const tx = 75 * Math.cos(midAngle)
            const ty = 75 * Math.sin(midAngle)
            return (
              <g key={i}>
                <path d={`M 0 0 L ${x1} ${y1} A 120 120 0 0 1 ${x2} ${y2} Z`} fill={seg.color} stroke="#0a0a0a" strokeWidth="2" />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="600"
                  transform={`rotate(${(i + 0.5) * segAngle}, ${tx}, ${ty})`}
                >
                  {seg.label}
                </text>
              </g>
            )
          })}
          <circle cx="0" cy="0" r="18" fill="#0a0a0a" stroke="#7c3aed" strokeWidth="3" />
          <circle cx="0" cy="0" r="10" fill="#7c3aed" />
        </svg>
      </div>

      <Button
        onClick={spin}
        disabled={spinning || disabled}
        className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-10 py-5 text-base font-bold shadow-lg shadow-violet-500/30 disabled:opacity-50"
      >
        {spinning ? '🌀 Крутится...' : disabled ? '✅ Использовано сегодня' : '🎡 Крутить колесо!'}
      </Button>
    </div>
  )
}

export function BonusTab() {
  const { spinWheelUsed, setSpinWheelUsed, updateBalance } = useAppStore()
  const [prize, setPrize] = useState<string | null>(null)
  const [depositBonus, setDepositBonus] = useState(false)

  const handleSpin = (segment: typeof WHEEL_SEGMENTS[0]) => {
    setSpinWheelUsed(true)
    if (segment.value > 0) {
      updateBalance(segment.value)
      setPrize(`🎉 Вы выиграли: ${segment.label}! Зачислено на счёт.`)
    } else {
      setPrize('Повезёт в следующий раз! Приходи завтра.')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Бонусы и акции</h2>
        <p className="text-gray-500 text-sm">Ваши награды и специальные предложения</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Колесо фортуны */}
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🎡</span>
            <div>
              <h3 className="text-white font-bold">Колесо фортуны</h3>
              <p className="text-gray-500 text-xs">Одно бесплатное вращение в день</p>
            </div>
          </div>
          <FortuneWheel onSpin={handleSpin} disabled={spinWheelUsed} />
          {prize && (
            <div className="mt-4 text-center text-sm bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 text-violet-300">
              {prize}
            </div>
          )}
        </div>

        {/* Правая колонка */}
        <div className="space-y-4">
          {/* Бонус за пополнение */}
          <div className="bg-[#141414] border border-yellow-500/30 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">💰</div>
                <div>
                  <h3 className="text-white font-bold">Бонус за пополнение</h3>
                  <p className="text-gray-500 text-xs">Разовый приветственный бонус</p>
                </div>
              </div>
              {!depositBonus && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Доступен</span>}
              {depositBonus && <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">Получен</span>}
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Минимальный депозит</span>
                <span className="text-yellow-400 font-bold">1 500 ₽</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Бонус</span>
                <span className="text-yellow-400 font-bold text-lg">+5 000 ₽</span>
              </div>
            </div>
            <Button
              disabled={depositBonus}
              onClick={() => { setDepositBonus(true); updateBalance(5000) }}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
            >
              {depositBonus ? '✅ Бонус получен' : '🎁 Получить бонус'}
            </Button>
          </div>

          {/* Кэшбэк */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">💸</span>
              <div>
                <h3 className="text-white font-bold">Кэшбэк</h3>
                <p className="text-gray-500 text-xs">10% от проигранных средств каждую пятницу</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-4 py-3">
                <span className="text-gray-400 text-sm">Накоплено кэшбэка</span>
                <span className="text-green-400 font-bold">320 ₽</span>
              </div>
              <div className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-4 py-3">
                <span className="text-gray-400 text-sm">Выплата</span>
                <span className="text-white text-sm">Пятница, 28 мар</span>
              </div>
              <div className="w-full bg-[#333] rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '32%' }} />
              </div>
              <p className="text-xs text-gray-600 text-center">320 ₽ из 1 000 ₽ до следующего уровня</p>
            </div>
          </div>

          {/* Реферальная программа */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">👥</span>
              <div>
                <h3 className="text-white font-bold">Приведи друга</h3>
                <p className="text-gray-500 text-xs">500 ₽ за каждого приглашённого</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value="luckyace.ru/ref/ABC123"
                className="flex-1 bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-xs text-gray-400 outline-none"
              />
              <Button className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-3 rounded-lg h-8">
                Копировать
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
