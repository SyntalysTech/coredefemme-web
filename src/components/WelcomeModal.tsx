"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Calendar } from "lucide-react";
import styles from "./WelcomeModal.module.css";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Mostrar modal siempre al cargar la página después de 500ms
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button
          className={styles.closeBtn}
          onClick={closeModal}
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <div className={styles.content}>
          <div className={styles.logoContainer}>
            <Image
              src="/logos/logo-core-de-femme-no-bg.png"
              alt="Core de Femme"
              width={180}
              height={60}
              priority
            />
          </div>

          <div className={styles.badge}>Bienvenue chez Core de Femme</div>

          <h2 className={styles.title}>
            1 séance découverte gratuite
          </h2>

          <p className={styles.description}>
            Testez Core de Maman sans engagement. Reconnectez-vous à votre corps et retrouvez votre force intérieure.
          </p>

          <div className={styles.dates}>
            <div className={styles.dateItem}>
              <strong>Core de Maman Mercredi 09h30 – 10h30</strong>
              <span>À partir du mercredi 14/01/2026</span>
            </div>
          </div>

          <Link
            href="/reserver"
            className={styles.ctaBtn}
            onClick={closeModal}
          >
            <Calendar size={20} />
            Réserver ma séance d'essai gratuite
          </Link>

          <p className={styles.skip} onClick={closeModal}>
            Continuer sans réserver
          </p>
        </div>
      </div>
    </div>
  );
}
