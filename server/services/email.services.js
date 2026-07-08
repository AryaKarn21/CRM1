import transporter from '../config/mail.js'

export const sendEmail = async ({
  to,
  subject,
  html
}) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html
  })
}