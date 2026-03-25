import { useAppStore } from '@/store/useAppStore'
import Icon from '@/components/ui/icon'

const CRYPTO_BOT_LINK = 'https://t.me/CryptoBot?start=IV47493667'

const history = [
  { label: 'Выигрыш — Mines', amount: '+18 400 ₽', date: '25 мар', color: 'text-green-400' },
  { label: 'Ставка — Roulette', amount: '-2 000 ₽', date: '24 мар', color: 'text-red-400' },
  { label: 'Вывод средств', amount: '-5 000 ₽', date: '23 мар', color: 'text-orange-400' },
  { label: 'Бонус за пополнение', amount: '+5 000 ₽', date: '22 мар', color: 'text-yellow-400' },
  { label: 'Выигрыш — Slots', amount: '+3 200 ₽', date: '21 мар', color: 'text-green-400' },
]

const coins = [
  { coin: 'USDT', name: 'Tether (TRC20)', color: 'text-green-400', icon: '💵' },
  { coin: 'TON', name: 'Toncoin', color: 'text-blue-400', icon: '💎' },
  { coin: 'BTC', name: 'Bitcoin', color: 'text-orange-400', icon: '🟠' },
  { coin: 'ETH', name: 'Ethereum', color: 'text-purple-400', icon: '🔷' },
  { coin: 'BNB', name: 'BNB Chain', color: 'text-yellow-400', icon: '🟡' },
  { coin: 'LTC', name: 'Litecoin', color: 'text-gray-300', icon: '🔘' },
]

export function WalletTab() {
  const { user } = useAppStore()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Кошелёк</h2>
        <p className="text-gray-500 text-sm">Пополнение и вывод через CryptoBot</p>
      </div>

      {/* Баланс */}
      <div className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 border border-violet-500/30 rounded-2xl p-6 mb-6">
        <p className="text-gray-400 text-sm mb-1">Игровой баланс</p>
        <p className="text-4xl font-bold text-white">{(user?.balance || 0).toLocaleString()} ₽</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">🏆 {user?.level}</span>
          <span className="text-xs text-gray-500">Кэшбэк: {user?.cashback} ₽</span>
        </div>
      </div>

      {/* CryptoBot пополнение */}
      <div className="bg-gradient-to-br from-[#0d1f2d] to-[#0a1520] border border-blue-500/30 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl">₿</div>
          <div>
            <p className="text-white font-bold text-lg">Пополнение через CryptoBot</p>
            <p className="text-gray-400 text-sm">Мгновенно · Без комиссии</p>
          </div>
          <span className="ml-auto text-xs bg-green-500/20 text-green-400 border border-green-500/20 px-2 py-1 rounded-full font-medium">● Онлайн</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {coins.map((c) => (
            <div key={c.coin} className="bg-[#0a0f1a] border border-[#1a2a3a] rounded-xl px-3 py-2.5 text-center">
              <div className="text-xl mb-1">{c.icon}</div>
              <p className={`text-sm font-bold ${c.color}`}>{c.coin}</p>
              <p className="text-gray-600 text-xs">{c.name}</p>
            </div>
          ))}
        </div>

        <a
          href={CRYPTO_BOT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl py-4 transition-all text-base shadow-lg shadow-blue-900/40"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.61c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.24 14.748l-2.95-.924c-.643-.2-.657-.643.134-.953l11.52-4.44c.537-.194 1.006.13.618.817z"/>
          </svg>
          Пополнить через Telegram
        </a>
        <p className="text-gray-600 text-xs text-center mt-3">Нажми кнопку → откроется CryptoBot в Telegram → выбери сумму и монету</p>
      </div>

      {/* Вывод */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <Icon name="ArrowUpCircle" size={20} className="text-orange-400" />
          </div>
          <div>
            <p className="text-white font-bold">Вывод средств</p>
            <p className="text-gray-400 text-xs">Также через CryptoBot</p>
          </div>
        </div>
        <a
          href={CRYPTO_BOT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold rounded-xl py-3 transition-all"
        >
          💸 Вывести средства
        </a>
      </div>

      {/* История */}
      <div>
        <h3 className="text-white font-semibold mb-3">История операций</h3>
        <div className="space-y-2">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between bg-[#141414] border border-[#262626] rounded-xl px-4 py-3">
              <div>
                <p className="text-sm text-white">{h.label}</p>
                <p className="text-xs text-gray-500">{h.date}</p>
              </div>
              <span className={`text-sm font-bold ${h.color}`}>{h.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
