"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, FolderOpen, Eye, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalCategories: 0,
  });
  const [recentArticles, setRecentArticles] = useState<
    Array<{
      id: number;
      title: string;
      status: string;
      created_at: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch stats
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [articlesRes, categoriesRes] = await Promise.all([
        (supabase as any).from("articles").select("id, status"),
        (supabase as any).from("categories").select("id"),
      ]);

      const articles = (articlesRes.data || []) as Array<{ id: number; status: string }>;
      const categories = (categoriesRes.data || []) as Array<{ id: number }>;

      setStats({
        totalArticles: articles.length,
        publishedArticles: articles.filter((a) => a.status === "published")
          .length,
        draftArticles: articles.filter((a) => a.status === "draft").length,
        totalCategories: categories.length,
      });

      // Fetch recent articles
      const { data: recent } = await supabase
        .from("articles")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentArticles(recent || []);
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

      {/* Stats Cards */}
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
          <Link href="/admin/articles/new" className={styles.actionCard}>
            <PlusCircle size={24} />
            <span>Nouvel article</span>
          </Link>
          <Link href="/admin/categories" className={styles.actionCard}>
            <FolderOpen size={24} />
            <span>Gérer les catégories</span>
          </Link>
          <Link href="/blog" className={styles.actionCard} target="_blank">
            <Eye size={24} />
            <span>Voir le blog</span>
          </Link>
        </div>
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
