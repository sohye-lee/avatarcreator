import { env } from "@/env";
import { db } from "@/server/db";
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

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });
    try {
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.status(400).send(`Webhook Error: ${err as undefined}`);
    }

    return res.status(200).send("Succeeded");
  } else {
    res.setHeader("ALLOW", "POST");
    res.status(405).end(`Method ${req.method} not allowed.`);
  }
};

export default trainingCompletedHandler;
