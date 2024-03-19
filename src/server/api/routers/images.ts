import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import smartcrop from "smartcrop-sharp";
import { s3 } from "@/utils/s3";
import { env } from "@/env";
import { getAllSignedImagesOFUser } from "./storage";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import sharp from "sharp";
import JSZip from "jszip";

const WIDTH = 512;
const HEIGHT = 512;

const zip = new JSZip();
export const imagesRouter = createTRPCRouter({
  startProcessingImages: protectedProcedure.mutation(
    async ({ ctx: { session } }) => {
      //get all images
      try {
        const images = await getAllSignedImagesOFUser(session.user?.id);
        if (!images || !images.uploadedImages)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Image processing failed.",
          });

        const folder = zip.folder("data");

        for (const imageObj of images.uploadedImages) {
          if (imageObj?.url) {
            const response = await axios.get(imageObj?.url, {
              responseType: "arraybuffer",
            });

            const cropResult = await smartcrop.crop(response.data, {
              width: WIDTH,
              height: HEIGHT,
            });

            const imageBuffer = await sharp(response.data)
              .extract({
                width: cropResult.topCrop.width,
                height: cropResult.topCrop.height,
                left: cropResult.topCrop.x,
                top: cropResult.topCrop.y,
              })
              .resize(WIDTH, HEIGHT)
              .toBuffer();

            folder?.file(imageObj.key, imageBuffer, {
              binary: true,
            });
          }
        }

        const zipFile = await folder?.generateAsync({
          type: "nodebuffer",
        });

        await s3.send(
          new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: `images/${session.user?.id}/data.zip`,
            ContentType: "application/zip",
            Body: zipFile,
          }),
        );
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Process failed. Please retry.",
        });
      }
    },
  ),
});
