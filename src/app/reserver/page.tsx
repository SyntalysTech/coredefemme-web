"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Check, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ReservationModal from "@/components/ReservationModal";
import styles from "./page.module.css";

interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  price_pack: number;
  pack_sessions: number;
  max_participants: number;
  service_type: string;
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

export default function ReserverPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [currentWeekStart, selectedService]);

  async function fetchServices() {
    try {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("name");

      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }

  async function fetchSessions() {
    setIsLoading(true);
    try {
      const startDate = currentWeekStart.toISOString().split("T")[0];
      const endDate = new Date(currentWeekStart);
      endDate.setDate(endDate.getDate() + 6);

      let query = supabase
        .from("sessions")
        .select(`
          *,
          service:services (*)
        `)
        .gte("session_date", startDate)
        .lte("session_date", endDate.toISOString().split("T")[0])
        .in("status", ["available", "full"])
        .order("session_date")
        .order("start_time");

      if (selectedService !== "all") {
        query = query.eq("service_id", selectedService);
      }

      const { data } = await query;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function navigateWeek(direction: "prev" | "next") {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeekStart(newDate);
  }

  function getWeekDays() {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }

  function getSessionsForDay(date: Date) {
    const dateStr = date.toISOString().split("T")[0];
    return sessions.filter((s) => s.session_date === dateStr);
  }

  function handleSessionClick(session: Session) {
    setSelectedSession(session);
    setIsModalOpen(true);
  }

  const weekDays = getWeekDays();
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <h1>Réserver une séance</h1>
        <p>Choisissez votre cours et réservez votre place en quelques clics</p>
      </section>

      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.serviceFilter}>
            <button
              className={`${styles.filterBtn} ${selectedService === "all" ? styles.active : ""}`}
              onClick={() => setSelectedService("all")}
            >
              Tous les cours
            </button>
            {services.map((service) => (
              <button
                key={service.id}
                className={`${styles.filterBtn} ${selectedService === service.id ? styles.active : ""}`}
                onClick={() => setSelectedService(service.id)}
              >
                {service.name}
              </button>
            ))}
          </div>
        </div>

        {/* Week Navigation */}
        <div className={styles.weekNav}>
          <button
            className={styles.navBtn}
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft size={20} />
            Semaine précédente
          </button>

          <h2 className={styles.weekTitle}>
            {currentWeekStart.toLocaleDateString("fr-CH", { day: "numeric", month: "long" })}
            {" - "}
            {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-CH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button
            className={styles.navBtn}
            onClick={() => navigateWeek("next")}
          >
            Semaine suivante
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className={styles.calendarGrid}>
          {weekDays.map((day) => {
            const dayStr = day.toISOString().split("T")[0];
            const daySessions = getSessionsForDay(day);
            const isPast = dayStr < today;
            const isToday = dayStr === today;

            return (
              <div
                key={dayStr}
                className={`${styles.dayColumn} ${isPast ? styles.past : ""} ${isToday ? styles.today : ""}`}
              >
                <div className={styles.dayHeader}>
                  <span className={styles.dayName}>
                    {day.toLocaleDateString("fr-CH", { weekday: "short" })}
                  </span>
                  <span className={styles.dayNumber}>
                    {day.getDate()}
                  </span>
                </div>

                <div className={styles.sessionsContainer}>
                  {isLoading ? (
                    <div className={styles.loading}>
                      <div className={styles.spinner}></div>
                    </div>
                  ) : daySessions.length === 0 ? (
                    <p className={styles.noSessions}>Pas de séance</p>
                  ) : (
                    daySessions.map((session) => {
                      const availableSpots = session.max_participants - session.current_participants;
                      const isFull = availableSpots <= 0;

                      return (
                        <button
                          key={session.id}
                          className={`${styles.sessionCard} ${isFull ? styles.full : ""} ${isPast ? styles.disabled : ""}`}
                          onClick={() => !isPast && handleSessionClick(session)}
                          disabled={isPast}
                        >
                          <span className={styles.sessionTime}>
                            <Clock size={14} />
                            {session.start_time.slice(0, 5)}
                          </span>
                          <span className={styles.sessionName}>
                            {session.service?.name}
                          </span>
                          <span className={`${styles.sessionSpots} ${isFull ? styles.full : availableSpots <= 2 ? styles.low : ""}`}>
                            <Users size={14} />
                            {isFull ? "Complet" : `${availableSpots} place${availableSpots > 1 ? "s" : ""}`}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Cards */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <MapPin size={24} />
            </div>
            <div>
              <h3>Lieu des cours</h3>
              <p>Crossfit la Vouivre, Rue Pierre-Péquignat 7, 1er étage, 2900 Porrentruy</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Clock size={24} />
            </div>
            <div>
              <h3>Durée</h3>
              <p>45 minutes par séance</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Check size={24} />
            </div>
            <div>
              <h3>Annulation</h3>
              <p>Gratuite jusqu&apos;à 24h avant la séance</p>
            </div>
          </div>
        </div>

        {/* Services Overview */}
        <section className={styles.servicesSection}>
          <h2>Nos cours</h2>
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.id} className={styles.serviceCard}>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className={styles.servicePricing}>
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Séance</span>
                    <span className={styles.priceValue}>CHF {service.price}.-</span>
                  </div>
                  {service.price_pack && (
                    <div className={styles.priceItem}>
                      <span className={styles.priceLabel}>Pack {service.pack_sessions} séances</span>
                      <span className={styles.priceValue}>CHF {service.price_pack}.-</span>
                    </div>
                  )}
                </div>
                <Link
                  href={`/${service.slug}`}
                  className={styles.serviceLink}
                >
                  En savoir plus
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <Calendar size={48} />
          <h2>Pas de séance disponible ?</h2>
          <p>Contactez-moi pour organiser un cours privé à domicile ou pour être informée des prochaines disponibilités.</p>
          <Link href="/contact" className={styles.ctaBtn}>
            Me contacter
          </Link>
        </section>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSession(null);
          fetchSessions(); // Refresh after reservation
        }}
        session={selectedSession || undefined}
      />
    </>
  );
}
