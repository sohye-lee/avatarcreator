import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Inter, Gayathri } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { api } from "@/utils/api";

import "@/styles/globals.css";

// const inter = Gayathri({
//   subsets: ["latin"],
//   variable: "--font-sans",
//   weight: ['100,']
// });

const inter = Inter({
  subsets: ["latin"],
  // variable: "--font-sans",
});
const gayathri = Gayathri({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <main className={`font-sans ${inter.className} ${gayathri.variable}`}>
        <Toaster />
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
