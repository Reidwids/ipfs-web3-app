import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./Header";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "@/config";
import Web3ModalProvider from "@/context";

const inter = Inter({ subsets: ["latin"] });

const jura = localFont({
  variable: "--font-jura",
  src: [
    {
      path: "../public/fonts/Jura-VariableFont_wght.ttf",
      style: "normal",
      weight: "500",
    },
  ],
});

export const metadata: Metadata = {
  title: "IPFS Web3 App",
  description: "Made by @Reidwids",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //TODO: Cookies only necessary if using server-side rendering
  const initialState = cookieToInitialState(config, headers().get("cookie"));
  return (
    <html lang="en" className={`${inter.className} ${jura.variable}`}>
      <head>
        <link rel="shortcut icon" href="/img/rocketFavicon.png" />
        <title>IPFS Web3 App</title>
      </head>
      <body className={`relative`}>
        <Web3ModalProvider initialState={initialState}>
          <Header />
          <div className="min-w-full flex justify-center min-h-[calc(100vh-81px)] md:min-h-[calc(100vh-88px)]">
            {children}
          </div>
        </Web3ModalProvider>
      </body>
    </html>
  );
}
