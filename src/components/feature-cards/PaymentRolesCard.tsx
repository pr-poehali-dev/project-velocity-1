import { Trophy, ArrowUpRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const leaderboard = [
  { place: "🥇", name: "CryptoKing99", amount: "250 000 ₽", color: "bg-yellow-600" },
  { place: "🥈", name: "LuckyStrike", amount: "180 000 ₽", color: "bg-gray-500" },
  { place: "🥉", name: "AcePlayer", amount: "95 000 ₽", color: "bg-amber-700" },
]

export function PaymentRolesCard() {
  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 flex flex-col">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]">
        <Trophy className="h-5 w-5 text-gray-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">Еженедельные турниры</h3>
      <p className="mb-4 text-sm text-gray-400">Соревнуйся с игроками со всего мира и борись за призовой фонд до 1 000 000 ₽</p>

      <a href="#" className="mb-6 inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
        Все турниры <ArrowUpRight className="ml-1 h-4 w-4" />
      </a>

      <div className="mt-auto space-y-4 rounded-xl bg-[#1a1a1a] border border-[#262626] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Топ игроки недели</p>
          <span className="text-xs text-violet-400">Приз: 1 000 000 ₽</span>
        </div>

        {leaderboard.map((player, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{player.place}</span>
              <Avatar className="h-9 w-9">
                <AvatarFallback className={`${player.color} text-white text-xs`}>
                  {player.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-white">{player.name}</p>
            </div>
            <span className="text-sm text-violet-400 font-semibold">{player.amount}</span>
          </div>
        ))}

        <div className="border-t border-dashed border-[#333] pt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">До конца турнира</p>
            <span className="text-xs font-mono text-white bg-[#0f0f0f] px-2 py-1 rounded border border-[#333]">02:14:38</span>
          </div>
        </div>
      </div>
    </div>
  )
}
