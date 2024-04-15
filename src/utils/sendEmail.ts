import nodemailer from "nodemailer";
import { env } from "@/env";
import { User } from "@prisma/client";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_SERVER_HOST,
  port: Number(env.EMAIL_SERVER_PORT),
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: env.EMAIL_SERVER_USER,
    pass: env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendEmail = async (user: User, subject: string, html: string) => {
  if (user.email) {
    await transporter.sendMail({
      from: env.EMAIL_FROM, // sender address
      to: user.email, // list of receivers
      subject: "BlinkAvatar: Your Personal Avatar Creation Journey Begins Now!", // Subject line
      html,
    });
  }
};
