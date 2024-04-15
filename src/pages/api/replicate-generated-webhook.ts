import { env } from "@/env";
import { db } from "@/server/db";
import { sendEmail } from "@/utils/sendEmail";
import type { NextApiRequest, NextApiResponse } from "next";

const trainingCompletedHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req.method === "POST") {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ message: "User information missing." });
    }

    try {
      const user = await db.user.update({
        where: {
          id: userId,
        },
        data: {
          credits: {
            decrement: 1,
          },
        },
      });
      const imageArray = req.body.output;
      let images;
      if (imageArray && imageArray?.length > 0) {
        images = await db.image.createMany({
          data: imageArray.map((imageUrl: string) => ({
            imageUrl,
            userId,
          })),
        });
      }

      if (user) {
        await sendEmail(
          user,
          "Your avatars are generated!",
          `<p>Your avatars have been successfully generated! <br/>Have a look at <a href="${env.NEXTAUTH_URL}/generate-avatars">here</a>.</p>`,
        );
      }

      return res.status(200).json({
        ok: true,
        message: "Your avatar has been successfully generated!",
        images,
      });
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.status(400).send(`Webhook Error: ${err as undefined}`);
    }
  } else {
    res.setHeader("ALLOW", "POST");
    res.status(405).end(`Method ${req.method} not allowed.`);
  }
};

export default trainingCompletedHandler;
