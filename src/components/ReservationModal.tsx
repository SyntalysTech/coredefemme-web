"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, User, Mail, Phone, MessageSquare, Check, CreditCard, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";
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

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
  };
}

interface CustomerPack {
  id: string;
  service_id: string;
  total_sessions: number;
  remaining_sessions: number;
  status: string;
  service?: {
    name: string;
    slug: string;
  };
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: Session;
  serviceSlug?: string;
  serviceName?: string;
  currentUser?: User | null;
}

export default function ReservationModal({
  isOpen,
  onClose,
  session,
  serviceSlug,
  serviceName,
  currentUser,
}: ReservationModalProps) {
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationType, setReservationType] = useState<"single" | "pack" | "use_pack">("single");
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [userPacks, setUserPacks] = useState<CustomerPack[]>([]);
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

  // Load user's packs if authenticated
  useEffect(() => {
    async function loadUserPacks() {
      if (!currentUser?.id || !currentUser?.email) {
        setUserPacks([]);
        return;
      }

      const { data } = await supabase
        .from("customer_packs")
        .select(`
          id,
          service_id,
          total_sessions,
          remaining_sessions,
          status,
          service:services (
            name,
            slug
          )
        `)
        .or(`user_id.eq.${currentUser.id},customer_email.eq.${currentUser.email}`)
        .eq("status", "active")
        .gt("remaining_sessions", 0);

      setUserPacks(data || []);
    }

    if (isOpen && currentUser) {
      loadUserPacks();
    }
  }, [isOpen, currentUser]);

  // Check if user has a pack for this service
  const availablePack = userPacks.find(
    (pack) => pack.service_id === session?.service?.id
  );

  // Reset on open and prefill user data if authenticated
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setFormData({
        name: currentUser?.user_metadata?.full_name || "",
        email: currentUser?.email || "",
        phone: currentUser?.user_metadata?.phone || "",
        message: "",
      });
      setResult(null);
      setError("");
      // If user has a pack for this service, default to using it
      if (availablePack) {
        setReservationType("use_pack");
        setSelectedPackId(availablePack.id);
      } else {
        setReservationType("single");
        setSelectedPackId(null);
      }
    }
  }, [isOpen, currentUser, availablePack]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Si compra pack nuevo, redirigir a Stripe
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
            user_id: currentUser?.id || null,
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

      // Reservación usando pack existente o sesión gratuita
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session?.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_message: formData.message,
          reservation_type: reservationType === "use_pack" ? "pack" : reservationType,
          pack_id: reservationType === "use_pack" ? selectedPackId : null,
          user_id: currentUser?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la reservación");
      }

      setResult({
        reservation_number: data.reservation?.reservation_number,
        isQueued: data.isQueued,
        message: reservationType === "use_pack"
          ? `Réservation confirmée ! Il vous reste ${(availablePack?.remaining_sessions || 1) - 1} séance(s) dans votre pack.`
          : data.message,
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
                {/* Option: Utiliser pack existant */}
                {availablePack && (
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${styles.packBtn} ${reservationType === "use_pack" ? styles.active : ""}`}
                    onClick={() => {
                      setReservationType("use_pack");
                      setSelectedPackId(availablePack.id);
                    }}
                  >
                    <span className={styles.typeBadge}>Mon Pack</span>
                    <span className={styles.typePrice}>
                      <Package size={18} />
                      {availablePack.remaining_sessions} séance{availablePack.remaining_sessions > 1 ? "s" : ""}
                    </span>
                    <span>Utiliser mon pack</span>
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.typeBtn} ${reservationType === "single" ? styles.active : ""}`}
                  onClick={() => {
                    setReservationType("single");
                    setSelectedPackId(null);
                  }}
                >
                  <span className={styles.typeBadge}>1ère séance</span>
                  <span className={styles.typePrice}>
                    {(session?.service?.price || 0) === 0 ? "Offert" : `CHF ${session?.service?.price}.-`}
                  </span>
                  <span>Séance d&apos;essai</span>
                </button>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${reservationType === "pack" ? styles.active : ""}`}
                  onClick={() => {
                    setReservationType("pack");
                    setSelectedPackId(null);
                  }}
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
                ) : reservationType === "use_pack" ? (
                  <>
                    <Package size={18} />
                    Utiliser 1 séance de mon pack
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Réserver ma séance découverte
                  </>
                )}
              </button>

              <p className={styles.terms}>
                En réservant, vous acceptez les conditions générales.
                Annulation flexible jusqu&apos;à 24h avant la séance.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
