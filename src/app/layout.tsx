import type { Metadata } from "next";
import { Space_Grotesk, Lexend } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Volley Tracker",
  description: "Professional Volleyball Scoreboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${lexend.variable} dark`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#0c0e12] text-[#f6f6fc] overflow-hidden"
      >
        {children}
      </body>
    </html>
  );
}
