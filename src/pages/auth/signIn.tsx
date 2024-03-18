"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";
import { RiArrowLeftLine, RiDiscordLine, RiGoogleLine } from "react-icons/ri";

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>();
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const { status, data: session } = useSession();
  useEffect(() => {
    session && session?.user && router.push("/");
  }, [session, session?.user]);
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
      <div className="flex min-w-[340px] flex-col gap-3 rounded border border-slate-200 bg-white px-8 py-5">
        <h1 className="text-center text-2xl font-medium">Sign In</h1>
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
        <Link
          href="/"
          className="mt-2 flex items-center justify-center space-x-2 text-sm"
        >
          <RiArrowLeftLine /> <p>Go Home</p>
        </Link>
      </div>
    </div>
  );
};

export default SignIn;
