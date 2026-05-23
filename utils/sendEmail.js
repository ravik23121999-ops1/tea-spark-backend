// utils/sendEmail.js

const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email not configured (EMAIL_USER / EMAIL_PASS missing)");
    return { success: false, error: "Email not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: `"Tea Spark" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent to:", to);

    return { success: true };

  } catch (err) {

    console.error("Error sending email:", err);

    return {
      success: false,
      error: err.message,
    };
  }
};

module.exports = sendEmail;