import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sectionTitle?: string;
  [key: string]: any;
}
const DashboardLayout = ({
  children,
  sectionTitle,
  ...rest
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex-col items-center">
      {/* <div className="fixed inset-0 left-0 top-0 -z-10 h-full  w-full  bg-gray-500 bg-gradient-to-bl from-pink-100   via-white to-sky-300"></div> */}
      {sectionTitle && (
        <div className="relative flex flex-col items-center  overflow-hidden bg-gray-100 pb-20 pt-32">
          <img
            src="/images/background.jpg"
            className="absolute left-0 top-0 z-0 min-h-full min-w-full object-cover"
            alt="background"
          />
          <h1 className="z-10 text-center text-3xl font-medium">
            {sectionTitle}
          </h1>
        </div>
      )}
      <div className="z-1 container relative py-16">{children}</div>
    </div>
  );
};

export default DashboardLayout;
