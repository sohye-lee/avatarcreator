import { CTAClassName } from "@/utils/constants";
import Link from "next/link";
import React from "react";
import { RiHomeSmile2Line } from "react-icons/ri";

function VerifyRequest() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white px-12 py-8">
        <h1 className="text-center text-4xl font-medium">Check your email</h1>
        <p className="mb-3 font-light text-slate-600">
          A sign in link has been sent to your email address.
        </p>

        <Link
          href="/"
          className={`${CTAClassName}  flex items-center justify-center text-center`}
        >
          <RiHomeSmile2Line className="mr-2" /> Go Home
        </Link>
      </div>
    </div>
  );
}

export default VerifyRequest;
