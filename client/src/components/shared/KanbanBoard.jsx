import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { Plus } from "lucide-react";

import Badge from "@/components/ui/Badge";

import {
  cn,
  formatCurrency,
  classifyStatus,
} from "@/lib/utils";

export default function KanbanBoard({
  columns = [],
  cards = [],
  onDragEnd,
  onCardClick,
  onAddCard,
  cardRenderer,
}) {
  /*
   * Sequelize models use `id`.
   *
   * A small `_id` fallback is retained so this shared
   * component does not immediately break if another
   * older module still passes Mongo-shaped cards.
   */
  const getCardId = (card) =>
    String(card?.id || card?._id || "");

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/*
       * Horizontal scrolling belongs to the outer board.
       *
       * Mobile:
       * - nearly full-screen columns
       * - horizontal swipe between stages
       *
       * Tablet/Desktop:
       * - fixed-width columns
       * - horizontal scroll when all stages do not fit
       */}
      <div
        className="
          flex
          w-full
          min-w-0
          snap-x
          snap-mandatory
          gap-3
          overflow-x-auto
          overscroll-x-contain
          px-3
          pb-6
          pt-4
          sm:gap-4
          sm:px-4
          md:px-6
        "
        style={{
          minHeight:
            "calc(100vh - 180px)",
          WebkitOverflowScrolling:
            "touch",
        }}
      >
        {columns.map((column) => {
          const columnCards =
            cards.filter(
              (card) =>
                card.stage ===
                  column.key ||
                card.status ===
                  column.key
            );

          return (
            <div
              key={column.key}
              className="
                kanban-column
                flex
                w-[86vw]
                max-w-[320px]
                shrink-0
                snap-start
                flex-col
                overflow-hidden
                sm:w-[290px]
                md:w-[300px]
              "
            >
              {/* ==============================
                  COLUMN HEADER
              =============================== */}

              <div
                className="
                  flex
                  min-w-0
                  items-start
                  justify-between
                  gap-2
                  border-b
                  px-3
                  py-3
                  sm:px-4
                "
                style={{
                  borderColor:
                    "var(--border)",
                }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="
                      min-w-0
                      truncate
                      text-[13px]
                      font-semibold
                    "
                    style={{
                      color:
                        "var(--text-primary)",
                    }}
                    title={column.label}
                  >
                    {column.label}
                  </span>

                  <span
                    className="
                      shrink-0
                      rounded-full
                      px-1.5
                      py-0.5
                      text-[11px]
                      font-medium
                    "
                    style={{
                      background:
                        "var(--border)",

                      color:
                        "var(--text-muted)",
                    }}
                  >
                    {columnCards.length}
                  </span>
                </div>

                {column.total !==
                  undefined && (
                  <span
                    className="
                      shrink-0
                      whitespace-nowrap
                      text-right
                      text-[10px]
                      font-medium
                      sm:text-[11px]
                    "
                    style={{
                      color:
                        "var(--text-muted)",
                    }}
                    title={formatCurrency(
                      column.total || 0
                    )}
                  >
                    {formatCurrency(
                      column.total || 0
                    )}
                  </span>
                )}
              </div>

              {/* ==============================
                  DROPPABLE CARD AREA
              =============================== */}

              <Droppable
                droppableId={String(
                  column.key
                )}
              >
                {(
                  provided,
                  snapshot
                ) => (
                  <div
                    ref={
                      provided.innerRef
                    }
                    {...provided.droppableProps}
                    className={cn(
                      `
                        flex
                        min-h-[180px]
                        flex-1
                        flex-col
                        gap-2
                        overflow-y-auto
                        p-2
                        transition-colors
                      `,

                      snapshot.isDraggingOver &&
                        "bg-[var(--primary-light)]"
                    )}
                  >
                    {columnCards.map(
                      (
                        card,
                        index
                      ) => {
                        const cardId =
                          getCardId(
                            card
                          );

                        /*
                         * @hello-pangea/dnd requires
                         * a non-empty string ID.
                         *
                         * Invalid cards are skipped
                         * instead of creating a broken
                         * draggable item.
                         */
                        if (!cardId) {
                          return null;
                        }

                        return (
                          <Draggable
                            key={
                              cardId
                            }
                            draggableId={
                              cardId
                            }
                            index={
                              index
                            }
                          >
                            {(
                              dragProvided,
                              dragSnapshot
                            ) => (
                              <div
                                ref={
                                  dragProvided.innerRef
                                }
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                role="button"
                                tabIndex={
                                  0
                                }
                                className={cn(
                                  `
                                    kanban-card
                                    min-w-0
                                    cursor-pointer
                                    touch-manipulation
                                  `,

                                  dragSnapshot.isDragging &&
                                    "shadow-lg ring-2 ring-[var(--primary)]"
                                )}
                                onClick={() =>
                                  onCardClick?.(
                                    card
                                  )
                                }
                                onKeyDown={(
                                  event
                                ) => {
                                  if (
                                    event.key ===
                                      "Enter" ||
                                    event.key ===
                                      " "
                                  ) {
                                    event.preventDefault();

                                    onCardClick?.(
                                      card
                                    );
                                  }
                                }}
                              >
                                {cardRenderer
                                  ? cardRenderer(
                                      card
                                    )
                                  : (
                                      <DefaultCard
                                        card={
                                          card
                                        }
                                      />
                                    )}
                              </div>
                            )}
                          </Draggable>
                        );
                      }
                    )}

                    {provided.placeholder}

                    {/* Add Card */}

                    {onAddCard && (
                      <button
                        type="button"
                        onClick={() =>
                          onAddCard(
                            column.key
                          )
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          px-3
                          py-2.5
                          text-[12px]
                          transition-colors
                          hover:bg-[var(--surface-2)]
                          sm:justify-start
                          sm:py-2
                        "
                        style={{
                          color:
                            "var(--text-muted)",
                        }}
                      >
                        <Plus
                          size={13}
                        />

                        <span>
                          Add card
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

// ============================================================
// DEFAULT CARD
// ============================================================

function DefaultCard({ card }) {
  const title =
    card?.name ||
    card?.title ||
    "Untitled";

  const value =
    Number(card?.value);

  return (
    <div className="min-w-0">
      <p
        className="
          mb-1
          break-words
          text-[13px]
          font-medium
          leading-5
        "
        style={{
          color:
            "var(--text-primary)",
        }}
      >
        {title}
      </p>

      {Number.isFinite(value) &&
        value > 0 && (
          <p
            className="
              break-words
              text-[12px]
              font-semibold
            "
            style={{
              color:
                "var(--primary)",
            }}
          >
            {formatCurrency(value)}
          </p>
        )}

      {card?.status && (
        <Badge
          variant={classifyStatus(
            card.status
          )}
          className="mt-2"
        >
          {card.status}
        </Badge>
      )}
    </div>
  );
}