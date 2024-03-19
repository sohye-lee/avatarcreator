import { api } from "@/utils/api";
import { X } from "lucide-react";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import Image from "next/image";
import React from "react";
import toast from "react-hot-toast";
import { RiLoader2Line, RiReplay10Line } from "react-icons/ri";

interface ThumbnailProps {
  id?: string;
  onClick?: (id: string) => void;
  src: string;
  alt?: string;
  s3Key?: string;
  [key: string]: any;
}

const Thumbnail = ({ id, onClick, src, alt, s3Key }: ThumbnailProps) => {
  const utils = api.useContext();
  const deleteImage = api.storage.removeImageFromS3.useMutation({
    onSuccess: () => {
      toast.success("Image deleted from Cloud");
      utils.storage.getUploadedImages.invalidate();
    },
  });
  return (
    <div className="fill group relative aspect-square w-[calc(50%-1px)] overflow-hidden md:w-[calc(33.3%-1px)] lg:w-[calc(20%-1px)]">
      {deleteImage.isLoading && (
        <div className="absolute right-0 top-0 z-10 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,.1)] ">
          <RiLoader2Line className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
      <div className="absolute right-0 top-0 z-10 flex h-8 w-8 items-center justify-center bg-[rgba(0,0,0,.5)] ">
        <X
          className="h-4 w-4 text-white"
          onClick={() => {
            onClick && id
              ? onClick(id)
              : s3Key
                ? deleteImage.mutate({ key: s3Key })
                : null;
          }}
        />
      </div>
      <img
        src={src}
        alt={alt || "image"}
        // fill
        // className="h-auto w-auto object-cover"
        // sizes=" "
        className="h-auto min-h-full w-auto min-w-full object-fill"
      />
    </div>
  );
};

export default Thumbnail;
