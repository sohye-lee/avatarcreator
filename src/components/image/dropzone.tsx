import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { nanoid } from "nanoid";
import Image from "next/image";
import { X } from "lucide-react";
import { api } from "@/utils/api";
import { CTAClassName } from "@/utils/constants";
import { RiUploadCloud2Line } from "react-icons/ri";

// const thumbsContainer = {
//   display: "flex",
//   flexDirection: "row",
//   flexWrap: "wrap",
//   marginTop: 16,
// };

// const thumb = {
//   display: "inline-flex",
//   borderRadius: 2,
//   border: "1px solid #eaeaea",
//   marginBottom: 8,
//   marginRight: 8,
//   width: 100,
//   height: 100,
//   padding: 4,
//   boxSizing: "border-box",
// };

// const thumbInner = {
//   display: "flex",
//   minWidth: 0,
//   overflow: "hidden",
// };

// const img = {
//   display: "block",
//   width: "auto",
//   height: "100%",
// };

type FileWithPreview = File & { preview: string; id: string };

export default function Dropzone() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const getUploadUrls = api.storage.getUploadUrls.useMutation({
    onSuccess: (data) => {
      console.log(data);
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
      allSelectedFiles.splice(10);
      setFiles(allSelectedFiles);
    },
  });

  const deleteImage = (id: string) => {
    const deletedFiles = files.filter((file) => file.id != id);
    setFiles(deletedFiles);
  };

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

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
      <div className="flex  flex-wrap items-center gap-[1px] ">
        {files &&
          files.length > 0 &&
          files.map((file) => (
            <div
              key={file.id}
              className="fill group relative aspect-square w-[calc(50%-1px)] overflow-hidden md:w-[calc(33.3%-1px)] lg:w-[calc(20%-1px)]"
            >
              <div className="absolute z-10 hidden h-full w-full items-center justify-center bg-[rgba(0,0,0,.2)] group-hover:flex">
                <X
                  className="h-4 w-4 text-white"
                  onClick={() => deleteImage(file.id)}
                />
              </div>
              <Image
                src={file.preview}
                alt={file.name}
                fill
                className="h-auto w-auto object-cover"
                // className="h-auto min-h-full w-auto min-w-full  object-fill"
              />
            </div>
          ))}
      </div>
      {files && files.length > 0 && (
        <div className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[rgba(0,0,0,.1)] py-5">
          <button
            className={`${CTAClassName}  `}
            onClick={() =>
              getUploadUrls.mutate({
                images: files.map((file) => ({ imageId: file.id })),
              })
            }
          >
            <RiUploadCloud2Line /> Upload All
          </button>
        </div>
      )}
      {/* <aside style={thumbsContainer}>{thumbs}</aside> */}
    </section>
  );
}
