"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import styles from "./Header.module.css";

const coursesLinks = [
  {
    category: "En salle",
    courses: [
      {
        href: "/core-de-maman",
        title: "Core de Maman",
        description: "Rééducation Post-partum",
      },
      {
        href: "/sculpt-pilates",
        title: "Sculpt Pilates",
        description: "Renforcement & Énergie",
      },
    ],
  },
  {
    category: "A domicile",
    courses: [
      {
        href: "/cours-a-domicile",
        title: "Cours a domicile",
        description: "Séances privées chez vous",
      },
    ],
  },
];

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À Propos" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCoursDropdownOpen, setIsCoursDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Auth state - only show for customer accounts, not admin
  useEffect(() => {
    async function checkCustomerAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Check if user has a customer profile (not just admin)
        const { data: profile } = await supabase
          .from("customer_profiles")
          .select("id")
          .eq("id", session.user.id)
          .single();

        // Only set as logged in if they have a customer profile
        if (profile) {
          setCurrentUser(session.user);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    }

    checkCustomerAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Check if user has a customer profile
        const { data: profile } = await supabase
          .from("customer_profiles")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setCurrentUser(session.user);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await supabase.auth.signOut({ scope: 'global' });
      setCurrentUser(null);
      setIsUserMenuOpen(false);
      // Force a full page reload to clear all state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Force reload anyway
      window.location.href = "/";
    }
  };

  const isCoursPage = pathname === "/core-de-maman" || pathname === "/sculpt-pilates" || pathname === "/cours-a-domicile";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? "hidden" : "";
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "";
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
        <div className={styles.headerContainer}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <Image
              src="/logos/logo-core-de-femme-no-bg.png"
              alt="Core de Femme - Pilates Féminin Porrentruy Jura Suisse"
              width={200}
              height={70}
              priority
            />
          </Link>

          {/* Navigation Desktop */}
          <nav className={styles.navDesktop}>
            <ul className={styles.navMenu}>
              <li>
                <Link
                  href="/"
                  className={pathname === "/" ? styles.active : ""}
                >
                  Accueil
                </Link>
              </li>

              {/* Dropdown Cours */}
              <li className={styles.hasDropdown}>
                <button
                  className={`${styles.dropdownToggle} ${isCoursPage ? styles.active : ""}`}
                >
                  Cours <ChevronDown size={14} />
                </button>
                <div className={styles.megaMenu}>
                  {coursesLinks.map((category) => (
                    <div key={category.category} className={styles.megaMenuCategory}>
                      <span className={styles.megaMenuCategoryTitle}>{category.category}</span>
                      {category.courses.map((course) => (
                        <Link
                          key={course.href}
                          href={course.href}
                          className={`${styles.megaMenuItem} ${pathname === course.href ? styles.active : ""}`}
                        >
                          <span className={styles.megaMenuTitle}>{course.title}</span>
                          <p className={styles.megaMenuDesc}>{course.description}</p>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </li>

              {navLinks.slice(1).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={pathname === link.href ? styles.active : ""}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Auth Section */}
            <div className={styles.authSection}>
              {currentUser ? (
                <div className={styles.userMenu} ref={userMenuRef}>
                  <button
                    className={styles.userMenuToggle}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                  >
                    <User size={18} />
                    <span>{currentUser.user_metadata?.full_name?.split(" ")[0] || "Mon compte"}</span>
                    <ChevronDown size={14} className={isUserMenuOpen ? styles.rotated : ""} />
                  </button>
                  {isUserMenuOpen && (
                    <div className={styles.userDropdown}>
                      <Link href="/mon-compte" className={styles.userDropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                        <User size={16} />
                        Mon compte
                      </Link>
                      <button onClick={handleLogout} className={styles.userDropdownItem}>
                        <LogOut size={16} />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.authLinks}>
                  <Link href="/connexion" className={styles.authLink}>
                    Connexion
                  </Link>
                  <Link href="/inscription" className={styles.authLinkPrimary}>
                    S&apos;inscrire
                  </Link>
                </div>
              )}
            </div>

            <Link href="/reserver" className={styles.ctaButton}>
              Réserver ma séance
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.menuToggle}
            onClick={toggleMobileMenu}
            aria-label="Menu de navigation"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className={`${styles.navMobile} ${isMobileMenuOpen ? styles.active : ""}`}>
        <ul className={styles.navMobileList}>
          <li>
            <Link
              href="/"
              className={pathname === "/" ? styles.active : ""}
              onClick={closeMobileMenu}
            >
              Accueil
            </Link>
          </li>
          <li>
            <button
              className={`${styles.mobileDropdownToggle} ${isCoursDropdownOpen ? styles.active : ""}`}
              onClick={() => setIsCoursDropdownOpen(!isCoursDropdownOpen)}
            >
              <span>Cours</span>
              <ChevronDown
                size={18}
                className={isCoursDropdownOpen ? styles.rotated : ""}
              />
            </button>
            <div className={`${styles.mobileDropdown} ${isCoursDropdownOpen ? styles.active : ""}`}>
              {coursesLinks.map((category) => (
                <div key={category.category} className={styles.mobileDropdownCategory}>
                  <span className={styles.mobileDropdownCategoryTitle}>{category.category}</span>
                  {category.courses.map((course) => (
                    <Link
                      key={course.href}
                      href={course.href}
                      className={pathname === course.href ? styles.active : ""}
                      onClick={closeMobileMenu}
                    >
                      {course.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </li>
          {navLinks.slice(1).map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? styles.active : ""}
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        {/* Mobile Auth Section */}
        <div className={styles.mobileAuthSection}>
          {currentUser ? (
            <>
              <Link
                href="/mon-compte"
                className={styles.mobileAuthLink}
                onClick={closeMobileMenu}
              >
                <User size={18} />
                Mon compte
              </Link>
              <button onClick={(e) => handleLogout(e)} className={styles.mobileAuthLogout}>
                <LogOut size={18} />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className={styles.mobileAuthLink}
                onClick={closeMobileMenu}
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className={styles.mobileAuthLinkPrimary}
                onClick={closeMobileMenu}
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        <Link
          href="/reserver"
          className={styles.ctaButton}
          onClick={closeMobileMenu}
        >
          Réserver ma séance
        </Link>
      </nav>

      {/* Mobile Overlay */}
      <div
        className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.active : ""}`}
        onClick={closeMobileMenu}
      />
    </>
  );
}
