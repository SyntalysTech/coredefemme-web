"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import Chatbot from "@/components/Chatbot";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isLogin = pathname === "/login";

  // Don't show Header/Footer on admin or login pages
  if (isAdmin || isLogin) {
    return <>{children}</>;
  }

  return (
    <>
      <PromoBanner />
      <Header />
      <main>{children}</main>
      <Footer />
      <Chatbot />
    </>
  );
}
