import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-2">
        <CasinoLogo />
        <span className="text-lg font-semibold text-white">
          LuckyAce<sup className="text-xs">™</sup>
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          Игры
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1">
          Акции <ChevronDown className="h-4 w-4" />
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          Турниры
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          VIP-клуб
        </a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
          Поддержка
        </a>
      </nav>

      <Button
        variant="outline"
        className="rounded-full border-violet-500 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 bg-transparent"
      >
        Войти / Регистрация
      </Button>
    </header>
  )
}

function CasinoLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15 9H22L16.5 13.5L18.5 21L12 17L5.5 21L7.5 13.5L2 9H9L12 2Z" fill="#8B5CF6" opacity="0.9" />
      <path d="M12 5L14 10H19.5L15.2 13L16.8 18.5L12 15.5L7.2 18.5L8.8 13L4.5 10H10L12 5Z" fill="#6D28D9" />
    </svg>
  )
}
