import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Users, TrendingUp, DollarSign, Ticket, UserCheck, Package, RefreshCw, Trophy, Wallet } from 'lucide-react'
import api from '@/api/axios'
import { formatCurrency } from '@/lib/utils'
import KpiCard from './components/Kpicard'
import TrendChart from './components/Trendchart'
import PipelineChart from './components/Pipelinechart'
import TicketsDonut from './components/Ticketsdonut'
import RecentActivity from './components/RecentActivity'
import QuickActions from './components/Quickactions'
import TopDealsTable from './components/Topdealstable'
import './dashboard.css'

// Queries real API endpoints — no mock data
const useDashboardStats = () => useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: () => api.get('/dashboard/stats').then(r => r.data),
  refetchInterval: 1000 * 60 * 5, // refresh every 5 min
})

const useRecentActivity = () => useQuery({
  queryKey: ['dashboard-activity'],
  queryFn: () => api.get('/dashboard/activity').then(r => r.data),
})

const useDashboardCharts = () => useQuery({
  queryKey: ['dashboard-charts'],
  queryFn: () => api.get('/dashboard/charts').then(r => r.data),
})

const useTopDeals = () => useQuery({
  queryKey: ['dashboard-top-deals'],
  queryFn: () => api.get('/dashboard/top-deals?limit=6').then(r => r.data),
})

const useWonDeals = () => useQuery({
  queryKey: ['dashboard-won-deals'],
  queryFn: () => api.get('/dashboard/top-deals?type=won&limit=6').then(r => r.data),
})

export default function Dashboard() {
  const queryClient = useQueryClient()
  const { data: stats, isLoading: statsLoading, isFetching: statsFetching } = useDashboardStats()
  const { data: activity, isLoading: activityLoading } = useRecentActivity()
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts()
  const { data: topDeals, isLoading: dealsLoading } = useTopDeals()
  const { data: wonDeals, isLoading: wonDealsLoading } = useWonDeals()

  const isRefreshing = statsFetching && !statsLoading

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-activity'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-top-deals'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-won-deals'] })
  }

  return (
    <div className="dash-root animate-fade-in">
      <div className="dash-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Welcome back. Here's what's happening today.
          </p>
        </div>
        <button
          type="button"
          className="dash-refresh-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={13} className={isRefreshing ? 'dash-spin' : ''} />
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="p-4 sm:p-5 lg:p-6 flex flex-col gap-5 lg:gap-6">
        {/* KPI Grid — 4 per row desktop, 2 tablet, 1 mobile */}
        <div className="dash-kpi-grid">
          <KpiCard delay={0} title="Total Leads" value={stats?.leads?.total ?? '—'} change={stats?.leads?.change} changeLabel="vs last month" icon={TrendingUp} color="primary" loading={statsLoading} />
          <KpiCard delay={40} title="Active Accounts" value={stats?.accounts?.total ?? '—'} icon={UserCheck} color="success" loading={statsLoading} />
          <KpiCard delay={80} title="Pipeline Value" value={stats?.pipeline?.value != null ? formatCurrency(stats.pipeline.value) : '—'} icon={DollarSign} color="warning" loading={statsLoading} />
          <KpiCard delay={120} title="Deals Won" value={stats?.won?.count ?? '—'} changeLabel={stats?.won?.thisMonth != null ? `${stats.won.thisMonth} this month` : undefined} icon={Trophy} color="success" loading={statsLoading} />
          <KpiCard delay={160} title="Won Revenue" value={stats?.won?.value != null ? formatCurrency(stats.won.value) : '—'} icon={Wallet} color="success" loading={statsLoading} />
          <KpiCard delay={200} title="Employees" value={stats?.employees?.total ?? '—'} icon={Users} color="info" loading={statsLoading} />
          <KpiCard delay={240} title="Open Tickets" value={stats?.tickets?.open ?? '—'} icon={Ticket} color="danger" loading={statsLoading} />
          <KpiCard delay={280} title="Inventory Items" value={stats?.inventory?.total ?? '—'} icon={Package} color="gray" loading={statsLoading} />
        </div>

        {/* Charts row */}
        <div className="dash-charts-grid">
          <TrendChart data={charts?.trend} loading={chartsLoading} />
          <PipelineChart data={charts?.pipelineByStage} loading={chartsLoading} />
        </div>

        {/* Activity / Quick actions / Tickets breakdown */}
        <div className="dash-main-grid">
          <div className="lg:col-span-2">
            <RecentActivity items={activity?.items} loading={activityLoading} />
          </div>
          <div className="flex flex-col gap-5 lg:gap-6">
            <QuickActions />
            <TicketsDonut data={charts?.ticketsByStatus} loading={chartsLoading} />
          </div>
        </div>

        {/* Top deals table — full width */}
        <TopDealsTable items={topDeals?.items} loading={dealsLoading} />

        {/* Recently won deals — full width */}
        <TopDealsTable
          items={wonDeals?.items}
          loading={wonDealsLoading}
          title="Recently Won Deals"
          icon={Trophy}
          viewAllTo="/crm/opportunities?stage=Closed Won"
          emptyMessage="No deals won yet — mark an opportunity as Closed Won to see it here"
          dateColumnLabel="Won On"
        />
      </div>
    </div>
  )
}