"use client";
import DashboardLayout from "@/components/layout";
import Loading from "@/components/loading";
import LoadingSmall from "@/components/loadingSmall";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { AvatarSamples, avatarSamples } from "@/utils/constants";
import { apiBaseUrl } from "next-auth/client/_utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import {
  RiAiGenerate,
  RiCopyleftLine,
  RiCopyrightLine,
  RiFileCopyLine,
  RiRobotLine,
} from "react-icons/ri";

export default function GenerateAvatars() {
  const { data: session } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>();
  const [selectedSample, setSelectedSample] = useState<number>();

  const checkModelTrainingStatus =
    api.replicate.checkModelTrainingStatus.useQuery();
  const getUser = api.user.getUser.useQuery();
  const generateAvatars = api.replicate.generateAvatars.useMutation();

  useEffect(() => {
    (!session || !session?.user) && router.push("/");
    console.log(checkModelTrainingStatus);
  }, [checkModelTrainingStatus.data]);

  return (
    <DashboardLayout sectionTitle="Let's Create Your Avatar Now">
      <div className="w-full"></div>
      {checkModelTrainingStatus.isLoading && <Loading />}
      <div className="mx-auto flex max-w-[1024px] flex-col items-center space-y-3">
        {checkModelTrainingStatus?.data && (
          <div className="flex flex-col items-center justify-center gap-3">
            <h3 className="m-0 p-0 text-2xl font-semibold">
              Model Training Status
            </h3>
            <p
              className={`m-0 rounded-full border px-5 py-2 capitalize ${checkModelTrainingStatus.data === "succeeded" ? "border-emerald-500 bg-emerald-200 text-emerald-800" : "border-gray-500 bg-gray-200 text-gray-800"}`}
            >
              {checkModelTrainingStatus.data === "succeeded" ? (
                "Successfully Completed!"
              ) : (
                <LoadingSmall />
              )}
            </p>
          </div>
        )}

        {checkModelTrainingStatus.isSuccess &&
          checkModelTrainingStatus.data === "succeeded" && (
            <div className=" w-full pb-12">
              <hr className="my-12 border-slate-200" />
              <h3 className="text-center text-2xl font-semibold">
                Give Us Your Avatar Style
              </h3>
              <p className="text-md py-8">
                <strong>Pick your favorite or create your own!</strong> Explore
                these unique avatars, each in a distinct style, from classic
                cartoons to sleek minimalism. Find the one that speaks to you
                and click to select. Want something more personal? Use the form
                below to write your own prompt and we'll craft an avatar just
                for you.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log(prompt);
                }}
                className="pb-16"
              >
                <textarea
                  className="w-full rounded border border-purple-400 bg-purple-50 px-4 py-3 text-sm   text-purple-800 outline-none placeholder:text-purple-300 focus:ring-2 focus:ring-purple-700"
                  placeholder="Write your prompt here"
                  onChange={(e: FormEvent<HTMLTextAreaElement>) =>
                    setPrompt(e.currentTarget.value)
                  }
                  value={prompt}
                  rows={5}
                ></textarea>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-800">
                    {getUser.isSuccess ? (
                      `You have ${getUser.data?.credits || "0"} credits remaining.`
                    ) : (
                      <LoadingSmall />
                    )}
                  </p>
                  <Button type="submit">
                    Generate Avatar
                    <RiAiGenerate className="ml-2" />
                  </Button>
                </div>
              </form>
              <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
                {avatarSamples.map((avatar, i) => {
                  return (
                    <div
                      key={avatar.style}
                      onClick={() => {
                        setPrompt(avatarSamples[i]?.prompt);
                        setSelectedSample(i);
                      }}
                      className={`group relative aspect-square cursor-pointer overflow-hidden rounded border border-slate-300 ${selectedSample == i && "ring-2 ring-purple-600"}`}
                    >
                      <img
                        src={`/images/samples/${avatar.filename}`}
                        alt={avatar.style}
                        className="min-h-full min-w-full object-cover"
                      />
                      <div className="absolute right-0 top-0 z-[100] flex h-8 w-8 items-center justify-center bg-slate-800 opacity-50 group-hover:opacity-100">
                        <RiFileCopyLine className="text-white" />
                      </div>
                      <div className="absolute left-0 top-0 z-[50] flex h-full w-full items-center justify-center bg-slate-700 p-4 opacity-0 group-hover:opacity-80">
                        <h3 className="text-center text-xl font-semibold text-white">
                          {avatar.style}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}
