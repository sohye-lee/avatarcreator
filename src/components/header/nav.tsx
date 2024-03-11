"use client";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function Nav() {
  const { data: session, status } = useSession();
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Account</MenubarTrigger>
        <MenubarContent className="r-3 -translate-x-4">
          {status == "authenticated" ? (
            <>
              {session?.user?.name}
              <MenubarItem>
                <p>Manage Profile</p>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => signOut()}>
                <p>Logout</p>
              </MenubarItem>
            </>
          ) : (
            <>
              <MenubarItem>
                <p>
                  <Link href="/auth/signIn">Login</Link>
                </p>
              </MenubarItem>
              <MenubarItem>
                <p>Sign Up</p>
              </MenubarItem>
            </>
          )}
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>
          {" "}
          <p>
            <Link href="/contact">Contact</Link>
          </p>
        </MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  );
}
