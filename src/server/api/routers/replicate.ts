import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { s3 } from "@/utils/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";
import axios from "axios";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

export const replicateRouter = createTRPCRouter({
  startTrainingModel: protectedProcedure.mutation(
    async ({ ctx: { db, session } }) => {
      const user = await db.user.findUnique({
        where: {
          id: session.user.id,
        },
      });

      // Check if  the payment is completed
      if (!user?.isPaymentSucceeded) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to access to this service.",
        });
      }

      // check if the zip file exists - Get signed url from s3
      let zipFileSignedUrl;
      try {
        const zipFileUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: `images/${session.user?.id}/data.zip`,
          }),
          {
            expiresIn: 60 * 12,
          },
        );

        zipFileSignedUrl = zipFileUrl;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "We encountered an error getting the image files, please upload images again.",
        });
      }

      // Create unique keyword and update user with this keyword
      const userUniqueKeyword = nanoid(4);

      await db.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          uniqueKeyword: userUniqueKeyword,
        },
      });

      // Train model
      try {
        const url =
          "https://dreambooth-api-experimental.replicate.com/v1/trainings";
        axios.post(url, {
          input: {
            instance_prompt: `an avatar image of a ${userUniqueKeyword} person`,
            class_prompt: "a photo of a person",
            instance_data: zipFileSignedUrl,
            max_train_steps: 2000,
          },
          model: `sohye-lee/${session.user?.id}`,
          trainer_version:
            "cd3f925f7ab21afaef7d45224790eedbb837eeac40d22e8fefe015489ab644aa",
          webhook_completed: "https://example.com/dreambooth-webhook",
        });
      } catch (error) {
        console.log(error);
      }
    },
  ),
});
