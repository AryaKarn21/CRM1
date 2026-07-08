import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Meeting extends Model {}

Meeting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    organizerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    description: {
      type: DataTypes.TEXT,
    },

    meetingType: {
      type: DataTypes.ENUM("online", "offline", "hybrid"),
      defaultValue: "online",
    },

    meetingLink: {
      type: DataTypes.STRING,
    },

    location: {
      type: DataTypes.STRING,
    },

    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("scheduled", "completed", "cancelled"),
      defaultValue: "scheduled",
    },

    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
    },

    reminderMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },

    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    deletedAt: {
      type: DataTypes.DATE,
    },

    deletedBy: {
      type: DataTypes.UUID,
    },
  },
  {
    sequelize,
    modelName: "Meeting",
    tableName: "meetings",
    timestamps: true,
  },
);

export default Meeting;
