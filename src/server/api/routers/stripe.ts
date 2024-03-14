import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const stripeRouter = createTRPCRouter({
  checkout: protectedProcedure.mutation(async () => {
    const productData = await stripe.products.retrieve(env.STRIPE_PRODUCT_ID);

    if (!productData.default_price) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Something went wrong. Please try again.",
      });
    }

    // use stripe documentation
    const paymentSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price:
            typeof productData.default_price != "object"
              ? productData.default_price.toString()
              : JSON.stringify(productData.default_price),
          // productData.default_price.toString(),
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${env.HOST}/?success=true`,
      cancel_url: `${env.HOST}/?canceled=true`,
      automatic_tax: { enabled: true },
    });

    // checkout session
    return { checkoutUrl: paymentSession.url };
  }),

  getPaymentStatus: protectedProcedure.query(
    async ({ ctx: { db, session } }) => {
      console.log("session:", session);

      return await db.user.findFirst({
        where: {
          id: session.user.id,
        },
        select: {
          isPaymentSucceeded: true,
        },
      });
    },
  ),
});
