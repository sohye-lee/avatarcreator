"use client";
import Dropzone from "@/components/image/dropzone";
import DashboardLayout from "@/components/layout";
import Loading from "@/components/loading";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import React from "react";
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
  if (paymentStatus.isLoading || !paymentStatus.data?.isPaymentSucceeded) {
    return <Loading />;
  }
  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-[1024px] flex-col   space-y-3">
        {/* Protected Access: only for users who completed payments  */}
        <h1 className="text-3xl font-medium">Upload images</h1>
        <Dropzone />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
