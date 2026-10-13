import http from "http";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
})

async function sendEmail(to, subject, text,html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text,
      html,
    })
    return {success: true, messageId : info.messageId}
  } catch(err) {
    console.error('Error sending email:',err);
    return {success: false, error: err.message};
  }
}

export default sendEmail;