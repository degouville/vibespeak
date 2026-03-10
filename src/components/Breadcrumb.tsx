import { ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface BreadcrumbProps {
  items: Array<{ label: string, href?: string }>
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-[var(--sea-ink-soft)]">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
          {item.href ? (
            <Link to={item.href} className="transition hover:text-[var(--sea-ink)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--sea-ink)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
