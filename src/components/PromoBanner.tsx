"use client";

import styles from "./PromoBanner.module.css";

export default function PromoBanner() {
  const promoText = "Offre de lancement : Pack 6 seances a 99.- au lieu de 120.- | Cours a domicile : Pack 6 seances a 180.- au lieu de 200.- | Valable jusqu'a debut mars";

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
