"use client";
import Dropzone from "@/components/image/dropzone";
import Thumbnail from "@/components/image/thumbnail";
import DashboardLayout from "@/components/layout";
import Loading from "@/components/loading";
import { api } from "@/utils/api";
import { CTAClassName } from "@/utils/constants";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiRobot2Line } from "react-icons/ri";

const Dashboard = () => {
  const { data: session } = useSession();
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
        // router.replace("/");
      }
    },
  });

  const allUploadedImages = api.storage.getUploadedImages.useQuery();
  const deleteImage = api.storage.removeImageFromS3.useMutation();
  const startTrainingModel = api.replicate.startTrainingModel.useMutation({
    onError: (err) => {
      toast.error(err.message);
    },
    onSuccess: (data) => {
      toast.success("Model training started...");
    },
  });

  useEffect(() => {
    if (!session?.user) {
      // toast.success("Please log in first");
      router.replace("/auth/signIn");
    }
  }, [allUploadedImages, router, deleteImage]);

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
              {allUploadedImages.data?.uploadedImages.length > 0 &&
                allUploadedImages.data.uploadedImages.map((image, i) => {
                  if (image?.url && !image?.url.includes(".zip"))
                    return (
                      <Thumbnail key={i} s3Key={image.key} src={image.url} />
                    );
                })}
            </div>
            {!wantToUploadMore && (
              <div className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-center gap-3 bg-[rgba(0,0,0,.1)] py-5">
                <div className="flex justify-center">
                  <button
                    className={`${CTAClassName} disabled:bg-slate-500`}
                    onClick={() => setWantToUploadMore(true)}
                    disabled={startTrainingModel.isLoading}
                  >
                    Upload More
                  </button>
                </div>
                <button
                  className={`${CTAClassName} disabled:bg-slate-500`}
                  onClick={() => {
                    startTrainingModel.mutate();
                  }}
                  disabled={startTrainingModel.isLoading}
                >
                  <RiRobot2Line /> Start Training Model
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
