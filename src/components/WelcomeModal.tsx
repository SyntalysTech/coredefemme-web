"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Calendar } from "lucide-react";
import styles from "./WelcomeModal.module.css";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar si ya visitó
    const hasVisited = localStorage.getItem("coredefemme_visited");

    if (!hasVisited) {
      // Mostrar modal después de 800ms
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem("coredefemme_visited", "true");
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
          <div className={styles.badge}>Bienvenue chez Core de Femme</div>

          <h2 className={styles.title}>
            3 Semaines Gratuites pour Découvrir nos Cours
          </h2>

          <p className={styles.description}>
            Testez Core de Maman ou Sculpt Pilates sans engagement. Reconnectez-vous à votre corps et retrouvez votre force intérieure.
          </p>

          <div className={styles.dates}>
            <div className={styles.dateItem}>
              <strong>Core de Maman</strong>
              <span>Mardi 09h30 - 11, 18, 25 nov</span>
            </div>
            <div className={styles.dateItem}>
              <strong>Sculpt Pilates</strong>
              <span>Jeudi 18h00 - 13, 20, 27 nov</span>
            </div>
          </div>

          <Link
            href="/seances-decouvertes"
            className={styles.ctaBtn}
            onClick={closeModal}
          >
            <Calendar size={20} />
            Réserver ma place gratuite
          </Link>

          <p className={styles.skip} onClick={closeModal}>
            Continuer sans réserver
          </p>
        </div>
      </div>
    </div>
  );
}
