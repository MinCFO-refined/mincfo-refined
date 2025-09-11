import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";

import { SidebarWrapper } from "@/components/sidebar-wrapper";
import Providers from "./providers";
import Nav from "@/layout/nav";
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background antialiased`}
      >
        <Providers>
          <SidebarWrapper>
            <AppSidebar user={user} />
            <div className="flex w-screen flex-col">
              <header>
                <Nav />
              </header>
              <main className="bg-background flex-1">{children}</main>
            </div>
          </SidebarWrapper>
        </Providers>
      </body>
    </html>
  );
}
