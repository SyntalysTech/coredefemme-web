"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, FolderOpen, Eye, PlusCircle, Calendar, MessageSquare, Users, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
  pendingReservations: number;
  confirmedReservations: number;
  newContacts: number;
  todaySessions: number;
}

interface RecentReservation {
  id: string;
  reservation_number: string;
  customer_name: string;
  status: string;
  created_at: string;
  session?: {
    session_date: string;
    start_time: string;
    service?: {
      name: string;
    };
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalCategories: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    newContacts: 0,
    todaySessions: 0,
  });
  const [recentArticles, setRecentArticles] = useState<
    Array<{
      id: number;
      title: string;
      status: string;
      created_at: string;
    }>
  >([]);
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch all stats in parallel
      const [
        articlesRes,
        categoriesRes,
        reservationsRes,
        contactsRes,
        todaySessionsRes,
      ] = await Promise.all([
        supabase.from("articles").select("id, status"),
        supabase.from("categories").select("id"),
        supabase.from("reservations").select("id, status"),
        supabase.from("contacts").select("id, status"),
        supabase.from("sessions").select("id").eq("session_date", today),
      ]);

      const articles = (articlesRes.data || []) as Array<{ id: number; status: string }>;
      const categories = (categoriesRes.data || []) as Array<{ id: number }>;
      const reservations = (reservationsRes.data || []) as Array<{ id: string; status: string }>;
      const contacts = (contactsRes.data || []) as Array<{ id: string; status: string }>;
      const todaySessions = (todaySessionsRes.data || []) as Array<{ id: string }>;

      setStats({
        totalArticles: articles.length,
        publishedArticles: articles.filter((a) => a.status === "published").length,
        draftArticles: articles.filter((a) => a.status === "draft").length,
        totalCategories: categories.length,
        pendingReservations: reservations.filter((r) => r.status === "pending").length,
        confirmedReservations: reservations.filter((r) => r.status === "confirmed").length,
        newContacts: contacts.filter((c) => c.status === "new").length,
        todaySessions: todaySessions.length,
      });

      // Fetch recent articles
      const { data: recent } = await supabase
        .from("articles")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentArticles(recent || []);

      // Fetch recent reservations
      const { data: recentRes } = await supabase
        .from("reservations")
        .select(`
          id,
          reservation_number,
          customer_name,
          status,
          created_at,
          session:sessions (
            session_date,
            start_time,
            service:services (
              name
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentReservations(recentRes || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Tableau de bord</h1>
        <p>Bienvenue dans votre espace d&apos;administration Core de Femme</p>
      </header>

      {/* Stats Cards - Reservations */}
      <h2 className={styles.sectionTitle}>Réservations</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.pending}`}>
            <Clock size={28} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statNumber}>{stats.pendingReservations}</span>
            <span className={styles.statLabel}>En attente</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.confirmed}`}>
            <Calendar size={28} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statNumber}>{stats.confirmedReservations}</span>
            <span className={styles.statLabel}>Confirmées</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.messages}`}>
            <MessageSquare size={28} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statNumber}>{stats.newContacts}</span>
            <span className={styles.statLabel}>Nouveaux messages</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.today}`}>
            <Users size={28} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statNumber}>{stats.todaySessions}</span>
            <span className={styles.statLabel}>Séances aujourd&apos;hui</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Blog */}
      <h2 className={styles.sectionTitle}>Blog</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FileText size={28} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statNumber}>{stats.totalArticles}</span>
            <span className={styles.statLabel}>Articles</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.published}`}>
            <Eye size={28} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statNumber}>{stats.publishedArticles}</span>
            <span className={styles.statLabel}>Publiés</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.draft}`}>
            <FileText size={28} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statNumber}>{stats.draftArticles}</span>
            <span className={styles.statLabel}>Brouillons</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.categories}`}>
            <FolderOpen size={28} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statNumber}>{stats.totalCategories}</span>
            <span className={styles.statLabel}>Catégories</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className={styles.section}>
        <h2>Actions rapides</h2>
        <div className={styles.actionsGrid}>
          <Link href="/admin/reservations" className={styles.actionCard}>
            <Calendar size={24} />
            <span>Réservations</span>
          </Link>
          <Link href="/admin/sessions" className={styles.actionCard}>
            <Clock size={24} />
            <span>Gérer les séances</span>
          </Link>
          <Link href="/admin/contacts" className={styles.actionCard}>
            <MessageSquare size={24} />
            <span>Messages</span>
          </Link>
          <Link href="/admin/articles/new" className={styles.actionCard}>
            <PlusCircle size={24} />
            <span>Nouvel article</span>
          </Link>
          <Link href="/admin/categories" className={styles.actionCard}>
            <FolderOpen size={24} />
            <span>Catégories</span>
          </Link>
          <Link href="/" className={styles.actionCard} target="_blank">
            <Eye size={24} />
            <span>Voir le site</span>
          </Link>
        </div>
      </section>

      {/* Recent Reservations */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Réservations récentes</h2>
          <Link href="/admin/reservations" className={styles.viewAllLink}>
            Voir tout
          </Link>
        </div>

        {recentReservations.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={48} />
            <p>Aucune réservation pour le moment</p>
          </div>
        ) : (
          <div className={styles.articlesList}>
            {recentReservations.map((reservation) => (
              <Link
                key={reservation.id}
                href={`/admin/reservations?id=${reservation.id}`}
                className={styles.articleItem}
              >
                <div className={styles.articleInfo}>
                  <h3>{reservation.customer_name}</h3>
                  <span className={styles.articleDate}>
                    {reservation.reservation_number} • {reservation.session?.service?.name || 'N/A'}
                    {reservation.session?.session_date && (
                      <> • {new Date(reservation.session.session_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })} à {reservation.session.start_time?.slice(0, 5)}</>
                    )}
                  </span>
                </div>
                <span
                  className={`${styles.statusBadge} ${
                    reservation.status === "confirmed"
                      ? styles.confirmed
                      : reservation.status === "pending"
                      ? styles.pending
                      : styles.cancelled
                  }`}
                >
                  {reservation.status === "confirmed" ? "Confirmée" :
                   reservation.status === "pending" ? "En attente" : "Annulée"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Articles */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Articles récents</h2>
          <Link href="/admin/articles" className={styles.viewAllLink}>
            Voir tout
          </Link>
        </div>

        {recentArticles.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} />
            <p>Aucun article pour le moment</p>
            <Link href="/admin/articles/new" className={styles.emptyStateBtn}>
              Créer votre premier article
            </Link>
          </div>
        ) : (
          <div className={styles.articlesList}>
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/admin/articles/${article.id}`}
                className={styles.articleItem}
              >
                <div className={styles.articleInfo}>
                  <h3>{article.title}</h3>
                  <span className={styles.articleDate}>
                    {new Date(article.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span
                  className={`${styles.statusBadge} ${
                    article.status === "published"
                      ? styles.published
                      : styles.draft
                  }`}
                >
                  {article.status === "published" ? "Publié" : "Brouillon"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
