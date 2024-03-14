"use client";
import Header from "@/components/header";
import React, { FormEvent, useEffect, useState } from "react";
import BG from "@public/images/background.jpg";
import Image from "next/image";
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { RiGoogleLine } from "react-icons/ri";
import { RiDiscordLine } from "react-icons/ri";
import { CTAClassName } from "@/utils/constants";
import { RxRocket } from "react-icons/rx";
import { api } from "@/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>();
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const { status, data: session } = useSession();

  const checkout = api.stripe.checkout.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      router.push(data.checkoutUrl?.toString() ?? "/");
    },
  });

  const updateUser = api.user.updatePaymentStatus.useQuery();
  const paymentStatus = api.stripe.getPaymentStatus.useQuery();

  useEffect(() => {
    console.log(session?.user?.id);

    const query = new URLSearchParams(window.location.search);
    if (query.get("success") && session?.user) {
      toast.success(
        "Payment succeeded! You will receive an email confirmation.",
      );
      updateUser;
      // router.push("/dashboard");
    }

    if (query.get("canceled")) {
      toast.error(
        "Order canceled -- continue to shop around and checkout when you’re ready.",
      );
    }
    // query.get("success") && console.log("paymentStatus", paymentStatus.data);
  }, [paymentStatus]);

  return (
    <div className=" min-h-screen w-full ">
      {/* <Header /> */}
      <div className="relative flex w-full flex-col items-center px-4 ">
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
          {status !== "authenticated" ? (
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
                    value={email ?? ""}
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
          ) : (
            <button
              className={`${CTAClassName} group w-full`}
              onClick={() => {
                paymentStatus.data?.isPaymentSucceeded
                  ? router.push("/dashboard")
                  : checkout.mutate();
                // checkout.mutate();
              }}
            >
              {paymentStatus.data?.isPaymentSucceeded
                ? "Go to your dashboard"
                : "Checkout"}
              <RxRocket className="group-hover:animate-ping" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
