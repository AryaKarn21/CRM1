import express from "express";
import { Op } from "sequelize";
import { Lead, LeadNote, User } from "../models/index.js";
import { authorizePermission, protect } from "../middleware/auth.js";
import { createNotification } from "../services/notification.service.js";

const router = express.Router();

// GET /api/leads
router.get("/", protect, authorizePermission('leads.view'), async (req, res, next) => {
  try {
    const company = req.companyId;
    const {
      page = 1,
      limit = 20,
      search,
      stage,
      assignedTo,
      sortKey = "createdAt",
      sortDir = "desc",
    } = req.query;

    const where = {};
    if (company) where.companyId = company;
    if (stage) where.stage = stage;
    if (assignedTo) where.assignedToId = assignedTo;
    if (search) {
      // Mongoose $or + $regex -> Sequelize Op.or + Op.like
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { company_name: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: leads, count: total } = await Lead.findAndCountAll({
      where,
      order: [[sortKey || "createdAt", sortDir === "asc" ? "ASC" : "DESC"]],
      offset,
      limit: parseInt(limit),
      include: [
        { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
      ],
    });

    res.json({ leads, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/new — prevent 'new' from being treated as an ID
router.get("/new", protect, authorizePermission('leads.view'), (req, res) => {
  res.json({ lead: null });
});

// GET /api/leads/:id
router.get("/:id", protect, authorizePermission('leads.view'), async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
      ],
    });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

// POST /api/leads
// POST /api/leads
router.post("/", protect, authorizePermission('leads.view'), async (req, res, next) => {
  try {
     const company = req.companyId;
    const { notes, ...leadData } = req.body;

    const lead = await Lead.create({
      ...leadData,
      ...(company && { companyId: company }),
    });
    await createNotification({
      companyId: company,
      userId: req.user.id,
      senderId: req.user.id,

      module: "crm",
      type: "lead_created",

      title: "New Lead Created",

      message: `${lead.name} has been created successfully.`,

      priority: "medium",

      actionUrl: null,

      metadata: {
        leadId: lead.id,
      },
    });

    // Create first note
    if (notes) {
      await LeadNote.create({
        leadId: lead.id,
        text: notes,
        createdById: req.user.id,
      });
    }

    // Notification for assigned user
    if (lead.assignedToId) {
      await createNotification({
        companyId: company,
        userId: lead.assignedToId,
        senderId: req.user.id,

        module: "crm",
        type: "lead_assigned",

        title: "New Lead Assigned",

        message: `A new lead "${lead.name}" has been assigned to you.`,

        priority: "medium",

        actionUrl: null,

        metadata: {
          leadId: lead.id,
        },
      });
    }

    await lead.reload({
      include: [
        {
          model: User,
          as: "assignedTo",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    console.error(err.message);
    console.error(err.errors);
    next(err);
  }
});

// PATCH /api/leads/:id
router.patch("/:id", protect, authorizePermission('leads.view'), async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    await lead.update(req.body);
    await lead.reload({
      include: [
        { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
      ],
    });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/leads/:id/stage
router.patch("/:id/stage", protect, authorizePermission('leads.view'), async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    await lead.update({ stage: req.body.stage });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/leads/:id
router.delete("/:id", protect, authorizePermission('leads.view'), async (req, res, next) => {
  try {
    await Lead.destroy({ where: { id: req.params.id } });
    res.json({ message: "Lead deleted" });
  } catch (err) {
    next(err);
  }
});

// POST /api/leads/:id/notes
router.post("/:id/notes", protect, authorizePermission('leads.view'), async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    await LeadNote.create({
      leadId: lead.id,
      text: req.body.note,
      createdById: req.user.id,
    });
    await lead.reload({ include: [{ model: LeadNote, as: "notes" }] });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/:id/timeline
router.get("/:id/timeline", protect, authorizePermission('leads.view'), async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        {
          model: LeadNote,
          as: "notes",
          include: [{ model: User, as: "createdBy", attributes: ["name"] }],
          order: [["createdAt", "DESC"]],
        },
      ],
    });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    const items = lead.notes.map((n) => ({
      user: { name: n.createdBy?.name || "System" },
      description: n.text,
      createdAt: n.createdAt,
    }));
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;
