import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

const avatars = [
  { emoji: '🦁', name: 'Лев' },
  { emoji: '🐯', name: 'Тигр' },
  { emoji: '🦊', name: 'Лиса' },
  { emoji: '🐺', name: 'Волк' },
  { emoji: '🦅', name: 'Орёл' },
  { emoji: '🦋', name: 'Бабочка' },
  { emoji: '🐉', name: 'Дракон' },
  { emoji: '🦄', name: 'Единорог' },
  { emoji: '🐻', name: 'Медведь' },
  { emoji: '🦈', name: 'Акула' },
  { emoji: '🐆', name: 'Леопард' },
  { emoji: '🦉', name: 'Сова' },
]

export function SettingsTab() {
  const { user, updateAvatar, logout } = useAppStore()
  const [saved, setSaved] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🦁')

  const handleSave = () => {
    updateAvatar(selectedAvatar)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Настройки профиля</h2>
        <p className="text-gray-500 text-sm">Управляйте своим аккаунтом</p>
      </div>

      {/* Текущий профиль */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-4xl">
            {selectedAvatar}
          </div>
          <div>
            <h3 className="text-white text-xl font-bold">{user?.name}</h3>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">
              🏆 {user?.level}
            </span>
          </div>
        </div>

        {/* Выбор аватарки */}
        <div>
          <p className="text-sm font-medium text-white mb-3">Выберите аватар-животное</p>
          <div className="grid grid-cols-6 gap-2">
            {avatars.map((a) => (
              <button
                key={a.emoji}
                onClick={() => setSelectedAvatar(a.emoji)}
                title={a.name}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                  selectedAvatar === a.emoji
                    ? 'bg-violet-600 border-2 border-violet-400 scale-110'
                    : 'bg-[#1a1a1a] border border-[#333] hover:border-violet-500/50 hover:scale-105'
                }`}
              >
                <span className="text-2xl">{a.emoji}</span>
              </button>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-2 text-center">
            Выбрано: {avatars.find((a) => a.emoji === selectedAvatar)?.name}
          </p>
        </div>
      </div>

      {/* Информация аккаунта */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 mb-6 space-y-4">
        <h3 className="text-white font-semibold">Данные аккаунта</h3>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Имя игрока</label>
          <input
            defaultValue={user?.name}
            className="w-full bg-[#0f0f0f] border border-[#333] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-violet-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Email</label>
          <input
            defaultValue={user?.email}
            className="w-full bg-[#0f0f0f] border border-[#333] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Уровни VIP */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 mb-6">
        <h3 className="text-white font-semibold mb-4">VIP-уровни</h3>
        <div className="space-y-2">
          {[
            { level: 'Бронза', min: '0 ₽', cashback: '5%', color: 'bg-amber-700' },
            { level: 'Серебро', min: '10 000 ₽', cashback: '8%', color: 'bg-gray-500' },
            { level: 'Золото', min: '50 000 ₽', cashback: '12%', color: 'bg-yellow-600' },
            { level: 'Платина', min: '200 000 ₽', cashback: '15%', color: 'bg-cyan-700' },
          ].map((v) => (
            <div key={v.level} className={`flex items-center justify-between rounded-xl px-4 py-3 ${v.level === user?.level ? 'border border-violet-500 bg-violet-500/10' : 'bg-[#1a1a1a]'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${v.color}`} />
                <span className="text-white text-sm font-medium">{v.level}</span>
                {v.level === user?.level && <span className="text-xs text-violet-400">← Ваш уровень</span>}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">от {v.min}</p>
                <p className="text-xs text-green-400">Кэшбэк {v.cashback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-5">
          {saved ? '✅ Сохранено!' : 'Сохранить изменения'}
        </Button>
        <Button onClick={logout} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl px-6">
          Выйти
        </Button>
      </div>
    </div>
  )
}
