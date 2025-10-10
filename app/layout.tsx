import type { Metadata } from "next";
import { Manrope, Source_Code_Pro } from "next/font/google";

import "./globals.css";

// Google Font
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap", // This is the default, but good to be explicit
  variable: "--font-manrope", // This creates a CSS variable for us
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-code-pro", // CSS variable for the mono font
});

export const metadata: Metadata = {
  title: "Gemini API Studio",
  description: "A quickstart for the Gemini API with Veo 3",
  icons: {
    icon: "/imgs/gemini_icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sourceCodePro.variable}`}>
        <div className="bg-gray-200 text-stone-900">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
