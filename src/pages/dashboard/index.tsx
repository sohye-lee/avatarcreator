"use client";
import Dropzone from "@/components/image/dropzone";
import Thumbnail from "@/components/image/thumbnail";
import DashboardLayout from "@/components/layout";
import Loading from "@/components/loading";
import { api } from "@/utils/api";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const router = useRouter();
  const paymentStatus = api.stripe.getPaymentStatus.useQuery(undefined, {
    onError: (err) => {
      if (err.data?.httpStatus == 401) {
        router.push("/");
        toast.error("Please login first.");
      }
    },
    onSuccess: (data) => {
      if (!data?.isPaymentSucceeded) {
        toast.error("Please complete the payment first.");
        router.push("/");
      }
    },
  });
  const allUploadedImages = api.storage.getUploadedImages.useQuery();

  const deleteImage = api.storage.removeImageFromS3.useMutation();

  useEffect(() => {
    console.log("images data:", allUploadedImages.data?.uploadedImages);
  }, [allUploadedImages, router]);

  if (paymentStatus.isLoading || !paymentStatus.data?.isPaymentSucceeded) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-[1024px] flex-col   space-y-3">
        <h1 className="text-3xl font-medium">Upload images</h1>
        {allUploadedImages.isSuccess &&
        allUploadedImages.data?.uploadedImages ? (
          <div className="flex flex-wrap items-center gap-[1px] ">
            {allUploadedImages.data?.uploadedImages &&
              allUploadedImages.data?.uploadedImages.map((image, i) => {
                console.log(image);
                if (image?.url)
                  return (
                    <Thumbnail
                      key={i}
                      id={i.toString()}
                      src={image.url}
                      onClick={() => {
                        console.log(image);
                        deleteImage.mutate({
                          key: image.key,
                        });
                        router.push("/dashboard");
                      }}
                    />
                  );
              })}
          </div>
        ) : (
          <Dropzone />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
