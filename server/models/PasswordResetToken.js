import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class PasswordResetToken extends Model {}

PasswordResetToken.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false
  },

  token: {
    type: DataTypes.STRING,
    allowNull: false
  },

  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }

}, {
  sequelize,
  modelName: 'PasswordResetToken',
  tableName: 'password_reset_tokens'
})

export default PasswordResetToken