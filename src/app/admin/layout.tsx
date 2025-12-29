"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  Package,
  MessageSquare,
  FileText,
  FolderOpen,
  LogOut,
  Menu,
  X,
  ExternalLink,
  PlusCircle,
  ChevronDown,
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
  const [blogMenuOpen, setBlogMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Open blog submenu if on blog pages
  useEffect(() => {
    if (pathname?.includes("/admin/articles") || pathname?.includes("/admin/categories")) {
      setBlogMenuOpen(true);
    }
  }, [pathname]);

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
          aria-label="Menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Image
          src="/logos/logo-core-de-femme-no-bg.png"
          alt="Core de Femme"
          width={120}
          height={40}
          className={styles.mobileLogo}
        />
      </header>

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <Image
            src="/logos/logo-core-de-femme-no-bg.png"
            alt="Core de Femme"
            width={140}
            height={50}
            className={styles.sidebarLogo}
          />
          <span className={styles.sidebarBadge}>Administration</span>
        </div>

        <nav className={styles.sidebarNav}>
          {/* Dashboard */}
          <Link
            href="/admin"
            className={`${styles.navItem} ${isActive("/admin") && pathname === "/admin" ? styles.active : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            Tableau de bord
          </Link>

          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>Gestion</span>
          </div>

          {/* Reservations */}
          <Link
            href="/admin/reservations"
            className={`${styles.navItem} ${isActive("/admin/reservations") ? styles.active : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Calendar size={20} />
            Réservations
          </Link>

          {/* Sessions */}
          <Link
            href="/admin/sessions"
            className={`${styles.navItem} ${isActive("/admin/sessions") ? styles.active : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <CalendarDays size={20} />
            Séances
          </Link>

          {/* Clients */}
          <Link
            href="/admin/clients"
            className={`${styles.navItem} ${isActive("/admin/clients") ? styles.active : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={20} />
            Clients
          </Link>

          {/* Packs */}
          <Link
            href="/admin/packs"
            className={`${styles.navItem} ${isActive("/admin/packs") ? styles.active : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Package size={20} />
            Packs
          </Link>

          {/* Messages */}
          <Link
            href="/admin/contacts"
            className={`${styles.navItem} ${isActive("/admin/contacts") ? styles.active : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <MessageSquare size={20} />
            Messages
          </Link>

          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>Contenu</span>
          </div>

          {/* Blog Submenu */}
          <button
            className={`${styles.navItem} ${styles.navSubmenuBtn} ${blogMenuOpen ? styles.open : ""}`}
            onClick={() => setBlogMenuOpen(!blogMenuOpen)}
          >
            <FileText size={20} />
            Blog
            <ChevronDown size={16} className={styles.chevron} />
          </button>

          {blogMenuOpen && (
            <div className={styles.submenu}>
              <Link
                href="/admin/articles"
                className={`${styles.submenuItem} ${isActive("/admin/articles") && !pathname?.includes("/new") ? styles.active : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                Tous les articles
              </Link>
              <Link
                href="/admin/articles/new"
                className={`${styles.submenuItem} ${pathname === "/admin/articles/new" ? styles.active : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <PlusCircle size={14} />
                Nouvel article
              </Link>
              <Link
                href="/admin/categories"
                className={`${styles.submenuItem} ${isActive("/admin/categories") ? styles.active : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <FolderOpen size={14} />
                Catégories
              </Link>
            </div>
          )}
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
