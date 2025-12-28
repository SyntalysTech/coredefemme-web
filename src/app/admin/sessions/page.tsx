"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, Clock, Users, Trash2, Edit2, RefreshCw, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface Service {
  id: string;
  name: string;
  slug: string;
  duration_minutes: number;
  max_participants: number;
}

interface Session {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  current_participants: number;
  max_participants: number;
  status: string;
  service_id: string;
  service?: Service;
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const [formData, setFormData] = useState({
    service_id: "",
    session_date: "",
    start_time: "09:30",
    end_time: "10:30",
    max_participants: 8,
  });

  const fetchServices = useCallback(async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name");
    setServices(data || []);
  }, []);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const startDate = selectedWeek.toISOString().split("T")[0];
      const endDate = new Date(selectedWeek);
      endDate.setDate(endDate.getDate() + 6);

      const { data, error } = await supabase
        .from("sessions")
        .select(`
          *,
          service:services (*)
        `)
        .gte("session_date", startDate)
        .lte("session_date", endDate.toISOString().split("T")[0])
        .order("session_date")
        .order("start_time");

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedWeek]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const sessionData = {
        service_id: formData.service_id,
        session_date: formData.session_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        max_participants: formData.max_participants,
        current_participants: 0,
        status: "available",
      };

      if (editingSession) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("sessions")
          .update(sessionData)
          .eq("id", editingSession.id);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("sessions")
          .insert(sessionData);
      }

      setShowForm(false);
      setEditingSession(null);
      setFormData({
        service_id: "",
        session_date: "",
        start_time: "09:30",
        end_time: "10:30",
        max_participants: 8,
      });
      fetchSessions();
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setFormData({
      service_id: session.service_id,
      session_date: session.session_date,
      start_time: session.start_time.slice(0, 5),
      end_time: session.end_time.slice(0, 5),
      max_participants: session.max_participants,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) return;

    try {
      await supabase.from("sessions").delete().eq("id", id);
      fetchSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("sessions")
        .update({ status: newStatus })
        .eq("id", id);
      fetchSessions();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setSelectedWeek(newDate);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeek);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getSessionsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return sessions.filter((s) => s.session_date === dateStr);
  };

  const weekDays = getWeekDays();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return { label: "Disponible", class: styles.available };
      case "full":
        return { label: "Complet", class: styles.full };
      case "cancelled":
        return { label: "Annulé", class: styles.cancelled };
      default:
        return { label: status, class: "" };
    }
  };

  if (isLoading && sessions.length === 0) {
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
            <h1>Gestion des séances</h1>
            <p>Planifiez et gérez vos cours</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button onClick={fetchSessions} className={styles.refreshBtn}>
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => {
              setEditingSession(null);
              setFormData({
                service_id: services[0]?.id || "",
                session_date: new Date().toISOString().split("T")[0],
                start_time: "09:30",
                end_time: "10:30",
                max_participants: 8,
              });
              setShowForm(true);
            }}
            className={styles.addBtn}
          >
            <Plus size={18} />
            Nouvelle séance
          </button>
        </div>
      </header>

      {/* Week Navigation */}
      <div className={styles.weekNav}>
        <button onClick={() => navigateWeek("prev")} className={styles.navBtn}>
          ← Semaine précédente
        </button>
        <h2>
          {selectedWeek.toLocaleDateString("fr-CH", { day: "numeric", month: "long" })}
          {" - "}
          {new Date(selectedWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-CH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button onClick={() => navigateWeek("next")} className={styles.navBtn}>
          Semaine suivante →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className={styles.calendarGrid}>
        {weekDays.map((day) => {
          const dayStr = day.toISOString().split("T")[0];
          const daySessions = getSessionsForDay(day);
          const isToday = dayStr === new Date().toISOString().split("T")[0];

          return (
            <div
              key={dayStr}
              className={`${styles.dayColumn} ${isToday ? styles.today : ""}`}
            >
              <div className={styles.dayHeader}>
                <span className={styles.dayName}>
                  {day.toLocaleDateString("fr-CH", { weekday: "short" })}
                </span>
                <span className={styles.dayNumber}>{day.getDate()}</span>
              </div>

              <div className={styles.sessionsContainer}>
                {daySessions.length === 0 ? (
                  <p className={styles.noSessions}>Aucune séance</p>
                ) : (
                  daySessions.map((session) => {
                    const statusInfo = getStatusBadge(session.status);
                    return (
                      <div key={session.id} className={styles.sessionCard}>
                        <div className={styles.sessionHeader}>
                          <span className={styles.sessionTime}>
                            <Clock size={14} />
                            {session.start_time.slice(0, 5)}
                          </span>
                          <span className={`${styles.statusBadge} ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <span className={styles.sessionName}>
                          {session.service?.name}
                        </span>
                        <span className={styles.sessionParticipants}>
                          <Users size={14} />
                          {session.current_participants}/{session.max_participants}
                        </span>
                        <div className={styles.sessionActions}>
                          <button
                            onClick={() => handleEdit(session)}
                            className={styles.editBtn}
                            title="Modifier"
                          >
                            <Edit2 size={14} />
                          </button>
                          {session.status === "available" && (
                            <button
                              onClick={() => handleStatusChange(session.id, "cancelled")}
                              className={styles.cancelBtn}
                              title="Annuler"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {session.status === "cancelled" && (
                            <button
                              onClick={() => handleStatusChange(session.id, "available")}
                              className={styles.restoreBtn}
                              title="Restaurer"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingSession ? "Modifier la séance" : "Nouvelle séance"}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Cours</label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  required
                >
                  <option value="">Sélectionner un cours</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Calendar size={16} />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.session_date}
                  onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    <Clock size={16} />
                    Début
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <Clock size={16} />
                    Fin
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Users size={16} />
                  Places max
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowForm(false)} className={styles.cancelFormBtn}>
                  Annuler
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingSession ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
