"use client";
import Dropzone from "@/components/image/dropzone";
import Thumbnail from "@/components/image/thumbnail";
import DashboardLayout from "@/components/layout";
import Loading from "@/components/loading";
import { api } from "@/utils/api";
import { CTAClassName } from "@/utils/constants";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const router = useRouter();
  const [wantToUploadMore, setWantToUploadMore] = useState(false);
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

  useEffect(() => {}, [allUploadedImages, router, deleteImage]);

  if (paymentStatus.isLoading || !paymentStatus.data?.isPaymentSucceeded) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-[1024px] flex-col   space-y-3">
        <h1 className="text-3xl font-medium">Upload images</h1>
        {allUploadedImages.data?.uploadedImages && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-[1px] ">
              {allUploadedImages.data?.uploadedImages &&
                allUploadedImages.data?.uploadedImages.map((image, i) => {
                  if (image?.url)
                    return (
                      <Thumbnail key={i} s3Key={image.key} src={image.url} />
                    );
                })}
            </div>
            {!wantToUploadMore && (
              <div className="flex justify-center">
                <button
                  className={`${CTAClassName}`}
                  onClick={() => setWantToUploadMore(true)}
                >
                  Upload More
                </button>
              </div>
            )}
          </div>
        )}

        {(!allUploadedImages.data?.uploadedImages ||
          allUploadedImages.data?.uploadedImages.length == 0 ||
          wantToUploadMore) && (
          <Dropzone setWantToUploadMore={setWantToUploadMore} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
