"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Mail, ArrowRight } from "lucide-react";
import styles from "../paiement.module.css";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga mientras Stripe procesa
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.spinner}></div>
        <p>Confirmation en cours...</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={`${styles.icon} ${styles.iconSuccess}`}>
        <CheckCircle size={64} />
      </div>

      <h1>Paiement réussi !</h1>

      <p className={styles.message}>
        Merci pour votre achat. Votre pack de séances est maintenant actif.
      </p>

      <div className={styles.infoBox}>
        <div className={styles.infoItem}>
          <Mail size={20} />
          <span>Un email de confirmation vous a été envoyé</span>
        </div>
        <div className={styles.infoItem}>
          <Calendar size={20} />
          <span>Vous pouvez maintenant réserver vos séances</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/reserver" className={styles.primaryBtn}>
          Réserver une séance
          <ArrowRight size={18} />
        </Link>

        <Link href="/mon-compte" className={styles.secondaryBtn}>
          Voir mon compte
        </Link>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className={styles.card}>
      <div className={styles.spinner}></div>
      <p>Chargement...</p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<LoadingFallback />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
