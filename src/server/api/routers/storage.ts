import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { env } from "@/env";
import { s3 } from "@/utils/s3";
import { TRPCError } from "@trpc/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const storageRouter = createTRPCRouter({
  getUploadUrls: protectedProcedure
    .input(
      z.object({
        images: z.array(
          z.object({
            imageId: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx: { session }, input: { images } }) => {
      // 1. Prepare params, command and signedurl
      // 2. Use promise.all - to get all signedUrl
      // 3. send them to the client
      const putCommands = images.map((image) => {
        const Key = `uploads/${session.user.id}/${image.imageId}.jpg`;
        return new PutObjectCommand({
          Bucket: env.AWS_BUCKET_NAME,
          Key,
          ContentType: "image/*",
          ACL: "public-read",
        });
      });

      const getSignedUrls = await Promise.all(
        putCommands.map(async (command) => {
          await getSignedUrl(s3, command, {
            expiresIn: 3000,
          });
        }),
      );

      const url = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: env.AWS_BUCKET_NAME,
          Key: `uploads/${session.user.id}/${images[0]!.imageId}.jpg`,
          ContentType: "image/jpg",
        }),
        { expiresIn: 6000 },
      );

      console.log(url);

      return getSignedUrls;
    }),
});
