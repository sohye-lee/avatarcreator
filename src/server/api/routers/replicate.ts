import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { s3 } from "@/utils/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";
import axios from "axios";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { z } from "zod";
import Replicate from "replicate";
const replicate = new Replicate({
  auth: env.REPLICATE_API_TOKEN,
});

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

      if (user?.modelTrainingLimit == 0) {
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
      const userUniqueKeyword = nanoid(7);
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
        const { data } = await axios.post(
          url,
          {
            input: {
              instance_prompt: `an illustrated avatar image of a ${userUniqueKeyword} person`,
              class_prompt: "a photo of a person",
              instance_data: zipFileSignedUrl,
              max_train_steps: 500,
            },
            model: `sohye-lee/${session.user?.id}`,
            trainer_version:
              "f0f8a1578f4e57da2090b1846a3c026bd75d38abd969e1d4788b07f203966294",
            // "cd3f925f7ab21afaef7d45224790eedbb837eeac40d22e8fefe015489ab644aa",
            webhook_completed: `${env.REPLICATE_TRAINING_FINISHED_WEBHOOK}?userId=${session.user.id}`,
          },
          {
            headers: {
              Authorization: `Token ${env.REPLICATE_API_TOKEN}`,
            },
          },
        );

        const updatedUser = await db.user.update({
          where: {
            id: session.user.id,
          },
          data: {
            modelTrainingLimit: {
              decrement: 1,
            },
            trainingModelId: data.id,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Training failed.",
        });
      }
    },
  ),

  checkModelTrainingStatus: protectedProcedure.query(
    async ({ ctx: { db, session } }) => {
      const user = await db.user.findUnique({
        where: {
          id: session.user.id,
        },
      });

      if (!user?.trainingModelId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Training Model Id missing.",
        });

      try {
        const { data } = await axios.get(
          `https://dreambooth-api-experimental.replicate.com/v1/trainings/${user?.trainingModelId}`,
          {
            headers: {
              Authorization: `Token ${env.REPLICATE_API_TOKEN}`,
            },
          },
        );

        return data.status;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while processing. Please retry.",
        });
      }
    },
  ),

  generateAvatars: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      }),
    )
    .mutation(async ({ ctx: { db, session }, input: { prompt } }) => {
      console.log("Backend Prompt:", prompt);
      const user = await db.user.findUnique({
        where: {
          id: session.user.id,
        },
      });

      if (!user?.credits || user?.credits < 1) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have enough credits.",
        });
      }

      if (!user?.trainingVersion) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Training model version is missing.",
        });
      }

      try {
        // ORIGINAL
        // const { data } = await axios.post(
        //   "https://api.replicate.com/v1/predictions",
        //   {
        //     input: {
        //       prompt,
        //     },
        //     version: user?.trainingVersion,
        //     webhook_completed: `${env.REPLICATE_AVATAR_GENERATED_WEBHOOK}?userId=${session.user.id}`,
        //   },
        //   {
        //     headers: {
        //       Authorization: `Token ${env.REPLICATE_API_TOKEN}`,
        //     },
        //   },
        // );

        // SECOND: BECOME_IMAGE
        // const input = {
        //   image: `${env.NGROK_HOST}/images/samples/selfie.jpg`,
        //   image_to_become: `${env.NGROK_HOST}/images/samples/vermeer.jpg`,
        // };
        // const output = await replicate.run(
        //   "fofr/become-image:8d0b076a2aff3904dfcec3253c778e0310a68f78483c4699c7fd800f3051d2b3",
        //   { input },
        // );
        const output = await replicate.run(
          "fofr/face-to-sticker:764d4827ea159608a07cdde8ddf1c6000019627515eb02b6b449695fd547e5ef",
          {
            input: {
              image: `${env.NGROK_HOST}/images/samples/selfie.jpg`,
              steps: 20,
              width: 512,
              height: 512,
              prompt: "a person",
              upscale: false,
              upscale_steps: 10,
              negative_prompt: "",
              prompt_strength: 4.5,
              ip_adapter_noise: 0.5,
              ip_adapter_weight: 0.2,
              instant_id_strength: 0.7,
            },
          },
        );

        console.log("RESULTS:", output);
        console.log("FIRST RESULT:");
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong...",
        });
      }
    }),
});
