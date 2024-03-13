"use client";
import Dropzone from "@/components/image/dropzone";
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
  useEffect(() => {
    console.log("images data:", allUploadedImages.data?.uploadedImages);
  }, [allUploadedImages]);
  if (paymentStatus.isLoading || !paymentStatus.data?.isPaymentSucceeded) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-[1024px] flex-col   space-y-3">
        <h1 className="text-3xl font-medium">Upload images</h1>
        {allUploadedImages.isSuccess &&
        allUploadedImages.data?.uploadedImages ? (
          <div className="flex flex-wrap items-center gap-[1px]">
            {allUploadedImages.data?.uploadedImages.map((url, i) => {
              return (
                <div
                  key={i}
                  className="fill group relative aspect-square w-[calc(50%-1px)] overflow-hidden md:w-[calc(33.3%-1px)] "
                >
                  <div className="absolute z-10 hidden h-full w-full items-center justify-center bg-[rgba(0,0,0,.2)] group-hover:flex">
                    <X
                      className="h-4 w-4 text-white"
                      // onClick={() => deleteImage(file.id)}
                    />
                  </div>
                  <img
                    src={url}
                    alt={""}
                    className="h-auto min-h-full w-auto min-w-full object-cover"
                    // className="h-auto min-h-full w-auto min-w-full  object-fill"
                  />
                </div>
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
