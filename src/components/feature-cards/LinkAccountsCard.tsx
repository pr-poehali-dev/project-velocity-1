import { Gamepad2, ArrowUpRight } from "lucide-react"
import Icon from "@/components/ui/icon"

const games = [
  { name: "Book of Dead", provider: "Play'n GO", badge: "🔥 Хит", badgeColor: "bg-orange-500/20 text-orange-400" },
  { name: "Sweet Bonanza", provider: "Pragmatic Play", badge: "⭐ Топ", badgeColor: "bg-yellow-500/20 text-yellow-400" },
  { name: "Gates of Olympus", provider: "Pragmatic Play", badge: "💎 VIP", badgeColor: "bg-violet-500/20 text-violet-400" },
  { name: "Starburst", provider: "NetEnt", badge: "🆕 Новинка", badgeColor: "bg-blue-500/20 text-blue-400" },
]

export function LinkAccountsCard() {
  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 flex flex-col">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
        <Gamepad2 className="h-5 w-5 text-gray-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">3000+ игр на выбор</h3>
      <p className="mb-4 text-sm text-gray-400">Слоты, рулетка, покер, блэкджек — выбирай любую игру и запускай мгновенно</p>

      <a href="#" className="mb-6 inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
        Все игры <ArrowUpRight className="ml-1 h-4 w-4" />
      </a>

      <div className="mt-auto space-y-2 rounded-xl bg-[#1a1a1a] border border-[#262626] p-3">
        {games.map((game, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Icon name="Gamepad2" size={16} className="text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{game.name}</p>
                <p className="text-xs text-gray-500">{game.provider}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${game.badgeColor}`}>{game.badge}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
