import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error("Email credentials are not configured (EMAIL_USER and EMAIL_PASS/EMAIL_PASSWORD)");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  await transporter.sendMail({
    from: `"Dairy Automation System" <${emailUser}>`,
    to,
    subject,
    html,
  });
};
