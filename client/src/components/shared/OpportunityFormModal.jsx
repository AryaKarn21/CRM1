import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { opportunitiesAPI } from '@/api/opportunities.api'
import { accountsAPI } from '@/api/accounts.api'
import { settingsAPI } from '@/api/settings.api'

import FormModal from '@/components/shared/FormModal'

import { opportunitySchema } from '@/lib/validations'
import { OPPORTUNITY_STAGES } from '@/lib/constants'

export default function OpportunityFormModal({
  open,
  onClose,
}) {
  const queryClient = useQueryClient()

  // ==========================================================
  // ACCOUNT OPTIONS
  // ==========================================================

  const {
    data: accountsData,
    isLoading: accountsLoading,
  } = useQuery({
    queryKey: ['accounts-options'],

    queryFn: () =>
      accountsAPI
        .getAll({
          limit: 200,
        })
        .then((response) => response.data),

    enabled: open,

    staleTime: 5 * 60 * 1000,
  })

  // ==========================================================
  // USER OPTIONS
  // ==========================================================

  const {
    data: usersData,
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ['users-options'],

    queryFn: () =>
      settingsAPI
        .getUsers({
          limit: 200,
        })
        .then((response) => response.data),

    enabled: open,

    staleTime: 5 * 60 * 1000,
  })

  // ==========================================================
  // FORM
  // ==========================================================

  const {
    register,
    handleSubmit,
    reset,

    formState: {
      errors,
    },
  } = useForm({
    resolver: zodResolver(
      opportunitySchema
    ),

    defaultValues: {
      name: '',
      accountId: '',
      assignedToId: '',
      stage: 'Prospecting',
      value: 0,
      probability: 10,
      closeDate: '',
      description: '',
    },
  })

  // ==========================================================
  // CREATE OPPORTUNITY
  // ==========================================================

  const createMutation = useMutation({
    mutationFn: (payload) =>
      opportunitiesAPI.create(
        payload
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'opportunities',
        ],
      })

      queryClient.invalidateQueries({
        queryKey: [
          'opportunities-kanban',
        ],
      })

      /*
       * Opportunity creation can affect:
       * - Won Deals
       * - Deals by Stage
       * - Pipeline statistics
       *
       * Invalidating report queries prevents
       * analytics from remaining stale.
       */
      queryClient.invalidateQueries({
        queryKey: ['reports'],
      })

      queryClient.invalidateQueries({
        queryKey: ['analytics'],
      })

      reset()

      onClose()

      toast.success(
        'Opportunity created'
      )
    },

    onError: (error) => {
      toast.error(
        error?.response?.data
          ?.message ||
          'Failed to create opportunity'
      )
    },
  })

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const onSubmit = (data) => {
    /*
     * Keep the frontend payload aligned
     * with the Sequelize model/API.
     *
     * Empty optional UUID values are
     * converted to null instead of "".
     */
    const payload = {
      ...data,

      accountId:
        data.accountId || null,

      assignedToId:
        data.assignedToId ||
        null,

      value: Number(
        data.value || 0
      ),

      probability: Number(
        data.probability || 0
      ),
    }

    createMutation.mutate(
      payload
    )
  }

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = () => {
    if (
      createMutation.isPending
    ) {
      return
    }

    reset()

    onClose()
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const accounts =
    accountsData?.accounts ||
    []

  const users =
    usersData?.users ||
    []

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Add Opportunity"
      onSubmit={handleSubmit(
        onSubmit
      )}
      loading={
        createMutation.isPending
      }
      submitLabel="Create Opportunity"
      size="lg"
    >
      <div className="flex w-full min-w-0 flex-col gap-4">
        {/* Opportunity Name */}

        <div className="form-group min-w-0">
          <label
            className="form-label"
            htmlFor="opportunity-name"
          >
            Opportunity Name *
          </label>

          <input
            id="opportunity-name"
            className="input w-full"
            placeholder="e.g. Annual contract renewal"
            autoComplete="off"
            {...register('name')}
          />

          {errors.name && (
            <p
              role="alert"
              className="mt-1 text-[11px] text-red-500"
            >
              {
                errors.name
                  .message
              }
            </p>
          )}
        </div>

        {/*
         * Responsive layout:
         *
         * Mobile  -> 1 column
         * Tablet+ -> 2 columns
         */}

        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          {/* Account */}

          <div className="form-group min-w-0">
            <label
              className="form-label"
              htmlFor="opportunity-account"
            >
              Account *
            </label>

            <select
              id="opportunity-account"
              className="input w-full min-w-0"
              disabled={
                accountsLoading
              }
              {...register(
                'accountId'
              )}
            >
              <option value="">
                {accountsLoading
                  ? 'Loading accounts...'
                  : 'Select account'}
              </option>

              {accounts.map(
                (account) => (
                  <option
                    key={
                      account.id
                    }
                    value={
                      account.id
                    }
                  >
                    {
                      account.name
                    }
                  </option>
                )
              )}
            </select>

            {errors.accountId && (
              <p
                role="alert"
                className="mt-1 text-[11px] text-red-500"
              >
                {
                  errors
                    .accountId
                    .message
                }
              </p>
            )}
          </div>

          {/* Stage */}

          <div className="form-group min-w-0">
            <label
              className="form-label"
              htmlFor="opportunity-stage"
            >
              Stage
            </label>

            <select
              id="opportunity-stage"
              className="input w-full min-w-0"
              {...register(
                'stage'
              )}
            >
              {OPPORTUNITY_STAGES.map(
                (stage) => (
                  <option
                    key={stage}
                    value={stage}
                  >
                    {stage}
                  </option>
                )
              )}
            </select>

            {errors.stage && (
              <p
                role="alert"
                className="mt-1 text-[11px] text-red-500"
              >
                {
                  errors.stage
                    .message
                }
              </p>
            )}
          </div>

          {/* Value */}

          <div className="form-group min-w-0">
            <label
              className="form-label"
              htmlFor="opportunity-value"
            >
              Value (NPR) *
            </label>

            <input
              id="opportunity-value"
              className="input w-full"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0"
              {...register(
                'value',
                {
                  valueAsNumber:
                    true,
                }
              )}
            />

            {errors.value && (
              <p
                role="alert"
                className="mt-1 text-[11px] text-red-500"
              >
                {
                  errors.value
                    .message
                }
              </p>
            )}
          </div>

          {/* Probability */}

          <div className="form-group min-w-0">
            <label
              className="form-label"
              htmlFor="opportunity-probability"
            >
              Probability (%)
            </label>

            <input
              id="opportunity-probability"
              className="input w-full"
              type="number"
              min="0"
              max="100"
              step="1"
              inputMode="numeric"
              {...register(
                'probability',
                {
                  valueAsNumber:
                    true,
                }
              )}
            />

            {errors.probability && (
              <p
                role="alert"
                className="mt-1 text-[11px] text-red-500"
              >
                {
                  errors
                    .probability
                    .message
                }
              </p>
            )}
          </div>

          {/* Close Date */}

          <div className="form-group min-w-0">
            <label
              className="form-label"
              htmlFor="opportunity-close-date"
            >
              Close Date *
            </label>

            <input
              id="opportunity-close-date"
              className="input w-full"
              type="date"
              {...register(
                'closeDate'
              )}
            />

            {errors.closeDate && (
              <p
                role="alert"
                className="mt-1 text-[11px] text-red-500"
              >
                {
                  errors
                    .closeDate
                    .message
                }
              </p>
            )}
          </div>

          {/* Assigned To */}

          <div className="form-group min-w-0">
            <label
              className="form-label"
              htmlFor="opportunity-assigned-to"
            >
              Assigned To
            </label>

            <select
              id="opportunity-assigned-to"
              className="input w-full min-w-0"
              disabled={
                usersLoading
              }
              {...register(
                'assignedToId'
              )}
            >
              <option value="">
                {usersLoading
                  ? 'Loading users...'
                  : 'Unassigned'}
              </option>

              {users.map(
                (user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.name}
                  </option>
                )
              )}
            </select>

            {errors.assignedToId && (
              <p
                role="alert"
                className="mt-1 text-[11px] text-red-500"
              >
                {
                  errors
                    .assignedToId
                    .message
                }
              </p>
            )}
          </div>
        </div>

        {/* Description */}

        <div className="form-group min-w-0">
          <label
            className="form-label"
            htmlFor="opportunity-description"
          >
            Description
          </label>

          <textarea
            id="opportunity-description"
            className="input min-h-[96px] w-full resize-y"
            rows={4}
            placeholder="Additional details..."
            {...register(
              'description'
            )}
          />

          {errors.description && (
            <p
              role="alert"
              className="mt-1 text-[11px] text-red-500"
            >
              {
                errors
                  .description
                  .message
              }
            </p>
          )}
        </div>
      </div>
    </FormModal>
  )
}