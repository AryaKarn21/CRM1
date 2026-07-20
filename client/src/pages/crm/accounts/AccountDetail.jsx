import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Edit, Trash2, Globe, Mail, Phone, Smartphone,
  Building2, Users, Wallet, MapPin, Hash, Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { accountsAPI } from '@/api/accounts.api'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

// Reusable field row. Uses design tokens so it matches the rest of the
// CRM and follows light/dark mode automatically.
function Field({ label, value, icon, href }) {
  const content = value || '-'

  return (
    <div className="min-w-0">
      <span
        className="text-[11px] font-medium uppercase tracking-wide flex items-center gap-1.5"
        style={{ color: 'var(--text-muted)' }}
      >
        {icon}
        {label}
      </span>

      {href && value ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-semibold break-words hover:underline block mt-1"
          style={{ color: 'var(--primary)' }}
        >
          {content}
        </a>
      ) : (
        <p
          className="text-[13px] font-semibold break-words mt-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {content}
        </p>
      )}
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 sm:px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

export default function AccountDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: account, isLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsAPI.getById(id).then((res) => res.data),
  })

  const deleteMutation = useMutation({
    mutationFn: () => accountsAPI.delete(id),
    onSuccess: () => {
      toast.success('Account deleted')
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      navigate('/crm/accounts')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete account'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}
          />
          <p style={{ color: 'var(--text-muted)' }}>Loading account...</p>
        </div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Account not found
          </h2>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/crm/accounts')}>
            Back to Accounts
          </button>
        </div>
      </div>
    )
  }

  // Join the individual billing columns into one readable address.
  const billingAddress = [
    account.billingStreet,
    account.billingCity,
    account.billingState,
    account.billingZip,
    account.billingCountry,
  ].filter(Boolean).join(', ')

  return (
    <div className="animate-fade-in">
      {/* ================= HEADER ================= */}
      <div className="page-header px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="btn btn-ghost btn-icon shrink-0"
              onClick={() => navigate('/crm/accounts')}
              aria-label="Back to accounts"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <h1
                className="text-[16px] sm:text-[18px] font-bold break-words"
                style={{ color: 'var(--text-primary)' }}
              >
                {account.name}
              </h1>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Account Details
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-secondary flex-1 sm:flex-none justify-center"
              onClick={() => navigate(`/crm/accounts/${id}/edit`)}
            >
              <Edit size={14} /> Edit
            </button>
            <button
              className="btn btn-danger flex-1 sm:flex-none justify-center"
              onClick={() => {
                if (window.confirm('Delete this account?')) deleteMutation.mutate()
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* ================= BODY =================
          One column on phones; sidebar only appears from lg up. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 p-4 sm:p-6">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">

          <SectionCard title="Account Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-5">
              <Field label="Name" value={account.name} icon={<Building2 size={13} />} />
              <Field label="Industry" value={account.industry} />
              <Field label="Website" value={account.website} icon={<Globe size={13} />} href={account.website} />
              <Field
                label="Email"
                value={account.email}
                icon={<Mail size={13} />}
                href={account.email ? `mailto:${account.email}` : null}
              />
              <Field
                label="Phone"
                value={account.phone}
                icon={<Phone size={13} />}
                href={account.phone ? `tel:${account.phone}` : null}
              />
              <Field label="Mobile" value={account.mobile} icon={<Smartphone size={13} />} />

              <div className="min-w-0">
                <span
                  className="text-[11px] font-medium uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Type
                </span>
                <div className="mt-1">
                  <Badge>{account.type || 'General'}</Badge>
                </div>
              </div>

              <div className="min-w-0">
                <span
                  className="text-[11px] font-medium uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Status
                </span>
                <div className="mt-1">
                  <Badge>{account.status || 'Active'}</Badge>
                </div>
              </div>

              <div className="min-w-0">
                <span
                  className="text-[11px] font-medium uppercase tracking-wide flex items-center gap-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Users size={13} /> Assigned To
                </span>
                {account.assignedTo ? (
                  <div className="flex items-center gap-2 mt-1.5">
                    <Avatar name={account.assignedTo.name} size="sm" />
                    <span
                      className="text-[13px] font-semibold break-words"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {account.assignedTo.name}
                    </span>
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
                    Unassigned
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Financials">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-5">
              <Field
                label="Annual Revenue"
                value={account.annualRevenue ? formatCurrency(account.annualRevenue) : null}
                icon={<Wallet size={13} />}
              />
              <Field label="Employees" value={account.employees} icon={<Users size={13} />} />
              <Field
                label="Credit Limit"
                value={account.creditLimit ? formatCurrency(account.creditLimit) : null}
              />
              <Field label="Currency" value={account.currency} />
              <Field label="Tax Number" value={account.taxNumber} icon={<Hash size={13} />} />
              <Field label="GST Number" value={account.gstNumber} icon={<Hash size={13} />} />
            </div>
          </SectionCard>

          <SectionCard title="Billing Address">
            <div className="p-4 sm:p-5">
              <Field label="Address" value={billingAddress} icon={<MapPin size={13} />} />
            </div>
          </SectionCard>

          {account.description ? (
            <SectionCard title="Description">
              <div className="p-4 sm:p-5">
                <p
                  className="text-[13px] whitespace-pre-wrap break-words"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {account.description}
                </p>
              </div>
            </SectionCard>
          ) : null}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-4 lg:space-y-6">
          <SectionCard title="Record Details">
            <div className="space-y-4 p-4 sm:p-5">
              <Field label="Account Number" value={account.accountNumber} icon={<Hash size={13} />} />
              <Field
                label="Created"
                value={account.createdAt ? new Date(account.createdAt).toLocaleDateString() : null}
                icon={<Calendar size={13} />}
              />
              <Field
                label="Updated"
                value={account.updatedAt ? new Date(account.updatedAt).toLocaleDateString() : null}
                icon={<Calendar size={13} />}
              />
              <div className="min-w-0">
                <span
                  className="text-[11px] font-medium uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Account ID
                </span>
                <p
                  className="text-[11px] font-mono break-all mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {account.id}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}