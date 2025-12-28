"use client";

import styles from "./PromoBanner.module.css";

export default function PromoBanner() {
  const promoText = "Offre de lancement : Pack 6 séances à 99.- au lieu de 120.- | Cours à domicile : Pack 6 séances à 180.- au lieu de 240.- | Valable jusqu'au 1er mars";

  return (
    <div className={styles.promoBanner}>
      <div className={styles.promoTrack}>
        <span className={styles.promoText}>{promoText}</span>
        <span className={styles.promoText}>{promoText}</span>
        <span className={styles.promoText}>{promoText}</span>
        <span className={styles.promoText}>{promoText}</span>
      </div>
    </div>
  );
}
