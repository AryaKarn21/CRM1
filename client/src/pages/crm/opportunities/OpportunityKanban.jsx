import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { List, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { opportunitiesAPI } from "@/api/opportunities.api";

import KanbanBoard from "@/components/shared/KanbanBoard";
import OpportunityFormModal from "@/components/shared/OpportunityFormModal";

import { formatCurrency } from "@/lib/utils";
import { OPPORTUNITY_STAGES } from "@/lib/constants";

export default function OpportunityKanban() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] =
    useState(false);

  // ==========================================================
  // LOAD OPPORTUNITIES
  // ==========================================================

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "opportunities-kanban",
    ],

    queryFn: () =>
      opportunitiesAPI
        .getAll({
          limit: 200,
        })
        .then(
          (response) =>
            response.data
        ),
  });

  // ==========================================================
  // UPDATE STAGE
  // ==========================================================

  const stageMutation =
    useMutation({
      mutationFn: ({
        id,
        stage,
      }) =>
        opportunitiesAPI.updateStage(
          id,
          stage
        ),

      /*
       * Optimistic update:
       * move the card immediately instead
       * of waiting for the API response.
       */
      onMutate: async ({
        id,
        stage,
      }) => {
        await queryClient.cancelQueries({
          queryKey: [
            "opportunities-kanban",
          ],
        });

        const previousData =
          queryClient.getQueryData([
            "opportunities-kanban",
          ]);

        queryClient.setQueryData(
          [
            "opportunities-kanban",
          ],
          (old) => {
            if (
              !old ||
              !Array.isArray(
                old.opportunities
              )
            ) {
              return old;
            }

            return {
              ...old,

              opportunities:
                old.opportunities.map(
                  (opportunity) =>
                    opportunity.id ===
                    id
                      ? {
                          ...opportunity,
                          stage,
                        }
                      : opportunity
                ),
            };
          }
        );

        return {
          previousData,
        };
      },

      onError: (
        error,
        _variables,
        context
      ) => {
        if (
          context?.previousData
        ) {
          queryClient.setQueryData(
            [
              "opportunities-kanban",
            ],
            context.previousData
          );
        }

        toast.error(
          error?.response?.data
            ?.message ||
            "Failed to update opportunity stage"
        );
      },

      onSuccess: () => {
        /*
         * A stage change must refresh
         * the normal opportunity list.
         */
        queryClient.invalidateQueries({
          queryKey: [
            "opportunities",
          ],
        });

        /*
         * Important:
         *
         * Moving a deal into or out of
         * "Closed Won" changes:
         *
         * - Won Deals
         * - Deals by Stage
         *
         * We will verify the exact Analytics
         * query key when we inspect that page.
         */
        queryClient.invalidateQueries({
          queryKey: ["reports"],
        });

        queryClient.invalidateQueries({
          queryKey: ["analytics"],
        });
      },

      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "opportunities-kanban",
          ],
        });
      },
    });

  // ==========================================================
  // DRAG AND DROP
  // ==========================================================

  const handleDragEnd = (
    result
  ) => {
    if (!result?.destination) {
      return;
    }

    const id =
      result.draggableId;

    const newStage =
      result.destination
        .droppableId;

    if (!id || !newStage) {
      return;
    }

    /*
     * If the card was dropped back into
     * the same stage, no API call is needed.
     */
    if (
      result.source
        ?.droppableId ===
      newStage
    ) {
      return;
    }

    stageMutation.mutate({
      id,
      stage: newStage,
    });
  };

  // ==========================================================
  // KANBAN COLUMNS
  // ==========================================================

  const opportunities =
    data?.opportunities || [];

  const columns =
    OPPORTUNITY_STAGES.map(
      (stage) => {
        const stageCards =
          opportunities.filter(
            (opportunity) =>
              opportunity.stage ===
              stage
          );

        return {
          key: stage,

          label: stage,

          count:
            stageCards.length,

          total:
            stageCards.reduce(
              (
                sum,
                opportunity
              ) =>
                sum +
                Number(
                  opportunity.value ||
                    0
                ),
              0
            ),
        };
      }
    );

  // ==========================================================
  // CARD
  // ==========================================================

  const cardRenderer = (
    card
  ) => {
    const probability =
      Number(card.probability);

    const safeProbability =
      Number.isFinite(
        probability
      )
        ? Math.min(
            Math.max(
              probability,
              0
            ),
            100
          )
        : null;

    return (
      <div className="min-w-0">
        {/* Opportunity name */}

        <p
          className="mb-1 break-words text-[12px] font-semibold leading-5"
          style={{
            color:
              "var(--text-primary)",
          }}
        >
          {card.name ||
            "Unnamed opportunity"}
        </p>

        {/* Account */}

        {card.account?.name && (
          <p
            className="truncate text-[11px]"
            style={{
              color:
                "var(--text-muted)",
            }}
            title={
              card.account.name
            }
          >
            {card.account.name}
          </p>
        )}

        {/* Value */}

        {Number(card.value) >
          0 && (
          <p
            className="mt-2 break-words text-[13px] font-bold"
            style={{
              color:
                "var(--primary)",
            }}
          >
            {formatCurrency(
              card.value
            )}
          </p>
        )}

        {/* Probability */}

        {safeProbability !==
          null && (
          <div className="mt-2 flex min-w-0 items-center gap-1.5">
            <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--primary)]"
                style={{
                  width: `${safeProbability}%`,
                }}
              />
            </div>

            <span
              className="shrink-0 text-[10px]"
              style={{
                color:
                  "var(--text-muted)",
              }}
            >
              {safeProbability}%
            </span>
          </div>
        )}

        {/* Owner */}

        {card.assignedTo
          ?.name && (
          <p
            className="mt-2 truncate text-[10px]"
            style={{
              color:
                "var(--text-muted)",
            }}
            title={
              card.assignedTo.name
            }
          >
            Owner:{" "}
            {
              card.assignedTo
                .name
            }
          </p>
        )}
      </div>
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-w-0 animate-fade-in">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="page-header flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1
            className="text-[18px] font-bold"
            style={{
              color:
                "var(--text-primary)",
            }}
          >
            Opportunity Pipeline
          </h1>

          <p
            className="mt-0.5 text-[12px]"
            style={{
              color:
                "var(--text-muted)",
            }}
          >
            {data?.total ??
              opportunities.length}{" "}
            opportunities
          </p>
        </div>

        {/* Header Actions */}

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            className="btn btn-secondary btn-sm flex w-full items-center justify-center gap-1.5 sm:w-auto"
            onClick={() =>
              navigate(
                "/crm/opportunities"
              )
            }
          >
            <List size={14} />

            <span>
              List View
            </span>
          </button>

          <button
            type="button"
            className="btn btn-primary flex w-full items-center justify-center gap-1.5 sm:w-auto"
            onClick={() =>
              setModalOpen(true)
            }
          >
            <Plus size={14} />

            <span>
              Add Opportunity
            </span>
          </button>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ====================================================== */}

      {isLoading && (
        <div className="w-full overflow-x-auto px-3 pb-6 pt-4 sm:px-4 md:px-6">
          <div className="flex min-w-max gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="h-[360px] w-[82vw] max-w-[280px] shrink-0 animate-pulse rounded-xl bg-[var(--border)] sm:h-[400px] sm:w-[280px]"
                />
              )
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {!isLoading &&
        isError && (
          <div className="mx-3 mt-4 rounded-xl border border-red-200 bg-red-50 p-6 text-center sm:mx-4 md:mx-6 dark:border-red-900/50 dark:bg-red-950/20">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              Failed to load
              opportunities
            </p>

            <p className="mt-1 text-xs text-red-500">
              {error?.response
                ?.data?.message ||
                error?.message ||
                "Unable to load the opportunity pipeline."}
            </p>

            <button
              type="button"
              className="btn btn-secondary btn-sm mt-4"
              onClick={() =>
                refetch()
              }
            >
              Retry
            </button>
          </div>
        )}

      {/* =====================================================
          KANBAN
      ====================================================== */}

      {!isLoading &&
        !isError && (
          <div className="min-w-0 overflow-hidden">
            <KanbanBoard
              columns={columns}
              cards={
                opportunities
              }
              onDragEnd={
                handleDragEnd
              }
              onCardClick={(
                card
              ) =>
                navigate(
                  `/crm/opportunities/${card.id}`
                )
              }
              cardRenderer={
                cardRenderer
              }
            />
          </div>
        )}

      {/* =====================================================
          CREATE OPPORTUNITY
      ====================================================== */}

      <OpportunityFormModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
      />
    </div>
  );
}