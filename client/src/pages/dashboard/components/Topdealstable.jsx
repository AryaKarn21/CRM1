import { Link } from 'react-router-dom'
import { Briefcase, ArrowUpRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const STAGE_COLORS = {
  Prospecting: 'info',
  Qualification: 'info',
  'Needs Analysis': 'warning',
  'Value Proposition': 'warning',
  'Decision Makers': 'primary',
  'Perception Analysis': 'primary',
  'Proposal/Price': 'success',
  'Negotiation/Review': 'success',
  'Closed Won': 'success',
  'Closed Lost': 'danger',
}

function StageBadge({ stage }) {
  const tone = STAGE_COLORS[stage] || 'gray'
  const map = {
    info: { bg: 'var(--info-bg)', fg: 'var(--info)' },
    warning: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
    primary: { bg: 'var(--primary-light)', fg: 'var(--primary)' },
    success: { bg: 'var(--success-bg)', fg: 'var(--success)' },
    danger: { bg: 'var(--danger-bg)', fg: 'var(--danger)' },
    gray: { bg: 'var(--surface-2)', fg: 'var(--text-secondary)' },
  }
  const c = map[tone]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.fg }}
    >
      {stage}
    </span>
  )
}

export default function TopDealsTable({
  items = [],
  loading,
  title = 'Top Open Deals',
  icon: HeaderIcon = Briefcase,
  viewAllTo = '/crm/opportunities',
  emptyMessage = 'No open deals yet',
  dateColumnLabel = 'Close Date',
}) {
  return (
    <div className="dash-card overflow-hidden">
      <div className="dash-card-head">
        <div className="flex items-center gap-2">
          <HeaderIcon size={15} style={{ color: 'var(--primary)' }} />
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        </div>
        <Link to={viewAllTo} className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
          View all <ArrowUpRight size={13} />
        </Link>
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table dash-table-zebra">
          <thead>
            <tr>
              <th>Deal</th>
              <th>Account</th>
              <th>Owner</th>
              <th>Stage</th>
              <th>Probability</th>
              <th>{dateColumnLabel}</th>
              <th style={{ textAlign: 'right' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="dash-skeleton h-3.5 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : items.length ? (
              items.map((deal) => (
                <tr key={deal.id}>
                  <td className="font-medium">{deal.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{deal.account}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{deal.owner}</td>
                  <td><StageBadge stage={deal.stage} /></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="dash-progress-track">
                        <div className="dash-progress-fill" style={{ width: `${deal.probability}%` }} />
                      </div>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{deal.probability}%</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{deal.closeDate ? formatDate(deal.closeDate, 'MMM d, yyyy') : '—'}</td>
                  <td className="text-right font-semibold" style={{ textAlign: 'right' }}>{formatCurrency(deal.value)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}