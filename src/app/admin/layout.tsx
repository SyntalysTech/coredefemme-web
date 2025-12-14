"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  LogOut,
  Menu,
  X,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./layout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function isActive(path: string) {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname?.startsWith(path);
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.adminWrapper}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button
          className={styles.menuBtn}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className={styles.mobileTitle}>Administration</span>
      </header>

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <Image
            src="/logos/logo-core-de-femme-no-bg.png"
            alt="Core de Femme"
            width={150}
            height={60}
            className={styles.sidebarLogo}
          />
          <span className={styles.sidebarBadge}>Admin</span>
        </div>

        <nav className={styles.sidebarNav}>
          <Link
            href="/admin"
            className={`${styles.navItem} ${isActive("/admin") && pathname === "/admin" ? styles.active : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            Tableau de bord
          </Link>
          <Link
            href="/admin/articles"
            className={`${styles.navItem} ${isActive("/admin/articles") ? styles.active : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FileText size={20} />
            Articles
          </Link>
          <Link
            href="/admin/categories"
            className={`${styles.navItem} ${isActive("/admin/categories") ? styles.active : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FolderOpen size={20} />
            Catégories
          </Link>

          <div className={styles.navDivider} />

          <Link
            href="/admin/articles/new"
            className={styles.navItemNew}
            onClick={() => setSidebarOpen(false)}
          >
            <PlusCircle size={20} />
            Nouvel article
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.viewSiteBtn} target="_blank">
            <ExternalLink size={16} />
            Voir le site
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>{children}</main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
