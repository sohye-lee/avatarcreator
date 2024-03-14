import React from "react";
import { Nav } from "./nav";
import Link from "next/link";
import { useSession } from "next-auth/react";

const Header = () => {
  return (
    <div className="fixed left-0 top-0 z-[100] flex w-full items-center justify-between   px-5 py-2">
      <Link href="/" className="text-lg font-medium">
        BlinkAvatar
      </Link>
      <Nav />
    </div>
  );
};

export default Header;
