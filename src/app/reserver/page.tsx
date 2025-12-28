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

// Fecha mínima: 14 de enero 2026
const MIN_DATE = new Date("2026-01-14");

// Obtener los próximos N miércoles a partir de una fecha
function getNextWednesdays(startDate: Date, count: number): Date[] {
  const wednesdays: Date[] = [];
  const current = new Date(startDate);

  // Avanzar al próximo miércoles si no es miércoles
  while (current.getDay() !== 3) {
    current.setDate(current.getDate() + 1);
  }

  for (let i = 0; i < count; i++) {
    wednesdays.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return wednesdays;
}

export default function ReserverPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueInfo[]>([]);

  // Mostrar 4 miércoles por página
  const WEDNESDAYS_PER_PAGE = 4;

  // Calcular fecha de inicio (máximo entre hoy y MIN_DATE)
  const today = new Date();
  const startDate = today > MIN_DATE ? today : MIN_DATE;

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
  }, [currentPage, selectedService]);

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
      // Calcular los miércoles para esta página
      const pageStartDate = new Date(startDate);
      pageStartDate.setDate(pageStartDate.getDate() + (currentPage * WEDNESDAYS_PER_PAGE * 7));

      const wednesdays = getNextWednesdays(pageStartDate, WEDNESDAYS_PER_PAGE);
      const firstWednesday = wednesdays[0];
      const lastWednesday = wednesdays[wednesdays.length - 1];

      let query = supabase
        .from("sessions")
        .select(`
          *,
          service:services (*)
        `)
        .gte("session_date", firstWednesday.toISOString().split("T")[0])
        .lte("session_date", lastWednesday.toISOString().split("T")[0])
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

  function navigatePage(direction: "prev" | "next") {
    if (direction === "prev" && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next") {
      setCurrentPage(currentPage + 1);
    }
  }

  function getWednesdaysForCurrentPage(): Date[] {
    const pageStartDate = new Date(startDate);
    pageStartDate.setDate(pageStartDate.getDate() + (currentPage * WEDNESDAYS_PER_PAGE * 7));
    return getNextWednesdays(pageStartDate, WEDNESDAYS_PER_PAGE);
  }

  function getSessionsForDay(date: Date) {
    const dateStr = date.toISOString().split("T")[0];
    return sessions.filter((s) => s.session_date === dateStr);
  }

  function handleSessionClick(session: Session) {
    setSelectedSession(session);
    setIsModalOpen(true);
  }

  const wednesdays = getWednesdaysForCurrentPage();
  const todayStr = new Date().toISOString().split("T")[0];

  // Calcular rango de fechas para el título
  const firstWednesday = wednesdays[0];
  const lastWednesday = wednesdays[wednesdays.length - 1];

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

        {/* Navigation */}
        <div className={styles.weekNav}>
          <button
            className={styles.navBtn}
            onClick={() => navigatePage("prev")}
            disabled={currentPage === 0}
          >
            <ChevronLeft size={20} />
            Précédent
          </button>

          <h2 className={styles.weekTitle}>
            {firstWednesday.toLocaleDateString("fr-CH", { day: "numeric", month: "long" })}
            {" - "}
            {lastWednesday.toLocaleDateString("fr-CH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button
            className={styles.navBtn}
            onClick={() => navigatePage("next")}
          >
            Suivant
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid - Solo miércoles */}
        <div className={styles.calendarGrid}>
          {wednesdays.map((day) => {
            const dayStr = day.toISOString().split("T")[0];
            const daySessions = getSessionsForDay(day);
            const isPast = dayStr < todayStr;
            const isToday = dayStr === todayStr;

            return (
              <div
                key={dayStr}
                className={`${styles.dayColumn} ${isPast ? styles.past : ""} ${isToday ? styles.today : ""}`}
              >
                <div className={styles.dayHeader}>
                  <span className={styles.dayName}>
                    {day.toLocaleDateString("fr-CH", { weekday: "long" })}
                  </span>
                  <span className={styles.dayNumber}>
                    {day.toLocaleDateString("fr-CH", { day: "numeric", month: "short" })}
                  </span>
                </div>

                <div className={styles.sessionsContainer}>
                  {isLoading ? (
                    <div className={styles.loading}>
                      <div className={styles.spinner}></div>
                    </div>
                  ) : daySessions.length === 0 ? (
                    <p className={styles.noSessions}>Pas de séance prévue</p>
                  ) : (
                    daySessions.map((session) => {
                      const availableSpots = session.max_participants - session.current_participants;
                      const isFull = availableSpots <= 0;
                      const sessionQueueInfo = getQueueInfoForSession(session.id);
                      // Durée: 60 min pour Core de Maman/Sculpt, 45 min pour domicile
                      const duration = session.service?.service_type === "home" ? 45 : 60;

                      return (
                        <button
                          key={session.id}
                          className={`${styles.sessionCard} ${isFull ? styles.full : ""} ${isPast ? styles.disabled : ""}`}
                          onClick={() => !isPast && handleSessionClick(session)}
                          disabled={isPast}
                        >
                          <span className={styles.sessionTime}>
                            <Clock size={14} />
                            {session.start_time.slice(0, 5)} ({duration} min)
                          </span>
                          <span className={styles.sessionName}>
                            {session.service?.name}
                          </span>
                          <span className={`${styles.sessionSpots} ${isFull ? styles.full : availableSpots <= 2 ? styles.low : ""}`}>
                            <Users size={14} />
                            {isFull ? "Complet" : `${availableSpots} place${availableSpots > 1 ? "s" : ""}`}
                          </span>
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
              <p>1 heure par séance (45 min à domicile)</p>
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
            {services.map((service) => {
              const duration = service.service_type === "home" ? 45 : 60;
              return (
                <div key={service.id} className={styles.serviceCard}>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <p className={styles.serviceDuration}>
                    <Clock size={16} /> {duration} minutes
                  </p>
                  <div className={styles.servicePricing}>
                    <div className={styles.priceItem}>
                      <span className={styles.priceLabel}>Séance</span>
                      <span className={styles.priceValue}>
                        {service.price === 0 ? "GRATUIT" : `CHF ${service.price}.-`}
                      </span>
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
              );
            })}
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
          fetchSessions();
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
