"use client";
import React from "react";
import Header from "../header";
import { useSession } from "next-auth/react";

const DashboardLayout = ({ children }: React.PropsWithChildren) => {
  const { status, data } = useSession();
  return (
    <div className="min-h-screen w-full flex-col items-center">
      <div className="bg-gradeint-to-br inset-0 -z-10 flex from-pink-100 via-white to-sky-200"></div>
      <div className="container mx-auto"></div>
      <Header />
      {children}
    </div>
  );
};

export default DashboardLayout;
