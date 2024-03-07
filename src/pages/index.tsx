import Header from "@/components/header";
import React, { FormEvent, useState } from "react";
import BG from "@public/images/background.jpg";
import Image from "next/image";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { RiGoogleLine } from "react-icons/ri";
import { RiDiscordLine } from "react-icons/ri";

const HomePage = () => {
  const [email, setEmail] = useState<string>();
  const [authLoading, setAuthLoading] = useState<boolean>(false);
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
            into Unique{" "}
            <span className="inline font-bold text-[#ff436f]">AI </span> Avatars
          </h1>
          <p className="text-md text-center text-slate-500">
            From Snapshots to Avatars, Effortlessly.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <button className="rounded-full bg-black from-fuchsia-500 to-cyan-500 px-8 py-2 text-white hover:bg-gradient-to-r">
                Create Your Avatar with AI
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <p>Complete your authentication</p>
                </DialogTitle>
                <DialogDescription>
                  2 ways of authentication are here:
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setAuthLoading(true);
                    await signIn("email", {
                      email,
                    });
                  } catch (error) {
                    console.error(error);
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                className="flex flex-col items-stretch gap-2"
              >
                <Input
                  type="email"
                  required
                  placeholder="you@mail.com"
                  onChange={(e: FormEvent<HTMLInputElement>) =>
                    setEmail(e.currentTarget.value)
                  }
                  value={email}
                />
                <Button>Verify Your Email</Button>
              </form>
              <div className="relative flex justify-center">
                <p className=" relative z-20 bg-white px-2 text-sm text-gray-500">
                  OR
                </p>
                <div className="absolute left-0 top-[50%] h-[1px] w-full -translate-y-[50%] bg-gray-500"></div>
              </div>
              <Button onClick={() => signIn("google")}>
                <RiGoogleLine className="mr-2" />
                Sign In with Google
              </Button>
              <Button onClick={() => signIn("discord")}>
                <RiDiscordLine className="mr-2" />
                Sign In with Discord
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
