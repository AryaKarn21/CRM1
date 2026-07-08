import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
// CORRECT — valid names in lucide-react v1
import {
  LayoutDashboard, Users, CircleUser, Briefcase, TrendingUp,
  UserCheck, Clock, Calendar, DollarSign, Wallet, Receipt,
  Package, ShoppingCart, FolderKanban, Headphones,
  BarChart3, Settings, ChevronDown, ChevronRight, Building2, Menu
} from 'lucide-react'
import { useUIStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { cn, getInitials } from '@/lib/utils'
import CompanySwitcher from './CompanySwitcher'

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  {
    label: 'CRM & Sales', icon: TrendingUp, children: [
      { label: 'Leads', to: '/crm/leads' },
      { label: 'Accounts', to: '/crm/accounts' },
      { label: 'Contacts', to: '/crm/contacts' },
      { label: 'Opportunities', to: '/crm/opportunities' },
    ]
  },
  {
  label: "Calendar & Meetings",
  icon: Calendar,
  children: [
    {
      label: "Calendar",
      to: "/calendar",
    },
    {
      label: "Meetings",
      to: "/calendar/meetings",
    },
  ],
},
  {
    label: 'Human Resources', icon: Users, children: [
      { label: 'Employees', to: '/hr/employees' },
      { label: 'Attendance', to: '/hr/attendance' },
      { label: 'Leave Management', to: '/hr/leaves' },
      { label: 'Payroll', to: '/hr/payroll' },
    ]
  },
  {
    label: 'Finance', icon: DollarSign, children: [
      { label: 'Overview', to: '/finance' },
      { label: 'Expenses', to: '/finance/expenses' },
      { label: 'General Ledger', to: '/finance/ledger' },
    ]
  },
  { label: 'Inventory', icon: Package, to: '/inventory' },
  { label: 'Procurement', icon: ShoppingCart, to: '/procurement' },
  { label: 'Projects', icon: FolderKanban, to: '/projects' },
  { label: 'Support', icon: Headphones, to: '/support' },
  { label: 'Analytics', icon: BarChart3, to: '/reports' },
  { label: 'Settings', icon: Settings, to: '/settings' },
]

function NavGroup({ item, collapsed }) {
  const location = useLocation()
  const isActive = item.children?.some(c => location.pathname.startsWith(c.to))
  const [open, setOpen] = useState(isActive)

  if (collapsed) {
    return (
      <div className="relative group">
        <button className={cn('nav-item w-full justify-center', isActive && 'active')}>
          <item.icon className="nav-icon" />
        </button>
        <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50 bg-[var(--sidebar-bg)] border border-[var(--sidebar-hover-bg)] rounded-lg py-1 min-w-[160px] shadow-lg">
          <div className="px-3 py-2 text-[11px] font-semibold text-[var(--sidebar-text)] uppercase tracking-wider">{item.label}</div>
          {item.children.map(child => (
            <NavLink key={child.to} to={child.to}
              className={({ isActive }) => cn('block px-3 py-2 text-[13px] transition-colors', isActive ? 'text-white bg-[var(--sidebar-active-bg)]' : 'text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover-bg)]')}
            >{child.label}</NavLink>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn('nav-item w-full', isActive && !open && 'text-white')}
      >
        <item.icon className="nav-icon" />
        <span className="flex-1 text-left">{item.label}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="ml-4 mt-0.5 border-l border-white/10 pl-3 flex flex-col gap-0.5">
          {item.children.map(child => (
            <NavLink key={child.to} to={child.to}
              className={({ isActive }) => cn('nav-item', isActive && 'active')}
            >{child.label}</NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-30 overflow-hidden"
      style={{
        width: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        background: 'var(--sidebar-bg)',
      }}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-white/10 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
          <Building2 size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="text-white text-[13px] font-700 leading-tight truncate">OS Group CRM</p>
            <p className="text-[var(--sidebar-text)] text-[10px] truncate">Enterprise Platform</p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto text-[var(--sidebar-text)] hover:text-white transition-colors p-1 rounded flex-shrink-0"
        >
          <Menu size={15} />
        </button>
      </div>

      {/* Company Switcher */}
      {!sidebarCollapsed && <CompanySwitcher />}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5 scrollbar-none">
        {NAV.map((item) =>
          item.children ? (
            <NavGroup key={item.label} item={item} collapsed={sidebarCollapsed} />
          ) : (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) => cn('nav-item', isActive && 'active', sidebarCollapsed && 'justify-center')}
            >
              <item.icon className="nav-icon" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          )
        )}
      </nav>

      {/* User footer */}
      <div className={cn('border-t border-white/10 p-3 flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {getInitials(user?.name || 'U')}
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="text-white text-[12px] font-medium truncate">{user?.name}</p>
            <p className="text-[var(--sidebar-text)] text-[11px] truncate capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        )}
      </div>
    </aside>
  )
}