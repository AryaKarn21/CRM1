import express from "express";
import { Meeting, User, Company } from "../models/index.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      where: {
        companyId: req.context.companyId,
      },

      include: [
        {
          model: User,
          as: "organizer",
          attributes: ["id", "name", "email"],
        },
        {
          model: Company,
          as: "company",
          attributes: ["id", "name"],
        },
      ],

      order: [["startTime", "ASC"]],
    });

    res.json({
      success: true,
      count: meetings.length,
      data: meetings,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      where: {
        id: req.params.id,
        companyId: req.context.companyId,
         isDeleted: false,
      },

      include: [
        {
          model: User,
          as: "organizer",
          attributes: ["id", "name", "email"],
        },
        {
          model: Company,
          as: "company",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.patch("/:id", protect, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      where: {
        id: req.params.id,
        companyId: req.context.companyId,
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const {
      title,
      description,
      meetingType,
      meetingLink,
      location,
      startTime,
      endTime,
      priority,
      reminderMinutes,
      status,
    } = req.body;

    if (startTime && endTime) {
      if (new Date(startTime) >= new Date(endTime)) {
        return res.status(400).json({
          success: false,
          message: "End time must be after Start time",
        });
      }
    }
    console.log("Request Body:", req.body);
    console.log("Before Update:", meeting.toJSON());
 
    await meeting.update({
  title: title ?? meeting.title,
  description: description ?? meeting.description,
  meetingType: meetingType ?? meeting.meetingType,
  meetingLink: meetingLink ?? meeting.meetingLink,
  location: location ?? meeting.location,
  startTime: startTime ?? meeting.startTime,
  endTime: endTime ?? meeting.endTime,
  priority: priority ?? meeting.priority,
  reminderMinutes: reminderMinutes ?? meeting.reminderMinutes,
  status: status ?? meeting.status,
});

// Reload latest data from database
await meeting.reload();

res.status(200).json({
  success: true,
  message: "Meeting updated successfully",
  data: meeting,
});

    await meeting.reload();

console.log("After Update:", meeting.toJSON());

    res.status(200).json({
      success: true,
      message: "Meeting updated successfully",
      data: meeting,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      meetingType,
      meetingLink,
      location,
      startTime,
      endTime,
      priority,
      reminderMinutes,
    } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Title, Start Time and End Time are required",
      });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after Start time",
      });
    }

    const meeting = await Meeting.create({
      companyId: req.context.companyId,
      organizerId: req.context.userId,
      createdBy: req.context.userId,
      title,
      description,
      meetingType,
      meetingLink,
      location,
      startTime,
      endTime,
      priority,
      reminderMinutes,
    });

    res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      data: meeting,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


router.delete("/:id", protect, async (req, res) => {
  try {

    const meeting = await Meeting.findOne({
      where: {
        id: req.params.id,
        companyId: req.context.companyId,
        isDeleted: false,
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    await meeting.update({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.context.userId,
    });

    res.status(200).json({
      success: true,
      message: "Meeting deleted successfully",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
});


router.patch("/:id/restore", protect, async (req, res) => {
  try {

    const meeting = await Meeting.findOne({
      where: {
        id: req.params.id,
        companyId: req.context.companyId,
        isDeleted: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    await meeting.update({
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });

    res.json({
      success: true,
      message: "Meeting restored successfully",
      data: meeting,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
