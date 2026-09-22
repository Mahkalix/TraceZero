import type { Metadata } from "next";
import { Manrope, Source_Code_Pro } from "next/font/google";
import "@/styles/main.scss";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trace//Zero",
  description: "Narrative cyber-investigation game prototype.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${manrope.variable} ${sourceCodePro.variable}`}>
      <body>{children}</body>
    </html>
  );
}
