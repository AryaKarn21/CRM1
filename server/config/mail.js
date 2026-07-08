import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mail Server Error')
    console.error(error)
  } else {
    console.log('✅ Mail Server Connected')
  }
})
console.log("MAIL_USER:", process.env.MAIL_USER)
console.log("MAIL_PASS:", process.env.MAIL_PASS ? "Loaded ✅" : "Missing ❌")
console.log("MAIL_HOST:", process.env.MAIL_HOST)
console.log("MAIL_PORT:", process.env.MAIL_PORT)


export default transporter