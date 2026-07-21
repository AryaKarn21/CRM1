import express from "express";
import { Op } from "sequelize";

import {
  Opportunity,
  Account,
  User,
} from "../models/index.js";

import { protect } from "../middleware/auth.js";

import {
  createNotification,
} from "../services/notification.service.js";

const router = express.Router();

const OPPORTUNITY_STAGES = [
  "Prospecting",
  "Qualification",
  "Needs Analysis",
  "Value Proposition",
  "Decision Makers",
  "Perception Analysis",
  "Proposal/Price",
  "Negotiation/Review",
  "Closed Won",
  "Closed Lost",
];

const ALLOWED_SORT_KEYS = new Set([
  "name",
  "stage",
  "value",
  "probability",
  "closeDate",
  "createdAt",
  "updatedAt",
]);

const WRITABLE_FIELDS = [
  "name",
  "accountId",
  "assignedToId",
  "stage",
  "value",
  "probability",
  "closeDate",
  "description",
];

function getCompanyId(req) {
  return req.companyId;
}

function buildOpportunityScope(req) {
  const where = {};

  if (req.companyId) {
    where.companyId =
      req.companyId;
  }

  return where;
}

function pickWritableFields(body = {}) {
  const payload = {};

  for (const field of WRITABLE_FIELDS) {
    if (
      body[field] !== undefined
    ) {
      payload[field] =
        body[field];
    }
  }

  return payload;
}

function normalizeOptionalUuid(
  value
) {
  if (
    value === "" ||
    value === undefined
  ) {
    return null;
  }

  return value;
}

function validateOpportunityPayload(
  payload,
  {
    partial = false,
  } = {}
) {
  if (
    !partial &&
    (!payload.name ||
      !String(
        payload.name
      ).trim())
  ) {
    const error = new Error(
      "Opportunity name is required"
    );

    error.status = 400;

    throw error;
  }

  if (
    payload.stage !==
      undefined &&
    !OPPORTUNITY_STAGES.includes(
      payload.stage
    )
  ) {
    const error = new Error(
      "Invalid opportunity stage"
    );

    error.status = 400;

    throw error;
  }

  if (
    payload.value !==
      undefined &&
    (!Number.isFinite(
      Number(payload.value)
    ) ||
      Number(payload.value) < 0)
  ) {
    const error = new Error(
      "Opportunity value must be 0 or greater"
    );

    error.status = 400;

    throw error;
  }

  if (
    payload.probability !==
    undefined
  ) {
    const probability = Number(
      payload.probability
    );

    if (
      !Number.isFinite(
        probability
      ) ||
      probability < 0 ||
      probability > 100
    ) {
      const error = new Error(
        "Probability must be between 0 and 100"
      );

      error.status = 400;

      throw error;
    }
  }
}

async function findScopedOpportunity(
  req,
  id,
  options = {}
) {
  return Opportunity.findOne({
    where: {
      id,
      ...buildOpportunityScope(
        req
      ),
    },

    ...options,
  });
}

// ============================================================
// GET ALL OPPORTUNITIES
// ============================================================

router.get(
  "/",
  protect,
  async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        stage,
        sortKey = "value",
        sortDir = "desc",
      } = req.query;

      const parsedPage =
        Math.max(
          Number.parseInt(
            page,
            10
          ) || 1,
          1
        );

      const parsedLimit =
        Math.min(
          Math.max(
            Number.parseInt(
              limit,
              10
            ) || 20,
            1
          ),
          200
        );

      const where = {
        ...buildOpportunityScope(
          req
        ),
      };

      if (stage) {
        if (
          !OPPORTUNITY_STAGES.includes(
            stage
          )
        ) {
          return res
            .status(400)
            .json({
              message:
                "Invalid opportunity stage",
            });
        }

        where.stage = stage;
      }

      if (
        search &&
        String(search).trim()
      ) {
        where.name = {
          [Op.like]: `%${String(
            search
          ).trim()}%`,
        };
      }

      const safeSortKey =
        ALLOWED_SORT_KEYS.has(
          sortKey
        )
          ? sortKey
          : "value";

      const safeSortDir =
        String(
          sortDir
        ).toLowerCase() ===
        "asc"
          ? "ASC"
          : "DESC";

      const offset =
        (parsedPage - 1) *
        parsedLimit;

      const {
        rows: opportunities,
        count: total,
      } =
        await Opportunity.findAndCountAll(
          {
            where,

            offset,

            limit:
              parsedLimit,

            order: [
              [
                safeSortKey,
                safeSortDir,
              ],
            ],

            include: [
              {
                model: Account,
                as: "account",

                attributes: [
                  "id",
                  "name",
                ],

                required: false,
              },

              {
                model: User,
                as: "assignedTo",

                attributes: [
                  "id",
                  "name",
                ],

                required: false,
              },
            ],

            distinct: true,
          }
        );

      const totalPages =
        total === 0
          ? 0
          : Math.ceil(
              total /
                parsedLimit
            );

      return res.json({
        opportunities,

        total,

        pagination: {
          page: parsedPage,

          limit:
            parsedLimit,

          total,

          totalPages,

          hasNextPage:
            parsedPage <
            totalPages,

          hasPreviousPage:
            parsedPage > 1,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

// ============================================================
// GET OPPORTUNITY BY ID
// ============================================================

router.get(
  "/:id",
  protect,
  async (req, res, next) => {
    try {
      const opportunity =
        await findScopedOpportunity(
          req,
          req.params.id,
          {
            include: [
              {
                model: Account,

                as: "account",

                attributes: [
                  "id",
                  "name",
                ],
              },

              {
                model: User,

                as: "assignedTo",

                attributes: [
                  "id",
                  "name",
                ],
              },
            ],
          }
        );

      if (!opportunity) {
        return res
          .status(404)
          .json({
            message:
              "Opportunity not found",
          });
      }

      return res.json(
        opportunity
      );
    } catch (error) {
      return next(error);
    }
  }
);

// ============================================================
// CREATE OPPORTUNITY
// ============================================================

router.post(
  "/",
  protect,
  async (req, res, next) => {
    try {
      const companyId =
        getCompanyId(req);

      if (!companyId) {
        return res
          .status(400)
          .json({
            message:
              "Select a company before creating an opportunity.",
          });
      }

      const payload =
        pickWritableFields(
          req.body
        );

      payload.name =
        String(
          payload.name || ""
        ).trim();

      payload.accountId =
        normalizeOptionalUuid(
          payload.accountId
        );

      payload.assignedToId =
        normalizeOptionalUuid(
          payload.assignedToId
        );

      if (
        payload.value !==
        undefined
      ) {
        payload.value =
          Number(
            payload.value
          );
      }

      if (
        payload.probability !==
        undefined
      ) {
        payload.probability =
          Number(
            payload.probability
          );
      }

      validateOpportunityPayload(
        payload
      );

      const opportunity =
        await Opportunity.create({
          ...payload,

          companyId,
        });

      await createNotification({
        companyId:
          opportunity.companyId,

        userId: req.user.id,

        senderId:
          req.user.id,

        module: "crm",

        type:
          "opportunity_created",

        title:
          "New Opportunity Created",

        message: `${opportunity.name} has been created successfully.`,

        priority: "medium",

        actionUrl:
          `/crm/opportunities/${opportunity.id}`,

        metadata: {
          opportunityId:
            opportunity.id,
        },
      });

      return res
        .status(201)
        .json(opportunity);
    } catch (error) {
      if (error.status) {
        return res
          .status(error.status)
          .json({
            message:
              error.message,
          });
      }

      return next(error);
    }
  }
);

// ============================================================
// UPDATE OPPORTUNITY
// ============================================================

router.patch(
  "/:id",
  protect,
  async (req, res, next) => {
    try {
      const opportunity =
        await findScopedOpportunity(
          req,
          req.params.id
        );

      if (!opportunity) {
        return res
          .status(404)
          .json({
            message:
              "Opportunity not found",
          });
      }

      const previousAssignee =
        opportunity.assignedToId;

      const payload =
        pickWritableFields(
          req.body
        );

      if (
        payload.name !==
        undefined
      ) {
        payload.name =
          String(
            payload.name
          ).trim();
      }

      if (
        payload.accountId !==
        undefined
      ) {
        payload.accountId =
          normalizeOptionalUuid(
            payload.accountId
          );
      }

      if (
        payload.assignedToId !==
        undefined
      ) {
        payload.assignedToId =
          normalizeOptionalUuid(
            payload.assignedToId
          );
      }

      if (
        payload.value !==
        undefined
      ) {
        payload.value =
          Number(
            payload.value
          );
      }

      if (
        payload.probability !==
        undefined
      ) {
        payload.probability =
          Number(
            payload.probability
          );
      }

      validateOpportunityPayload(
        payload,
        {
          partial: true,
        }
      );

      await opportunity.update(
        payload
      );

      if (
        payload.assignedToId &&
        payload.assignedToId !==
          previousAssignee
      ) {
        await createNotification({
          companyId:
            opportunity.companyId,

          userId:
            payload.assignedToId,

          senderId:
            req.user.id,

          module: "crm",

          type:
            "opportunity_assigned",

          title:
            "Opportunity Assigned",

          message: `${opportunity.name} has been assigned to you.`,

          priority: "high",

          actionUrl:
            `/crm/opportunities/${opportunity.id}`,

          metadata: {
            opportunityId:
              opportunity.id,
          },
        });
      }

      await createNotification({
        companyId:
          opportunity.companyId,

        userId: req.user.id,

        senderId:
          req.user.id,

        module: "crm",

        type:
          "opportunity_updated",

        title:
          "Opportunity Updated",

        message: `${opportunity.name} has been updated successfully.`,

        priority: "medium",

        actionUrl:
          `/crm/opportunities/${opportunity.id}`,

        metadata: {
          opportunityId:
            opportunity.id,
        },
      });

      return res.json(
        opportunity
      );
    } catch (error) {
      if (error.status) {
        return res
          .status(error.status)
          .json({
            message:
              error.message,
          });
      }

      return next(error);
    }
  }
);

// ============================================================
// UPDATE STAGE
// ============================================================

router.patch(
  "/:id/stage",
  protect,
  async (req, res, next) => {
    try {
      const {
        stage,
      } = req.body;

      if (
        !OPPORTUNITY_STAGES.includes(
          stage
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid opportunity stage",
          });
      }

      const opportunity =
        await findScopedOpportunity(
          req,
          req.params.id
        );

      if (!opportunity) {
        return res
          .status(404)
          .json({
            message:
              "Opportunity not found",
          });
      }

      const previousStage =
        opportunity.stage;

      if (
        previousStage === stage
      ) {
        return res.json(
          opportunity
        );
      }

      await opportunity.update({
        stage,
      });

      /*
       * A stage change is especially important
       * for analytics:
       *
       * - Deals by Stage
       * - Won Deals when entering/leaving Closed Won
       */

      return res.json(
        opportunity
      );
    } catch (error) {
      return next(error);
    }
  }
);

// ============================================================
// DELETE OPPORTUNITY
// ============================================================

router.delete(
  "/:id",
  protect,
  async (req, res, next) => {
    try {
      const opportunity =
        await findScopedOpportunity(
          req,
          req.params.id
        );

      if (!opportunity) {
        return res
          .status(404)
          .json({
            message:
              "Opportunity not found",
          });
      }

      await createNotification({
        companyId:
          opportunity.companyId,

        userId: req.user.id,

        senderId:
          req.user.id,

        module: "crm",

        type:
          "opportunity_deleted",

        title:
          "Opportunity Deleted",

        message: `${opportunity.name} has been deleted.`,

        priority: "low",

        metadata: {
          opportunityId:
            opportunity.id,
        },
      });

      await opportunity.destroy();

      return res.json({
        message:
          "Opportunity deleted",
      });
    } catch (error) {
      return next(error);
    }
  }
);

// ============================================================
// TIMELINE
// ============================================================

router.get(
  "/:id/timeline",
  protect,
  async (req, res, next) => {
    try {
      /*
       * Scope even the placeholder timeline endpoint
       * so users cannot probe IDs belonging to another
       * company.
       */
      const opportunity =
        await findScopedOpportunity(
          req,
          req.params.id
        );

      if (!opportunity) {
        return res
          .status(404)
          .json({
            message:
              "Opportunity not found",
          });
      }

      return res.json({
        items: [],
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;