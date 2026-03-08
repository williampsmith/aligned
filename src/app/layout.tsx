import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aligned — Live by your values",
  description:
    "Close the gap between your stated values and your actual behavior. Track what matters, see where your attention goes, and live deliberately.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        <AppShell>{children}</AppShell>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
