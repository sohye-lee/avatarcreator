import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { env } from "@/env";
import { s3 } from "@/utils/s3";
import {
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
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
        const Key = `images/${session.user.id}/${image.imageId}.jpeg`;
        return new PutObjectCommand({
          Bucket: env.AWS_BUCKET_NAME,
          Key,
          ContentType: "image/jpeg",
        });
      });

      const getSignedUrls = await Promise.all(
        putCommands.map((command) => {
          return getSignedUrl(s3, command, {
            expiresIn: 3000,
          });
        }),
      );

      return getSignedUrls;
    }),

  getUploadedImages: protectedProcedure.query(async ({ ctx: { session } }) => {
    const pathToImages = `images/${session.user.id}`;
    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: env.AWS_BUCKET_NAME,
        Prefix: pathToImages,
      }),
    );

    if (!data || !data.Contents) {
      return {
        uploadedImages: null,
      };
    }
    const allImages = await Promise.all(
      data.Contents?.map((image) => image.Key).map((Key) =>
        getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key,
          }),
          { expiresIn: 3000 },
        ),
      ),
    );
    console.log("all images:", allImages);
    return {
      uploadedImages: allImages,
    };
  }),
});
