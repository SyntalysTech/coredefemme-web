"use client";

import Link from "next/link";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import styles from "../paiement.module.css";

export default function PaymentCancelPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={`${styles.icon} ${styles.iconError}`}>
          <XCircle size={64} />
        </div>

        <h1>Paiement annulé</h1>

        <p className={styles.message}>
          Votre paiement a été annulé. Aucun montant n&apos;a été débité de votre compte.
        </p>

        <p className={styles.subMessage}>
          Si vous avez rencontré un problème lors du paiement ou si vous avez des questions,
          n&apos;hésitez pas à nous contacter.
        </p>

        <div className={styles.actions}>
          <Link href="/reserver" className={styles.primaryBtn}>
            <ArrowLeft size={18} />
            Retour aux réservations
          </Link>

          <Link href="/contact" className={styles.secondaryBtn}>
            <HelpCircle size={18} />
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}
