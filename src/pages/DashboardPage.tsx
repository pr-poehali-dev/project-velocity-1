import { useAppStore } from '@/store/useAppStore'
import { GamesTab } from '@/components/dashboard/GamesTab'
import { WalletTab } from '@/components/dashboard/WalletTab'
import { BonusTab } from '@/components/dashboard/BonusTab'
import { SettingsTab } from '@/components/dashboard/SettingsTab'
import Icon from '@/components/ui/icon'

const navItems = [
  { id: 'games', label: 'Игры', icon: 'Gamepad2', emoji: '🎮' },
  { id: 'wallet', label: 'Кошелёк', icon: 'Wallet', emoji: '💳' },
  { id: 'bonuses', label: 'Бонусы', icon: 'Gift', emoji: '🎁' },
  { id: 'settings', label: 'Профиль', icon: 'Settings', emoji: '⚙️' },
]

export default function DashboardPage() {
  const { user, activeTab, setActiveTab } = useAppStore()

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Шапка */}
      <header className="border-b border-[#1a1a1a] bg-[#0d0d0d] px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎰</span>
          <span className="text-white font-bold text-lg hidden sm:block">LuckyAce</span>
          <span className="text-xs text-gray-600 hidden sm:block">Casino</span>
        </div>

        {/* Баланс по центру */}
        <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2">
          <Icon name="Coins" size={16} className="text-yellow-400" />
          <span className="text-white font-bold text-sm">{(user?.balance || 0).toLocaleString()} ₽</span>
          <button
            onClick={() => setActiveTab('wallet')}
            className="text-xs text-violet-400 hover:text-violet-300 border border-violet-500/30 rounded-lg px-2 py-0.5 ml-1"
          >
            +
          </button>
        </div>

        {/* Аватар + имя */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 hover:bg-[#1a1a1a] rounded-xl px-3 py-2 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-lg">
            {user?.avatar}
          </div>
          <span className="text-white text-sm hidden sm:block">{user?.name}</span>
        </button>
      </header>

      <div className="flex flex-1">
        {/* Сайдбар (десктоп) */}
        <aside className="hidden md:flex flex-col w-56 border-r border-[#1a1a1a] bg-[#0d0d0d] p-4 sticky top-[57px] h-[calc(100vh-57px)]">
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                }`}
              >
                <span className="text-xl">{item.emoji}</span>
                {item.label}
                {item.id === 'bonuses' && (
                  <span className="ml-auto text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">3</span>
                )}
              </button>
            ))}
          </nav>

          {/* Статус */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-3 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{user?.avatar}</span>
              <div>
                <p className="text-white text-xs font-medium">{user?.name}</p>
                <p className="text-gray-500 text-xs">{user?.level}</p>
              </div>
            </div>
            <div className="w-full bg-[#333] rounded-full h-1.5">
              <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: '40%' }} />
            </div>
            <p className="text-gray-600 text-xs mt-1">40% до Золота</p>
          </div>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'games' && <GamesTab />}
          {activeTab === 'wallet' && <WalletTab />}
          {activeTab === 'bonuses' && <BonusTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>

      {/* Нижняя навигация (мобайл) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#1a1a1a] flex z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors relative ${
              activeTab === item.id ? 'text-violet-400' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{item.emoji}</span>
            {item.label}
            {item.id === 'bonuses' && (
              <span className="absolute top-2 right-4 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">3</span>
            )}
          </button>
        ))}
      </nav>

      <div className="md:hidden h-20" />
    </div>
  )
}
