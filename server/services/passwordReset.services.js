import crypto from 'crypto'
import { PasswordResetToken } from '../models/index.js'

export async function createResetToken(email) {
  await PasswordResetToken.destroy({
    where: { email }
  })

  const token = crypto.randomBytes(32).toString('hex')

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  await PasswordResetToken.create({
    email,
    token,
    expiresAt
  })

  return token
}

export async function verifyResetToken(email, token) {
  const record = await PasswordResetToken.findOne({
    where: { email, token }
  })

  if (!record) {
    throw new Error('Invalid reset token')
  }

  if (new Date() > record.expiresAt) {
    throw new Error('Reset token expired')
  }

  return true
}