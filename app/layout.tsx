import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { initializeApp } from "./lib/init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ideal Caravans Upholstery Order Form",
  description: "Order form for caravan upholstery selection",
};

// Initialize the app
initializeApp().catch(console.error);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground font-sans`}
      >
        <AuthProvider>
          <main className="relative">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
