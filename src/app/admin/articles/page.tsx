"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface Article {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published";
  created_at: string;
  categories?: { name: string } | null;
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [statusFilter]);

  async function fetchArticles() {
    setIsLoading(true);
    try {
      let query = supabase
        .from("articles")
        .select("id, title, slug, status, created_at, categories(name)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleStatus(article: Article) {
    const newStatus: "draft" | "published" = article.status === "published" ? "draft" : "published";
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("articles")
        .update({ status: newStatus })
        .eq("id", article.id);

      setArticles(
        articles.map((a) =>
          a.id === article.id ? { ...a, status: newStatus } : a
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
    setOpenMenu(null);
  }

  async function deleteArticle(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      await supabase.from("articles").delete().eq("id", id);
      setArticles(articles.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting article:", error);
    }
    setOpenMenu(null);
  }

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.articlesPage}>
      <header className={styles.header}>
        <div>
          <h1>Articles</h1>
          <p>Gérez vos articles de blog</p>
        </div>
        <Link href="/admin/articles/new" className={styles.newBtn}>
          <Plus size={20} />
          Nouvel article
        </Link>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Tous les statuts</option>
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
        </select>
      </div>

      {/* Articles Table */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            {searchQuery
              ? "Aucun article trouvé"
              : "Aucun article pour le moment"}
          </p>
          <Link href="/admin/articles/new" className={styles.emptyBtn}>
            Créer votre premier article
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id}>
                  <td>
                    <span className={styles.articleTitle}>{article.title}</span>
                  </td>
                  <td>
                    <span className={styles.category}>
                      {article.categories?.name || "Non catégorisé"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        article.status === "published"
                          ? styles.published
                          : styles.draft
                      }`}
                    >
                      {article.status === "published" ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(article.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <Link
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        className={styles.actionBtn}
                        title="Voir"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className={styles.actionBtn}
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </Link>
                      <div className={styles.menuWrapper}>
                        <button
                          className={styles.actionBtn}
                          onClick={() =>
                            setOpenMenu(
                              openMenu === article.id ? null : article.id
                            )
                          }
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openMenu === article.id && (
                          <div className={styles.dropdown}>
                            <button onClick={() => toggleStatus(article)}>
                              {article.status === "published" ? (
                                <>
                                  <EyeOff size={16} /> Dépublier
                                </>
                              ) : (
                                <>
                                  <Eye size={16} /> Publier
                                </>
                              )}
                            </button>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => deleteArticle(article.id)}
                            >
                              <Trash2 size={16} /> Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
