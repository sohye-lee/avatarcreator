import { env } from "@/env";
import type { NextApiRequest, NextApiResponse } from "next";

const trainingCompletedHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req.method === "POST") {
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
