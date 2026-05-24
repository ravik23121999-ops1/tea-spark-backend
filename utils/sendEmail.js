const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text, html) => {

  if (!process.env.RESEND_API_KEY) {

    console.warn("RESEND_API_KEY missing");

    return {
      success: false,
      error: "Resend API key missing",
    };
  }

  try {

    const response = await resend.emails.send({
      from: "Tea Spark <onboarding@resend.dev>",
      to,
      subject,
      html: html || `<p>${text}</p>`,
    });

    console.log("Email sent:", response);

    return {
      success: true,
      data: response,
    };

  } catch (err) {

    console.error("Error sending email:", err);

    return {
      success: false,
      error: err.message,
    };
  }
};

module.exports = sendEmail;