import { X } from "lucide-react";
import Image from "next/image";
import React from "react";

interface ThumbnailProps {
  id: string;
  onClick: (id: string) => void;
  src: string;
  alt?: string;
}

const Thumbnail = ({ id, onClick, src, alt }: ThumbnailProps) => {
  return (
    <div
      key={id}
      className="fill group relative aspect-square w-[calc(50%-1px)] overflow-hidden md:w-[calc(33.3%-1px)] lg:w-[calc(20%-1px)]"
    >
      <div className="absolute right-0 top-0 z-10 flex h-8 w-8 items-center justify-center bg-[rgba(0,0,0,.5)] ">
        <X className="h-4 w-4 text-white" onClick={() => onClick(id)} />
      </div>
      <Image
        src={src}
        alt={alt || "image"}
        fill
        className="h-auto w-auto object-cover"
        // className="h-auto min-h-full w-auto min-w-full object-fill"
      />
    </div>
  );
};

export default Thumbnail;
