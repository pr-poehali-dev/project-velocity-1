import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const login = useAppStore((s) => s.login)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Заполните все поля'); return }
    if (mode === 'register' && !name) { setError('Введите имя'); return }
    if (password.length < 6) { setError('Пароль минимум 6 символов'); return }
    login(email, mode === 'register' ? name : email.split('@')[0])
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Фоновые элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Лого */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <span className="text-3xl">🎰</span>
          </div>
          <h1 className="text-2xl font-bold text-white">LuckyAce Casino</h1>
          <p className="text-gray-500 text-sm mt-1">Демо-платформа · 18+</p>
        </div>

        {/* Карточка */}
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-8 shadow-2xl shadow-violet-500/5">
          {/* Переключатель */}
          <div className="flex bg-[#0f0f0f] rounded-xl p-1 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'login' ? 'bg-violet-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Войти
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'register' ? 'bg-violet-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Имя игрока</label>
                <Input
                  placeholder="Как вас называть?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#0f0f0f] border-[#333] text-white placeholder-gray-600 focus:border-violet-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0f0f0f] border-[#333] text-white placeholder-gray-600 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Пароль</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0f0f0f] border-[#333] text-white placeholder-gray-600 focus:border-violet-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-5 mt-2 text-base font-semibold">
              {mode === 'login' ? '🚀 Войти в казино' : '🎉 Создать аккаунт'}
            </Button>
          </form>

          {mode === 'register' && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-yellow-400 text-xs font-medium">🎁 Бонус для новичков</p>
              <p className="text-gray-300 text-sm mt-1">Пополни от <span className="text-yellow-400 font-bold">1 500 ₽</span> и получи <span className="text-yellow-400 font-bold">+5 000 ₽</span> бонусом!</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Только для развлечения · Не является реальным казино
        </p>
      </div>
    </div>
  )
}
