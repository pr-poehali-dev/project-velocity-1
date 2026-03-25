import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'
import Icon from '@/components/ui/icon'

const methods = [
  { id: 'card', label: 'Банковская карта', icon: '💳', fee: 'Без комиссии', time: 'Мгновенно' },
  { id: 'crypto', label: 'Криптовалюта', icon: '₿', fee: 'Без комиссии', time: '~10 мин' },
  { id: 'qiwi', label: 'QIWI кошелёк', icon: '🥝', fee: '1%', time: 'Мгновенно' },
  { id: 'sbp', label: 'СБП / Перевод', icon: '🏦', fee: 'Без комиссии', time: 'До 5 мин' },
]

const history = [
  { type: 'deposit', label: 'Пополнение', amount: '+5 000 ₽', date: '24 мар', color: 'text-green-400' },
  { type: 'win', label: 'Выигрыш — Book of Dead', amount: '+12 800 ₽', date: '23 мар', color: 'text-green-400' },
  { type: 'bet', label: 'Ставка — Roulette', amount: '-500 ₽', date: '23 мар', color: 'text-red-400' },
  { type: 'withdraw', label: 'Вывод средств', amount: '-3 000 ₽', date: '22 мар', color: 'text-orange-400' },
  { type: 'bonus', label: 'Бонус за пополнение', amount: '+5 000 ₽', date: '20 мар', color: 'text-yellow-400' },
]

export function WalletTab() {
  const [activeMode, setActiveMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [amount, setAmount] = useState('')
  const [success, setSuccess] = useState('')
  const { user, updateBalance } = useAppStore()

  const handleAction = () => {
    const num = parseInt(amount)
    if (!num || num <= 0) return
    if (activeMode === 'deposit') {
      updateBalance(num)
      const bonus = num >= 1500 ? ' + 5 000 ₽ бонус!' : ''
      if (num >= 1500) updateBalance(5000)
      setSuccess(`✅ Пополнено ${num.toLocaleString()} ₽${bonus}`)
    } else {
      if (num > (user?.balance || 0)) { setSuccess('❌ Недостаточно средств'); return }
      updateBalance(-num)
      setSuccess(`✅ Заявка на вывод ${num.toLocaleString()} ₽ принята`)
    }
    setAmount('')
    setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Кошелёк</h2>
        <p className="text-gray-500 text-sm">Пополнение и вывод средств</p>
      </div>

      {/* Баланс */}
      <div className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 border border-violet-500/30 rounded-2xl p-6 mb-6">
        <p className="text-gray-400 text-sm mb-1">Ваш баланс</p>
        <p className="text-4xl font-bold text-white">{(user?.balance || 0).toLocaleString()} ₽</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
            🏆 {user?.level}
          </span>
          <span className="text-xs text-gray-500">Кэшбэк: {user?.cashback} ₽</span>
        </div>
      </div>

      {/* Переключатель пополнить/вывести */}
      <div className="flex bg-[#0f0f0f] rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveMode('deposit')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeMode === 'deposit' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <Icon name="ArrowDownCircle" size={16} /> Пополнить
        </button>
        <button
          onClick={() => setActiveMode('withdraw')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeMode === 'withdraw' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <Icon name="ArrowUpCircle" size={16} /> Вывести
        </button>
      </div>

      {/* Способы оплаты */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMethod(m.id)}
            className={`p-3 rounded-xl border text-left transition-all ${selectedMethod === m.id ? 'border-violet-500 bg-violet-500/10' : 'border-[#333] bg-[#1a1a1a] hover:border-[#444]'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{m.icon}</span>
              <span className="text-sm text-white font-medium">{m.label}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-xs text-gray-500">{m.fee}</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-500">{m.time}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Сумма */}
      <div className="mb-4">
        <label className="text-xs text-gray-400 mb-2 block">Сумма</label>
        <div className="flex items-center bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 focus-within:border-violet-500">
          <span className="text-gray-500 mr-2">₽</span>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="bg-transparent border-0 p-0 text-white placeholder-gray-600 text-lg font-semibold focus-visible:ring-0"
          />
        </div>
        <div className="flex gap-2 mt-2">
          {['500', '1000', '2000', '5000'].map((v) => (
            <button key={v} onClick={() => setAmount(v)} className="flex-1 text-xs border border-[#333] rounded-lg py-1.5 text-gray-400 hover:border-violet-500/50 hover:text-violet-400 transition-colors">
              +{v}
            </button>
          ))}
        </div>
        {activeMode === 'deposit' && parseInt(amount) >= 1500 && (
          <p className="text-yellow-400 text-xs mt-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
            🎁 Вы получите бонус +5 000 ₽!
          </p>
        )}
      </div>

      {success && (
        <div className="mb-4 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400">
          {success}
        </div>
      )}

      <Button onClick={handleAction} className={`w-full rounded-xl py-5 text-base font-semibold ${activeMode === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white`}>
        {activeMode === 'deposit' ? '💳 Пополнить счёт' : '💸 Вывести средства'}
      </Button>

      {/* История */}
      <div className="mt-8">
        <h3 className="text-white font-semibold mb-4">История операций</h3>
        <div className="space-y-2">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-3">
              <div>
                <p className="text-sm text-white">{h.label}</p>
                <p className="text-xs text-gray-500">{h.date}</p>
              </div>
              <span className={`text-sm font-semibold ${h.color}`}>{h.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
