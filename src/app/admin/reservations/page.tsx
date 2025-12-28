"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter, Check, X, Clock, Mail, Phone, Calendar, User, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface Reservation {
  id: string;
  reservation_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_message: string;
  status: string;
  queue_position: number | null;
  payment_status: string;
  created_at: string;
  session?: {
    id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    current_participants: number;
    max_participants: number;
    service?: {
      name: string;
      slug: string;
    };
  };
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchReservations = useCallback(async () => {
    try {
      let query = supabase
        .from("reservations")
        .select(`
          *,
          session:sessions (
            id,
            session_date,
            start_time,
            end_time,
            current_participants,
            max_participants,
            service:services (
              name,
              slug
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReservations(data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReservations();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('reservations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReservations]);

  async function updateReservationStatus(id: string, newStatus: string) {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Error updating reservation');

      await fetchReservations();
      setSelectedReservation(null);
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Error al actualizar la reservación");
    } finally {
      setIsUpdating(false);
    }
  }

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reservation_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmée", class: styles.confirmed };
      case "pending":
        return { label: "En attente", class: styles.pending };
      case "cancelled":
        return { label: "Annulée", class: styles.cancelled };
      case "completed":
        return { label: "Terminée", class: styles.completed };
      case "no_show":
        return { label: "Absente", class: styles.noShow };
      default:
        return { label: status, class: "" };
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin" className={styles.backLink}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1>Réservations</h1>
            <p>{reservations.length} réservation{reservations.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={fetchReservations} className={styles.refreshBtn}>
          <RefreshCw size={18} />
          Actualiser
        </button>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="cancelled">Annulées</option>
            <option value="completed">Terminées</option>
            <option value="no_show">Absentes</option>
          </select>
        </div>
      </div>

      {/* Reservations List */}
      <div className={styles.reservationsList}>
        {filteredReservations.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={48} />
            <p>Aucune réservation trouvée</p>
          </div>
        ) : (
          filteredReservations.map((reservation) => {
            const statusInfo = getStatusBadge(reservation.status);
            return (
              <div
                key={reservation.id}
                className={`${styles.reservationCard} ${selectedReservation?.id === reservation.id ? styles.selected : ""}`}
                onClick={() => setSelectedReservation(reservation)}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.reservationNumber}>
                    {reservation.reservation_number}
                  </span>
                  <span className={`${styles.statusBadge} ${statusInfo.class}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.customerInfo}>
                    <User size={16} />
                    <span>{reservation.customer_name}</span>
                  </div>

                  {reservation.session && (
                    <div className={styles.sessionInfo}>
                      <Calendar size={16} />
                      <span>
                        {reservation.session.service?.name} •{" "}
                        {new Date(reservation.session.session_date).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        à {reservation.session.start_time.slice(0, 5)}
                      </span>
                    </div>
                  )}

                  {reservation.queue_position && (
                    <div className={styles.queueInfo}>
                      <Clock size={16} />
                      <span>Position en file: {reservation.queue_position}</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.createdAt}>
                    {new Date(reservation.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Panel */}
      {selectedReservation && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <h2>Détails de la réservation</h2>
            <button
              className={styles.closeBtn}
              onClick={() => setSelectedReservation(null)}
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles.detailContent}>
            <div className={styles.detailSection}>
              <h3>Réservation</h3>
              <div className={styles.detailRow}>
                <span>Numéro</span>
                <strong>{selectedReservation.reservation_number}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Statut</span>
                <span className={`${styles.statusBadge} ${getStatusBadge(selectedReservation.status).class}`}>
                  {getStatusBadge(selectedReservation.status).label}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span>Paiement</span>
                <span className={`${styles.paymentBadge} ${selectedReservation.payment_status === "paid" ? styles.paid : ""}`}>
                  {selectedReservation.payment_status === "paid" ? "Payé" : "En attente"}
                </span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>Client</h3>
              <div className={styles.detailRow}>
                <User size={16} />
                <span>{selectedReservation.customer_name}</span>
              </div>
              <div className={styles.detailRow}>
                <Mail size={16} />
                <a href={`mailto:${selectedReservation.customer_email}`}>
                  {selectedReservation.customer_email}
                </a>
              </div>
              {selectedReservation.customer_phone && (
                <div className={styles.detailRow}>
                  <Phone size={16} />
                  <a href={`tel:${selectedReservation.customer_phone}`}>
                    {selectedReservation.customer_phone}
                  </a>
                </div>
              )}
              {selectedReservation.customer_message && (
                <div className={styles.messageBox}>
                  <strong>Message:</strong>
                  <p>{selectedReservation.customer_message}</p>
                </div>
              )}
            </div>

            {selectedReservation.session && (
              <div className={styles.detailSection}>
                <h3>Séance</h3>
                <div className={styles.detailRow}>
                  <span>Cours</span>
                  <strong>{selectedReservation.session.service?.name}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Date</span>
                  <span>
                    {new Date(selectedReservation.session.session_date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span>Horaire</span>
                  <span>
                    {selectedReservation.session.start_time.slice(0, 5)} -{" "}
                    {selectedReservation.session.end_time.slice(0, 5)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span>Places</span>
                  <span>
                    {selectedReservation.session.current_participants} /{" "}
                    {selectedReservation.session.max_participants}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.detailActions}>
            {selectedReservation.status === "pending" && (
              <>
                <button
                  className={`${styles.actionBtn} ${styles.confirm}`}
                  onClick={() => updateReservationStatus(selectedReservation.id, "confirmed")}
                  disabled={isUpdating}
                >
                  <Check size={18} />
                  Confirmer
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.cancel}`}
                  onClick={() => updateReservationStatus(selectedReservation.id, "cancelled")}
                  disabled={isUpdating}
                >
                  <X size={18} />
                  Annuler
                </button>
              </>
            )}
            {selectedReservation.status === "confirmed" && (
              <>
                <button
                  className={`${styles.actionBtn} ${styles.complete}`}
                  onClick={() => updateReservationStatus(selectedReservation.id, "completed")}
                  disabled={isUpdating}
                >
                  <Check size={18} />
                  Marquer terminée
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.noShowBtn}`}
                  onClick={() => updateReservationStatus(selectedReservation.id, "no_show")}
                  disabled={isUpdating}
                >
                  <X size={18} />
                  Absente
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
