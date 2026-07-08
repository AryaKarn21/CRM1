import express from "express";
import { Meeting, MeetingAttendee, User } from "../models/index.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/:meetingId/attendees", protect, async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("PARAMS:", req.params);
    console.log("CONTEXT:", req.context);

    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one user.",
      });
    }

    const meeting = await Meeting.findOne({
      where: {
        id: req.params.meetingId,
        companyId: req.context.companyId,
        isDeleted: false,
      },
    });

    console.log("Meeting:", meeting);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    const attendees = [];

    for (const userId of users) {

      console.log("Checking User:", userId);

      const user = await User.findByPk(userId);

      console.log("User:", user);

      if (!user) continue;

      const attendee = await MeetingAttendee.create({
        meetingId: meeting.id,
        userId: user.id,
        status: "pending",
      });

      console.log("Created:", attendee);

      attendees.push(attendee);
    }

    res.status(201).json({
      success: true,
      message: "Attendees added successfully.",
      data: attendees,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
});

router.get("/:meetingId/attendees", protect, async (req, res) => {
  try {

    const meeting = await Meeting.findOne({
      where: {
        id: req.params.meetingId,
        companyId: req.context.companyId,
        isDeleted: false,
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    const attendees = await MeetingAttendee.findAll({
      where: {
        meetingId: meeting.id,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json({
      success: true,
      count: attendees.length,
      data: attendees,
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