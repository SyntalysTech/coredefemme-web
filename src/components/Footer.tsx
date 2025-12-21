"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Instagram, ArrowUp } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import styles from "./Footer.module.css";

const navigationLinks = [
  { href: "/", label: "Accueil" },
  { href: "/core-de-maman", label: "Core de Maman" },
  { href: "/sculpt-pilates", label: "Sculpt Pilates" },
  { href: "/a-propos", label: "À Propos" },
  { href: "/blog", label: "Blog" },
];

const infoLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "Questions Fréquentes" },
  { href: "/mentions-legales", label: "Mentions Légales" },
  { href: "/politique-confidentialite", label: "Confidentialité" },
];

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          {/* Footer Top */}
          <div className={styles.footerTop}>
            {/* Column 1: Logo & Description */}
            <div className={styles.footerCol}>
              <Image
                src="/logos/logo-core-de-femme-no-bg.png"
                alt="Core de Femme - Pilates Bressaucourt"
                width={200}
                height={70}
                className={styles.footerLogo}
              />
              <p className={styles.footerDescription}>
                Reconnectez-vous à votre corps, retrouvez votre centre et votre force intérieure. Un espace de mouvement et de reconnexion pour chaque femme.
              </p>
              <div className={styles.footerSocial}>
                <a
                  href="https://www.instagram.com/core_de_femme"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Core de Femme"
                >
                  <Instagram size={22} />
                </a>
                <a
                  href="https://wa.me/41767059777"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Core de Femme"
                >
                  <BsWhatsapp size={20} />
                </a>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div className={styles.footerCol}>
              <h3 className={styles.footerTitle}>Navigation</h3>
              <ul className={styles.footerLinks}>
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Informations */}
            <div className={styles.footerCol}>
              <h3 className={styles.footerTitle}>Informations</h3>
              <ul className={styles.footerLinks}>
                {infoLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className={styles.footerCol}>
              <h3 className={styles.footerTitle}>Contact</h3>
              <ul className={styles.footerContact}>
                <li>
                  <MapPin size={18} />
                  <span>
                    Crossfit la Vouivre<br />
                    Rue Pierre-Péquignat 7, 1er étage<br />
                    2900 Porrentruy, Suisse
                  </span>
                </li>
                <li>
                  <Mail size={18} />
                  <a href="mailto:contact@coredefemme.ch">contact@coredefemme.ch</a>
                </li>
                <li>
                  <BsWhatsapp size={18} />
                  <a href="https://wa.me/41767059777" target="_blank" rel="noopener noreferrer">+41 76 705 97 77</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.footerCopyright}>
                © {currentYear} Core de Femme - Tous droits réservés
              </p>
              <p className={styles.footerCredits}>
                Site créé par{" "}
                <a
                  href="https://syntalys.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SYNTALYS TECH
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        className={`${styles.backToTop} ${showBackToTop ? styles.visible : ""}`}
        onClick={scrollToTop}
        aria-label="Retour en haut de la page"
      >
        <ArrowUp size={24} />
      </button>
    </>
  );
}
