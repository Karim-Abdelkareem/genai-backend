import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  const from = process.env.EMAIL_FROM || "no-reply@example.com";
  await transporter.sendMail({ from, to, subject, html });
}
