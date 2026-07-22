import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

import { settingsAPI } from '@/api/settings.api'

export default function UserEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [companies, setCompanies] = useState([])

  const { data: companiesData } = useQuery({
    queryKey: ['companies'],
    queryFn: () =>
      settingsAPI.getCompanies().then((res) => res.data),
  })

  useEffect(() => {
    if (companiesData) {
      setCompanies(companiesData)
    }
  }, [companiesData])

  // Load User
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => settingsAPI.getUserById(id).then(res => res.data),
  })

  // Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      primaryCompany: '',
      companies: [],
    },
  })

  // Populate Form
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'employee',
        primaryCompany: user.company?.id || '',
        companies:
          user.companies?.map((company) => company.id) || [],
      })
    }
  }, [user, reset])

  // Update User
  const updateMutation = useMutation({
    mutationFn: (data) => settingsAPI.updateUser(id, data),

    onSuccess: () => {
      toast.success('User updated successfully')

      queryClient.invalidateQueries({
        queryKey: ['settings-users'],
      })

      queryClient.invalidateQueries({
        queryKey: ['user', id],
      })

      navigate(`/settings/users/${id}`)
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
        'Failed to update user'
      )
    },
  })

  if (isLoading) {
    return (
      <div className="p-8">
        Loading User...
      </div>
    )
  }

  return (
    <div className="animate-fade-in">

      {/* Header */}

      <div className="page-header">

        <div className="flex items-center gap-3">

          <button
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
          </button>

          <div>

            <h1
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Edit User
            </h1>

            <p
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {user?.name}
            </p>

          </div>

        </div>

      </div>

      {/* Form */}

      <form
        className="card mx-6 p-6 flex flex-col gap-5"
        onSubmit={handleSubmit((data) =>
          updateMutation.mutate(data)
        )}
      >

        <div className="grid grid-cols-2 gap-5">

          <div className="form-group">

            <label className="form-label">
              Name
            </label>

            <input
              className="input"
              {...register('name', {
                required: 'Name is required',
              })}
            />

            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message}
              </p>
            )}

          </div>

          <div className="form-group">

            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="input"
              {...register('email', {
                required: 'Email is required',
              })}
            />

          </div>

        </div>

        <div className="grid grid-cols-2 gap-5">

          <div className="form-group">

            <label className="form-label">
              Phone
            </label>

            <input
              className="input"
              {...register('phone')}
            />

          </div>

          <div className="form-group">

            <label className="form-label">
              Role
            </label>

            <select
              className="input"
              {...register('role')}
            >
              <option value="super_admin">
                Super Admin
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="manager">
                Manager
              </option>

              <option value="accountant">
                Accountant
              </option>

              <option value="employee">
                Employee
              </option>

            </select>

          </div>

        </div>

        <div className="form-group">
          <label className="form-label">
            Primary Company
          </label>

          <select
            className="input"
            {...register("primaryCompany")}
          >
            <option value="">
              Select Company
            </option>

            {companies.map((company) => (
              <option
                key={company.id}
                value={company.id}
              >
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Accessible Companies
          </label>

          <div className="flex flex-col gap-2">
            {companies.map((company) => (
              <label
                key={company.id}
                className="flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  value={company.id}
                  {...register("companies")}
                />

                {company.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending
              ? 'Updating...'
              : 'Update User'}
          </button>

        </div>

      </form>

    </div>
  )
}