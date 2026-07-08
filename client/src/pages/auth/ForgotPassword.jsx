import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '@/api/auth.api'

const schema = z.object({
  email: z.string().email('Invalid email')
})

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      await authAPI.forgotPassword(data.email)

      toast.success('OTP sent successfully')

      navigate('/verify-otp', {
        state: {
          email: data.email,
          resetPassword: true
        }
      })
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to send OTP'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">

      <div className="w-full max-w-md rounded-xl border p-8 bg-[var(--card-bg)]">

        <div className="flex items-center gap-2 mb-6">
          <Building2 className="text-[var(--primary)]" />
          <h2 className="text-2xl font-bold">
            Forgot Password
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label>Email</label>

            <div className="relative">

              <Mail size={16} className="absolute left-3 top-3" />

              <input
                {...register('email')}
                className="input pl-10"
                placeholder="Enter your email"
              />

            </div>

            {errors.email && (
              <p className="text-red-500 text-sm">
                {errors.email.message}
              </p>
            )}

          </div>

          <button
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

        </form>

      </div>

    </div>
  )
}