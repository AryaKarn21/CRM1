import { OTP } from '../models/index.js'
import { generateOTP } from '../utils/otp.js'

export async function createOTP(email) {
  // Delete any existing OTP for this email
  await OTP.destroy({
    where: {
      email
    }
  })

  

  const otp = generateOTP()

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await OTP.create({
    email,
    otp,
    expiresAt
  })

  return otp
}

export async function verifyOTP(email, otp) {
  const record = await OTP.findOne({
    where: { email }
  })

  if (!record) {
    throw new Error("OTP not found")
  }

  console.log("================================");
  console.log("Current Time :", new Date());
  console.log("Expires Time :", record.expiresAt);
  console.log("OTP in DB    :", record.otp);
  console.log("OTP Received :", otp);
  console.log("================================");

  if (record.verified) {
    throw new Error("OTP already used")
  }

  if (new Date() > record.expiresAt) {
    throw new Error("OTP expired")
  }

  if (record.otp !== otp) {
    throw new Error("Invalid OTP")
  }

  await record.update({
    verified: true
  })

  return true
}