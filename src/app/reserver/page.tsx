"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Check, MapPin, User, LogIn } from "lucide-react";
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

interface QueueInfo {
  session_id: string;
  queue_count: number;
  user_position?: number;
}

interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueInfo[]>([]);

  useEffect(() => {
    checkAuth();
    fetchServices();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser({
        id: session.user.id,
        email: session.user.email!,
        full_name: session.user.user_metadata?.full_name,
      });
    }
  }

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
      const sessionsData = (data || []) as Session[];
      setSessions(sessionsData);

      // Si el usuario está autenticado, obtener info de cola
      if (currentUser && sessionsData.length > 0) {
        await fetchQueueInfo(sessionsData.map(s => s.id));
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchQueueInfo(sessionIds: string[]) {
    if (!currentUser || sessionIds.length === 0) return;

    try {
      // Obtener conteo de cola por sesión
      const { data: queueData } = await supabase
        .from("reservations")
        .select("session_id, queue_position, customer_email")
        .in("session_id", sessionIds)
        .not("queue_position", "is", null)
        .eq("status", "pending");

      if (queueData) {
        const queueMap: Record<string, QueueInfo> = {};
        const typedQueueData = queueData as Array<{
          session_id: string;
          queue_position: number;
          customer_email: string;
        }>;

        typedQueueData.forEach((r) => {
          if (!queueMap[r.session_id]) {
            queueMap[r.session_id] = {
              session_id: r.session_id,
              queue_count: 0,
            };
          }
          queueMap[r.session_id].queue_count++;

          // Si es el usuario actual, guardar su posición
          if (r.customer_email === currentUser.email) {
            queueMap[r.session_id].user_position = r.queue_position;
          }
        });

        setQueueInfo(Object.values(queueMap));
      }
    } catch (error) {
      console.error("Error fetching queue info:", error);
    }
  }

  function getQueueInfoForSession(sessionId: string): QueueInfo | undefined {
    return queueInfo.find(q => q.session_id === sessionId);
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

        {/* Auth Banner */}
        <div className={styles.authBanner}>
          {currentUser ? (
            <Link href="/mon-compte" className={styles.accountLink}>
              <User size={18} />
              {currentUser.full_name || currentUser.email}
            </Link>
          ) : (
            <div className={styles.authLinks}>
              <span>Pour voir la liste d&apos;attente et gérer vos réservations</span>
              <Link href="/connexion" className={styles.loginLink}>
                <LogIn size={16} />
                Se connecter
              </Link>
              <span className={styles.separator}>ou</span>
              <Link href="/inscription" className={styles.signupLink}>
                S&apos;inscrire
              </Link>
            </div>
          )}
        </div>
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
                      const sessionQueueInfo = getQueueInfoForSession(session.id);

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
                          {/* Queue info - solo para usuarios autenticados */}
                          {currentUser && isFull && sessionQueueInfo && (
                            <span className={styles.queueInfo}>
                              {sessionQueueInfo.user_position
                                ? `Vous êtes ${sessionQueueInfo.user_position}${sessionQueueInfo.user_position === 1 ? "er" : "ème"} en liste`
                                : `${sessionQueueInfo.queue_count} en attente`}
                            </span>
                          )}
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
        currentUser={currentUser ? {
          id: currentUser.id,
          email: currentUser.email,
          user_metadata: {
            full_name: currentUser.full_name,
          }
        } : null}
      />
    </>
  );
}
