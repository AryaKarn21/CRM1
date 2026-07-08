import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class MeetingAttendee extends Model {}

MeetingAttendee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    meetingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "accepted",
        "declined",
        "tentative"
      ),
      defaultValue: "pending",
    },

    isOrganizer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    joinedAt: {
      type: DataTypes.DATE,
    },

    leftAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "MeetingAttendee",
    tableName: "meeting_attendees",
    timestamps: true,
  }
);

export default MeetingAttendee;