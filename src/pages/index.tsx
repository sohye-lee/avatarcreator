import Header from "@/components/header";
import React from "react";
import BG from "@public/images/background.jpg";
import Image from "next/image";

const HomePage = () => {
  return (
    <div className=" min-h-screen w-full ">
      <Header />
      <div className="relative flex w-full flex-col items-center  ">
        <Image
          fill
          src={BG}
          alt="background"
          className="absolute left-0 top-0 z-10 w-full"
        />
        <div className="relative z-20 flex flex-col items-center space-y-5 py-32">
          <h1 className="relative z-20  text-center text-5xl font-medium">
            Transform Your Selfies
            <br />
            into Unique AI Avatars
          </h1>
          <p className="text-md text-center text-slate-500">
            From Snapshots to Avatars, Effortlessly.
          </p>
          <button className="rounded-full bg-black from-fuchsia-500 to-cyan-500 px-8 py-2 text-white hover:bg-gradient-to-r">
            Create Your Avatar with AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
