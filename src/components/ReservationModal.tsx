"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, User, Mail, Phone, MessageSquare, Check, CreditCard } from "lucide-react";
import styles from "./ReservationModal.module.css";

interface Session {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  current_participants: number;
  max_participants: number;
  status: string;
  service?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    price_pack: number;
    pack_sessions: number;
  };
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: Session;
  serviceSlug?: string;
  serviceName?: string;
}

export default function ReservationModal({
  isOpen,
  onClose,
  session,
  serviceSlug,
  serviceName,
}: ReservationModalProps) {
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationType, setReservationType] = useState<"single" | "pack">("single");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [result, setResult] = useState<{
    reservation_number?: string;
    isQueued?: boolean;
    message?: string;
  } | null>(null);
  const [error, setError] = useState("");

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setResult(null);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Si es pack, intentar pago con Stripe
      if (reservationType === "pack") {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_slug: session?.service?.slug || serviceSlug,
            is_pack: true,
            customer_email: formData.email,
            customer_name: formData.name,
            session_id: session?.id,
          }),
        });

        const data = await response.json();

        // Si tiene URL de Stripe, redirigir
        if (data.url) {
          window.location.href = data.url;
          return;
        }

        // Si hay error, mostrarlo
        if (data.error) {
          throw new Error(data.error);
        }

        throw new Error("Error al crear sesión de pago");
      }

      // Reservación normal (sin pago inmediato)
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session?.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_message: formData.message,
          reservation_type: reservationType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la reservación");
      }

      setResult({
        reservation_number: data.reservation?.reservation_number,
        isQueued: data.isQueued,
        message: data.message,
      });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sessionDate = session?.session_date
    ? new Date(session.session_date).toLocaleDateString("fr-CH", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  const availableSpots = session
    ? session.max_participants - session.current_participants
    : null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>

        {step === "success" ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <Check size={48} />
            </div>
            <h2>{result?.isQueued ? "Inscription en liste d'attente" : "Réservation confirmée !"}</h2>
            <p className={styles.reservationNumber}>{result?.reservation_number}</p>
            <p>{result?.message}</p>
            <p className={styles.emailNote}>Un email de confirmation vous a été envoyé.</p>
            <button className={styles.doneBtn} onClick={onClose}>
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2>Réserver une séance</h2>
              {session && (
                <div className={styles.sessionInfo}>
                  <span className={styles.serviceName}>
                    {session.service?.name || serviceName}
                  </span>
                  <div className={styles.sessionDetails}>
                    <span>
                      <Calendar size={16} />
                      {sessionDate}
                    </span>
                    <span>
                      <Clock size={16} />
                      {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                    </span>
                  </div>
                  {availableSpots !== null && availableSpots <= 3 && (
                    <span className={styles.spotsWarning}>
                      {availableSpots === 0
                        ? "Complet - Liste d'attente"
                        : `Plus que ${availableSpots} place${availableSpots > 1 ? "s" : ""}`}
                    </span>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Type de réservation */}
              <div className={styles.typeSelector}>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${reservationType === "single" ? styles.active : ""}`}
                  onClick={() => setReservationType("single")}
                >
                  <span className={styles.typeBadge}>1ère séance</span>
                  <span className={styles.typePrice}>
                    {(session?.service?.price || 0) === 0 ? "GRATUIT" : `CHF ${session?.service?.price}.-`}
                  </span>
                  <span>Séance d&apos;essai</span>
                </button>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${reservationType === "pack" ? styles.active : ""}`}
                  onClick={() => setReservationType("pack")}
                >
                  <span className={styles.typeBadge}>Offre lancement</span>
                  <span className={styles.typePrice}>
                    CHF {session?.service?.price_pack || 99}.-
                  </span>
                  <span>Pack 6 séances</span>
                  <span className={styles.priceAfter}>
                    Ensuite CHF {session?.service?.slug === 'cours-domicile' ? '220' : '120'}.-
                  </span>
                </button>
              </div>

              <div className={styles.formGroup}>
                <label>
                  <User size={16} />
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Votre nom"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Mail size={16} />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre@email.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Phone size={16} />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+41 79 000 00 00"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <MessageSquare size={16} />
                  Message (optionnel)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className={styles.spinner}></span>
                ) : reservationType === "pack" ? (
                  <>
                    <CreditCard size={18} />
                    Payer CHF {session?.service?.price_pack || 99}.-
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Réserver ma séance gratuite
                  </>
                )}
              </button>

              <p className={styles.terms}>
                En réservant, vous acceptez les conditions générales.
                Annulation gratuite jusqu&apos;à 24h avant la séance.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
