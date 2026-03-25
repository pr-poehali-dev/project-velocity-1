import Icon from "@/components/ui/icon"

const providers = [
  { name: "NetEnt", icon: "Sparkles" },
  { name: "Pragmatic Play", icon: "Zap" },
  { name: "Evolution", icon: "Activity" },
  { name: "Play'n GO", icon: "Diamond" },
  { name: "Microgaming", icon: "Star" },
  { name: "Novomatic", icon: "Sun" },
  { name: "Playtech", icon: "Circle" },
]

export function PartnersSection() {
  return (
    <section className="flex flex-wrap items-center justify-center gap-6 md:gap-10 px-4 py-8">
      {providers.map((provider) => (
        <div key={provider.name} className="flex items-center gap-2 text-gray-500">
          <Icon name={provider.icon} size={16} />
          <span className="text-sm font-medium">{provider.name}™</span>
        </div>
      ))}
    </section>
  )
}
