"use client";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { nanoid } from "nanoid";
import Image from "next/image";
import { X } from "lucide-react";
import { api } from "@/utils/api";
import { CTAClassName } from "@/utils/constants";
import { RiAiGenerate, RiRobot2Line, RiUploadCloud2Line } from "react-icons/ri";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSmall from "../loadingSmall";
import Thumbnail from "./thumbnail";
import { useRouter } from "next/navigation";

type FileWithPreview = File & { preview: string; id: string };

interface DropzoneProps {
  setWantToUploadMore: (value: boolean) => void;
}

export default function Dropzone({ setWantToUploadMore }: DropzoneProps) {
  const router = useRouter();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);

  const allUploadedImages = api.storage.getUploadedImages.useQuery();

  const getUploadUrls = api.storage.getUploadUrls.useMutation({
    onSuccess: async (data) => {
      try {
        setUploading(true);
        const uploadPromises = data.map((uploadUrl, i) => {
          return axios.put(uploadUrl, files[i]);
        });
        await Promise.all(uploadPromises);
      } catch (error) {
        toast.error("Couldn't upload images.");
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
    onError: (err) => {
      console.log(err.message);
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpg": [".jpg"],
      "image/jpeg": [".jpeg"],
    },
    onDrop: (acceptedFiles) => {
      const allSelectedFiles = [
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
            id: nanoid(),
          }),
        ),
        ...files,
      ];

      const allowedImageCt =
        10 - (allUploadedImages.data?.uploadedImages.length ?? 0);
      allSelectedFiles.splice(10);
      setFiles(allSelectedFiles);
    },
    maxFiles: 10,
  });

  const deleteImage = (id: string) => {
    const deletedFiles = files.filter((file) => file.id != id);
    console.log("after deleted", deletedFiles);
    setFiles(deletedFiles);
  };

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    getUploadUrls.isSuccess && router.refresh();
    getUploadUrls.isSuccess && setWantToUploadMore(false);

    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files, deleteImage, router, setWantToUploadMore, setFiles]);

  return (
    <section className="flex h-full w-full flex-col space-y-4">
      <div
        {...getRootProps()}
        className="flex items-center justify-center rounded border border-dashed border-pink-300 bg-white px-4 py-12 text-center"
      >
        <input {...getInputProps()} className="h-full w-full" />
        <p className="text-sm text-gray-500">
          Drag 'n' drop 3 to 10 image files here (.png, .jpg, .jpeg), <br />
          or click to select files
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-[1px] ">
        {files &&
          // files.length > 0 &&
          files.map((file) => {
            return (
              // <img className="w-32" alt={file.name} src={file.preview} />
              // <Thumbnail
              //   id={file.id}
              //   src={file.preview}
              //   alt={file.name}
              //   onClick={deleteImage}
              // />

              <div className="fill group relative aspect-square w-[calc(50%-1px)] overflow-hidden md:w-[calc(33.3%-1px)] lg:w-[calc(20%-1px)]">
                <div className="absolute right-0 top-0 z-10 flex h-8 w-8 items-center justify-center bg-[rgba(0,0,0,.5)] ">
                  <X
                    className="h-4 w-4 text-white"
                    onClick={() => {
                      console.log("deleting:", file.id);
                      deleteImage(file.id);
                      console.log("new array:", files);
                    }}
                  />
                </div>
                <Image
                  src={file.preview.toString()}
                  alt={file.name || "image"}
                  fill
                  // className="h-auto w-auto object-cover"
                  sizes=" "
                  className="h-auto min-h-full w-auto min-w-full object-fill"
                />
              </div>
            );
          })}
      </div>
      {files && files.length > 0 && (
        <div className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-center gap-3 bg-[rgba(0,0,0,.1)] py-5">
          <button
            className={`${CTAClassName}`}
            disabled={uploading}
            onClick={() => {
              getUploadUrls.mutate({
                images: files.map((file) => ({ imageId: file.id })),
              });
              // setWantToUploadMore(false);
              // router.refresh();
            }}
          >
            {uploading ? (
              <LoadingSmall />
            ) : (
              <>
                <RiUploadCloud2Line /> Upload All
              </>
            )}
          </button>
          <button
            className={`${CTAClassName}`}
            // disabled={uploading}
            // onClick={() => {
            //   getUploadUrls.mutate({
            //     images: files.map((file) => ({ imageId: file.id })),
            //   });
            //   setWantToUploadMore(false);
            //   router.refresh();
            // }}
          >
            <RiRobot2Line /> Start Training Model
          </button>
        </div>
      )}
    </section>
  );
}
