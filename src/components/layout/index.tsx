import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex-col items-center">
      <div className="fixed inset-0 left-0 top-0 -z-10 h-full  w-full  bg-gray-500 bg-gradient-to-bl from-pink-100   via-white to-sky-300"></div>
      <div className="z-1 container relative py-16">{children}</div>
    </div>
  );
};

export default DashboardLayout;
