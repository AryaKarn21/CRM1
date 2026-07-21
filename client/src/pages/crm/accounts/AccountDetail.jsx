import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Building2, Upload, Download, Eye } from 'lucide-react'
import { accountsAPI } from '@/api/accounts.api'
import DataTable from '@/components/shared/DataTable'
import FilterBar from '@/components/shared/FilterBar'
import Badge from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import FormModal from '@/components/shared/FormModal'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema } from '@/lib/validations'

// Sequelize validators (isEmail) reject "" but accept null, so blank
// optional fields must be sent as null rather than empty strings.
const blankToNull = (data) => {
  const clean = {}
  for (const [key, value] of Object.entries(data)) {
    clean[key] = value === '' ? null : value
  }
  return clean
}

export default function AccountsList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)

  const [params, setParams] = useState({
    page: 1, limit: 20, search: '', type: '', sortKey: 'createdAt', sortDir: 'desc',
  })
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['accounts', params],
    queryFn: () => accountsAPI.getAll(params).then((r) => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountNumber: '', name: '', industry: '', type: '', status: 'Active',
      email: '', phone: '', mobile: '', website: '',
      annualRevenue: 0, employees: '', currency: 'NPR',
      billingStreet: '', billingCity: '', billingState: '',
      billingCountry: '', billingZip: '',
      taxNumber: '', gstNumber: '', description: '',
    },
  })

  // ── Mutations ──────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data) => accountsAPI.create(blankToNull(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setModalOpen(false)
      reset()
      toast.success('Account created successfully')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create account')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => accountsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Account deleted')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to delete account')
    },
  })

  const importMutation = useMutation({
    mutationFn: (formData) => accountsAPI.importAccounts(formData).then((r) => r.data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success(
        `Imported: ${result.created} created, ${result.skipped} skipped, ${result.failed} failed`
      )
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Import failed'),
  })

  // ── Import / Export handlers ───────────────────────────────
  const handleExport = async () => {
    try {
      const res = await accountsAPI.exportAccounts({ type: params.type })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `accounts-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Accounts exported')
    } catch {
      toast.error('Export failed')
    }
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    importMutation.mutate(formData)
    e.target.value = '' // allow re-importing the same file
  }

  // ── Table ──────────────────────────────────────────────────
  const columns = [
    {
      key: 'name',
      label: 'Account Name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--primary-light)' }}
          >
            <Building2 size={14} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {val}
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
              {row.website || row.email || '—'}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'industry', label: 'Industry' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => (val ? <Badge variant="info">{val}</Badge> : '—'),
    },
    {
      key: 'annualRevenue',
      label: 'Revenue',
      sortable: true,
      render: (val) => (val ? formatCurrency(val) : '—'),
    },
    { key: 'createdAt', label: 'Added', sortable: true, render: (val) => formatDate(val) },
    {
      key: 'id',
      label: 'Actions',
      render: (id) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/crm/accounts/${id}`)}>
            View
          </button>
          <button
            className="btn btn-ghost btn-sm text-blue-600"
            onClick={() => navigate(`/crm/accounts/${id}/edit`)}
          >
            Edit
          </button>
          <button
            className="btn btn-ghost btn-sm text-red-500"
            onClick={() => {
              if (window.confirm('Delete this account?')) deleteMutation.mutate(id)
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  // Mobile card (< sm): same info + same View/Edit/Delete actions as the
  // desktop table's Actions column, which DataTable's default mobile
  // fallback (first 3 columns only) doesn't include.
  const renderMobileCard = (row) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--primary-light)' }}
          >
            <Building2 size={15} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {row.name}
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
              {row.website || row.email || '—'}
            </p>
          </div>
        </div>
        {row.type ? <Badge variant="info" className="shrink-0">{row.type}</Badge> : null}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
        <span>{row.industry || '—'}</span>
        <span className="text-right">{row.phone || '—'}</span>
        <span>{row.annualRevenue ? formatCurrency(row.annualRevenue) : '—'}</span>
        <span className="text-right">{formatDate(row.createdAt)}</span>
      </div>

      <div
        className="flex items-center justify-end gap-2 pt-2 border-t"
        style={{ borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/crm/accounts/${row.id}`)}>
          <Eye size={13} /> View
        </button>
        <button
          className="btn btn-ghost btn-sm text-blue-600"
          onClick={() => navigate(`/crm/accounts/${row.id}/edit`)}
        >
          Edit
        </button>
        <button
          className="btn btn-ghost btn-sm text-red-500"
          onClick={() => {
            if (window.confirm('Delete this account?')) deleteMutation.mutate(row.id)
          }}
        >
          Delete
        </button>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      {/* ================= HEADER ================= */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6">
        <div>
          <h1
            className="text-[16px] sm:text-[18px] font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Accounts
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {data?.total ?? 0} total accounts
          </p>
        </div>

        {/* Buttons stack on phones, sit inline from sm up */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            className="btn btn-secondary w-full sm:w-auto justify-center"
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
          >
            <Upload size={14} /> {importMutation.isPending ? 'Importing...' : 'Import CSV'}
          </button>
          <button
            className="btn btn-secondary w-full sm:w-auto justify-center"
            onClick={handleExport}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            className="btn btn-primary w-full sm:w-auto justify-center"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={14} /> Add Account
          </button>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Search accounts..."
        filters={[
          {
            key: 'type',
            label: 'Type',
            options: ['Customer', 'Partner', 'Prospect', 'Competitor'].map((v) => ({
              label: v,
              value: v,
            })),
          },
        ]}
        values={params}
        onChange={(k, v) => setParams((p) => ({ ...p, [k]: v, page: 1 }))}
      />

      <div className="mx-4 sm:mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.accounts || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          sortKey={params.sortKey}
          sortDir={params.sortDir}
          onSort={(k, d) => setParams((p) => ({ ...p, sortKey: k, sortDir: d }))}
          onPageChange={(page) => setParams((p) => ({ ...p, page }))}
          onRowClick={(row) => navigate(`/crm/accounts/${row.id}`)}
          mobileCard={renderMobileCard}
          emptyTitle="No accounts yet"
          emptyDescription="Add your first account to get started"
        />
      </div>

      {/* ================= ADD ACCOUNT MODAL ================= */}
      <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          reset()
        }}
        title="Add Account"
        onSubmit={handleSubmit((d) => createMutation.mutate(d))}
        loading={createMutation.isPending}
        submitLabel="Create Account"
        size="lg"
      >
        <div className="flex flex-col gap-5">

          {/* ── Basic details ── */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Basic Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-2">
                <label className="form-label">Account Name *</label>
                <input className="input" placeholder="e.g. Acme Corp" {...register('name')} />
                {errors.name && <p className="text-[11px] text-red-500">{errors.name.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input className="input" placeholder="e.g. ACC-0001" {...register('accountNumber')} />
              </div>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <input className="input" placeholder="e.g. Manufacturing" {...register('industry')} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="input" {...register('type')}>
                  <option value="">Select type</option>
                  {['Customer', 'Partner', 'Prospect', 'Competitor', 'Vendor', 'Other'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="input" {...register('status')}>
                  <option value="">Select status</option>
                  {['Active', 'Inactive', 'Blocked'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Contact ── */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Contact
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="contact@example.com"
                  {...register('email')}
                />
                {errors.email && <p className="text-[11px] text-red-500">{errors.email.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input className="input" placeholder="https://example.com" {...register('website')} />
                {errors.website && (
                  <p className="text-[11px] text-red-500">{errors.website.message}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="input" placeholder="+977 98XXXXXXXX" {...register('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile</label>
                <input className="input" placeholder="+977 98XXXXXXXX" {...register('mobile')} />
              </div>
            </div>
          </div>

          {/* ── Financials ── */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Financials
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Annual Revenue</label>
                <input className="input" type="number" placeholder="0" {...register('annualRevenue')} />
                {errors.annualRevenue && (
                  <p className="text-[11px] text-red-500">{errors.annualRevenue.message}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Employees</label>
                <input className="input" type="number" placeholder="0" {...register('employees')} />
                {errors.employees && (
                  <p className="text-[11px] text-red-500">{errors.employees.message}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="input" {...register('currency')}>
                  {['NPR', 'USD', 'EUR', 'GBP', 'INR', 'AUD'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Billing address ── */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Billing Address
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-2">
                <label className="form-label">Street</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Street address"
                  {...register('billingStreet')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="input" placeholder="Kathmandu" {...register('billingCity')} />
              </div>
              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input className="input" placeholder="Bagmati" {...register('billingState')} />
              </div>
              <div className="form-group">
                <label className="form-label">ZIP / Postal Code</label>
                <input className="input" placeholder="44600" {...register('billingZip')} />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="input" placeholder="Nepal" {...register('billingCountry')} />
              </div>
            </div>
          </div>

          {/* ── Tax & notes ── */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Tax &amp; Notes
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Tax Number (PAN)</label>
                <input className="input" placeholder="e.g. 123456789" {...register('taxNumber')} />
              </div>
              <div className="form-group">
                <label className="form-label">GST / VAT Number</label>
                <input className="input" placeholder="e.g. 987654321" {...register('gstNumber')} />
              </div>
              <div className="form-group sm:col-span-2">
                <label className="form-label">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Notes about this account..."
                  {...register('description')}
                />
              </div>
            </div>
          </div>

        </div>
      </FormModal>
    </div>
  )
}