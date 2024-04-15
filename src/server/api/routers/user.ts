import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findFirst({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        uniqueKeyword: true,
        credits: true,
        images: true,
      },
    });
  }),

  updatePaymentStatus: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        isPaymentSucceeded: true,
        modelTrainingLimit: 1,
      },
    });
  }),
});
