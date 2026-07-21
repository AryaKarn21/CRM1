import {
  DataTypes,
  Model,
} from "sequelize";

import {
  sequelize,
} from "../config/db.js";

class Opportunity extends Model {}

Opportunity.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue:
        DataTypes.UUIDV4,
      primaryKey: true,
    },

    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,

      validate: {
        notEmpty: true,
      },
    },

    accountId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    assignedToId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    stage: {
      type: DataTypes.ENUM(
        "Prospecting",
        "Qualification",
        "Needs Analysis",
        "Value Proposition",
        "Decision Makers",
        "Perception Analysis",
        "Proposal/Price",
        "Negotiation/Review",
        "Closed Won",
        "Closed Lost"
      ),

      allowNull: false,

      defaultValue:
        "Prospecting",
    },

    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,

      validate: {
        min: 0,
      },
    },

    probability: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,

      validate: {
        min: 0,
        max: 100,
      },
    },

    closeDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,

    modelName:
      "Opportunity",

    tableName:
      "opportunities",

    timestamps: true,

    indexes: [
      {
        fields: [
          "companyId",
          "stage",
        ],
      },
    ],
  }
);

export default Opportunity;