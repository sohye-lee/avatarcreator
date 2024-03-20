import DashboardLayout from "@/components/layout";
import Loading from "@/components/loading";
import { api } from "@/utils/api";
import React from "react";

export default function GenerateAvatars() {
  const checkModelTrainingStatus =
    api.replicate.checkModelTrainingStatus.useQuery();
  return (
    <DashboardLayout>
      {checkModelTrainingStatus.isLoading && <Loading />}
      <div className="mx-auto flex max-w-[1024px] flex-col space-y-3"></div>
    </DashboardLayout>
  );
}
