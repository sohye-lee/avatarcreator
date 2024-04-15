import { env } from "@/env";
import { db } from "@/server/db";
import { sendEmail } from "@/utils/sendEmail";
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

const replicateWebhook = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const userId = req.query.userId as string;

    if (req.body.status !== "succeeded") {
      return res
        .status(400)
        .json({ ok: false, message: "Model training failed." });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ ok: false, message: "User Id not provided." });
    }

    const updatedUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        trainingVersion: req.body.version,
      },
    });
    console.log("TRAINING MODEL V.:", req.body.version);

    // send user an email with result
    if (updatedUser.email) {
      await sendEmail(
        updatedUser,
        "BlinkAvatar: Your Personal Avatar Creation Journey Begins Now!",
        `<p>Congratulations and welcome to the next phase of your avatar creation journey! We're excited to inform you that your personal model, trained with the photos you've uploaded, is now ready to bring your unique avatars to life.</p>

<h3>Your Avatar Creation Adventure Awaits</h3>
<p>For a special introductory offer of just $0.99, we've unlocked the full potential of your personalized model and credited your account with 50 tokens. Each token is a key to a world of creativity, allowing you to generate up to 4 unique avatars from a single prompt.</p>

<h3>How to Dive In</h3>
<ol>
<li><strong>Start With a Prompt</strong>: Utilize the tokens to command your model. Each prompt you create can generate a stunning array of up to 4 avatars, showcasing your persona in diverse styles and settings.</li>
<li><strong>Incorporate Your Keyword</strong>: Enhance your prompts by including a specific keyword we've provided here: <strong>${updatedUser.uniqueKeyword}</strong> . This ensures your avatars capture the essence you envision. For instance, a compelling prompt could be: "A closeup portrait shot of [person] (with keyword) in a rugged place."</li>
</ol>

<h3>Embark on Your Creative Quest</h3>

<p>Your journey to creating personalized avatars starts here: <a href="${env.NEXTAUTH_URL}/generate-avatars">${env.NEXTAUTH_URL}/generate-avatars</a>. Dive in and explore the endless possibilities your prompts can unveil.</p>

<h3>Tips for Unleashing Your Creativity:</h3>

<ul>
<li>Detail is key. The more vivid your prompt, the more aligned the outcome will be with your vision.</li>
<li>Don't forget to use your unique keyword in each prompt for tailored results.</li>
<li>Experiment with various themes and backgrounds to fully explore the capabilities of your personalized model.</li>
</ul>

<p>We are delighted to offer you this innovative way to express yourself and look forward to seeing the incredible avatars you'll create. Should you have any questions or need assistance, our dedicated support team is ready to assist.</p>

<p>Happy avatar creation!</p>

<p>Best wishes,<br>
BlinkAvatar</p>`,
      );
    }

    //     const transporter = nodemailer.createTransport({
    //       host: env.EMAIL_SERVER_HOST,
    //       port: Number(env.EMAIL_SERVER_PORT),
    //       secure: false, // Use `true` for port 465, `false` for all other ports
    //       auth: {
    //         user: env.EMAIL_SERVER_USER,
    //         pass: env.EMAIL_SERVER_PASSWORD,
    //       },
    //     });

    //     if (updatedUser.email) {
    //       await transporter.sendMail({
    //         from: env.EMAIL_FROM, // sender address
    //         to: updatedUser.email, // list of receivers
    //         subject:
    //           "BlinkAvatar: Your Personal Avatar Creation Journey Begins Now!", // Subject line
    //         html: `<p>Congratulations and welcome to the next phase of your avatar creation journey! We're excited to inform you that your personal model, trained with the photos you've uploaded, is now ready to bring your unique avatars to life.</p>

    // <h3>Your Avatar Creation Adventure Awaits</h3>
    // <p>For a special introductory offer of just $0.99, we've unlocked the full potential of your personalized model and credited your account with 50 tokens. Each token is a key to a world of creativity, allowing you to generate up to 4 unique avatars from a single prompt.</p>

    // <h3>How to Dive In</h3>
    // <ol>
    // <li><strong>Start With a Prompt</strong>: Utilize the tokens to command your model. Each prompt you create can generate a stunning array of up to 4 avatars, showcasing your persona in diverse styles and settings.</li>
    // <li><strong>Incorporate Your Keyword</strong>: Enhance your prompts by including a specific keyword we've provided here: <strong>${updatedUser.uniqueKeyword}</strong> . This ensures your avatars capture the essence you envision. For instance, a compelling prompt could be: "A closeup portrait shot of [person] (with keyword) in a rugged place."</li>
    // </ol>

    // <h3>Embark on Your Creative Quest</h3>

    // <p>Your journey to creating personalized avatars starts here: <a href="${env.NEXTAUTH_URL}/generate-avatars">${env.NEXTAUTH_URL}/generate-avatars</a>. Dive in and explore the endless possibilities your prompts can unveil.</p>

    // <h3>Tips for Unleashing Your Creativity:</h3>

    // <ul>
    // <li>Detail is key. The more vivid your prompt, the more aligned the outcome will be with your vision.</li>
    // <li>Don't forget to use your unique keyword in each prompt for tailored results.</li>
    // <li>Experiment with various themes and backgrounds to fully explore the capabilities of your personalized model.</li>
    // </ul>

    // <p>We are delighted to offer you this innovative way to express yourself and look forward to seeing the incredible avatars you'll create. Should you have any questions or need assistance, our dedicated support team is ready to assist.</p>

    // <p>Happy avatar creation!</p>

    // <p>Best wishes,<br>
    // BlinkAvatar</p>`,
    //       });
    //     }

    return res.status(200).send("Succeeded");
  } else {
    res.setHeader("ALLOW", "POST");
    res.status(405).end(`Method ${req.method} not allowed.`);
  }
};

export default replicateWebhook;
