"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
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
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
              alt="Core de Femme - Pilates Féminin Bressaucourt Suisse"
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

            <Link href="/contact" className={styles.ctaButton}>
              Réserver ma séance d'essai
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
        <Link
          href="/contact"
          className={styles.ctaButton}
          onClick={closeMobileMenu}
        >
          Réserver ma séance d'essai
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
