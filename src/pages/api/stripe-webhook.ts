"use server";
import { env } from "@/env";
import { db } from "@/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import type { Readable } from "stream";
import Stripe from "stripe";
import { authOptions } from "@/server/auth";
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const stripeWebhook = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(authOptions);
  //   console.log("server session:", session);
  if (req.method === "POST") {
    let event;
    const buf = await buffer(req);
    const rawBody = buf.toString("utf8");
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).send("Signature not present.");
    }

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.status(400).send(`Webhook Error: ${err as undefined}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = event.data.object;
    console.log("event data:", event.data);

    // console.log(data);
    if (
      event.type == "charge.succeeded" &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      data
    ) {
      console.log("EVENT TYPE", event.type);
      console.log("SESSION USER", session?.user?.email);

      //   await db.user.upsert({
      //     where: {
      //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      //       email: data.receipt_email,
      //       //   email: data.billing_details.email,
      //     },
      //     create: {
      //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      //       email: data.receipt_email,
      //       isPaymentSucceeded: true,
      //     },
      //     update: {
      //       isPaymentSucceeded: true,
      //     },
      //   });
    }

    return res.status(200).send("Succeeded");
  } else {
    res.setHeader("ALLOW", "POST");
    res.status(405).end(`Method ${req.method} not allowed.`);
  }
};

export default stripeWebhook;
