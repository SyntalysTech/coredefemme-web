"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Calendar } from "lucide-react";
import styles from "./CoursSplit.module.css";

const coursData = [
  {
    id: "maman",
    title: "Core de Maman",
    subtitle: "Rééducation Post-partum",
    schedule: "Mercredi matin • 09h30 - 10h30",
    description: "Un programme doux et progressif pour les mamans. Renforce ton core, ton plancher pelvien et retrouve ta force intérieure avec bienveillance.",
    features: [
      "Rééducation douce du périnée",
      "Renforcement du transverse",
      "Respiration consciente",
      "Posture et alignement",
      "Adapté à tous les niveaux",
      "Exercice anti diastasis",
    ],
    image: "/images/pilates-post-partum.png",
    href: "/core-de-maman",
    color: "maman",
  },
  {
    id: "sculpt",
    title: "Sculpt Pilates",
    subtitle: "Renforcement & Énergie",
    schedule: "Bientôt disponible",
    description: "Bouge, renforce ton corps et redécouvre ta puissance. Un cours dynamique et progressif pour tonifier, sculpter et gagner en énergie.",
    features: [
      "Renforcement musculaire global",
      "Tonification",
      "Renforcement du core (centre)",
      "Posture et alignement",
      "Énergie et vitalité",
    ],
    image: "/images/pilates-matwork.png",
    href: "/sculpt-pilates",
    color: "sculpt",
  },
];

export default function CoursSplit() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  const handlePanelClick = (panelId: string) => {
    if (window.innerWidth >= 768) {
      setExpandedPanel(expandedPanel === panelId ? null : panelId);
    }
  };

  return (
    <section className={styles.coursSection} id="cours">
      <div className={styles.coursHeader}>
        <h2 className={styles.coursTitle}>Mes Cours</h2>
        <p className={styles.coursSubtitle}>
          Deux approches, un même objectif : vous reconnecter à votre corps et retrouver votre force intérieure.
        </p>
      </div>

      <div className={styles.splitContainer}>
        {coursData.map((cours) => (
          <div
            key={cours.id}
            className={`${styles.splitPanel} ${styles[cours.color]} ${
              expandedPanel === cours.id ? styles.expanded : ""
            } ${expandedPanel && expandedPanel !== cours.id ? styles.collapsed : ""}`}
            onClick={() => handlePanelClick(cours.id)}
          >
            {/* Background Image */}
            <div className={styles.panelBg}>
              <Image
                src={cours.image}
                alt={cours.title}
                fill
                style={{ objectFit: "cover" }}
              />
              <div className={styles.panelOverlay}></div>
            </div>

            {/* Content */}
            <div className={styles.panelContent}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>{cours.title}</h3>
                <p className={styles.panelSubtitle}>{cours.subtitle}</p>
                <span className={styles.panelSchedule}>{cours.schedule}</span>
              </div>

              <div className={styles.panelDetails}>
                <p className={styles.panelDescription}>{cours.description}</p>

                <ul className={styles.panelFeatures}>
                  {cours.features.map((feature, index) => (
                    <li key={index}>
                      <Check size={18} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className={styles.panelButtons}>
                  <Link href={cours.href} className={styles.panelBtnPrimary}>
                    En savoir plus
                  </Link>
                  {cours.id === "maman" && (
                    <Link href="/contact" className={styles.panelBtnSecondary}>
                      <Calendar size={18} />
                      Réserver
                    </Link>
                  )}
                </div>
              </div>

              <div className={styles.panelHint} style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                Cliquez pour découvrir
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Cards */}
      <div className={styles.mobileCards}>
        {coursData.map((cours) => (
          <div key={cours.id} className={styles.mobileCard}>
            <div className={styles.mobileCardImage}>
              <Image
                src={cours.image}
                alt={cours.title}
                fill
                style={{ objectFit: "cover" }}
              />
              <div className={styles.mobileCardOverlay}></div>
            </div>
            <div className={styles.mobileCardContent}>
              <h3>{cours.title}</h3>
              <p className={styles.mobileCardSubtitle}>{cours.subtitle}</p>
              <span className={styles.mobileCardSchedule}>{cours.schedule}</span>
              <p className={styles.mobileCardDesc}>{cours.description}</p>
              <div className={styles.mobileCardButtons}>
                <Link href={cours.href} className={styles.panelBtnPrimary}>
                  En savoir plus
                </Link>
                {cours.id === "maman" && (
                  <Link href="/contact" className={styles.panelBtnSecondary}>
                    <Calendar size={16} />
                    Réserver
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
