import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./Header";

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
  return (
    <html lang="en" className={`${inter.className} ${jura.variable}`}>
      <head>
        <link rel="shortcut icon" href="/img/rocketFavicon.png" />
        <title>IPFS Web3 App</title>
      </head>
      <body className={`relative`}>
        <Header />
        <div className="min-w-full flex justify-center min-h-[calc(100vh-81px)] md:min-h-[calc(100vh-76px)]">
          {children}
        </div>
      </body>
    </html>
  );
}
