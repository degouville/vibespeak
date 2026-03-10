import { RATE_LIMIT_USD } from '../lib/constants'

interface UsageMeterProps {
  spent: number
}

export default function UsageMeter({ spent }: UsageMeterProps) {
  const pct = Math.min((spent / RATE_LIMIT_USD) * 100, 100)
  const isNearLimit = pct > 75

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-[var(--sea-ink-soft)]">Session Budget</span>
        <span className={`font-semibold ${isNearLimit ? 'text-yellow-500' : 'text-[var(--sea-ink)]'}`}>
          ${spent.toFixed(4)} / ${RATE_LIMIT_USD.toFixed(2)}
        </span>
      </div>
      <div className="usage-bar h-2.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="usage-bar-fill h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
