"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
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
  const isAuthPage = pathname?.startsWith("/compte");
  const isDashboard = pathname === "/mon-compte";

  // Manage body class for admin/login pages to remove header padding
  useEffect(() => {
    if (isAdmin || isLogin || isAuthPage) {
      document.body.classList.add("no-header-padding");
    } else {
      document.body.classList.remove("no-header-padding");
    }

    return () => {
      document.body.classList.remove("no-header-padding");
    };
  }, [isAdmin, isLogin, isAuthPage]);

  // Don't show Header/Footer on admin or login pages
  if (isAdmin || isLogin) {
    return <>{children}</>;
  }

  // Dashboard page - show header but no footer (has its own layout)
  if (isDashboard) {
    return (
      <>
        <PromoBanner />
        <Header />
        {children}
        <Chatbot />
      </>
    );
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
