import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerClient } from "@/lib/supabase";
import { ArticleWithCategory } from "@/types/database";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog - Conseils Pilates & Bien-être",
  description: "Découvrez nos articles sur le Pilates, la récupération post-partum, le bien-être et des conseils pour prendre soin de votre corps.",
};

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

async function getArticles(): Promise<ArticleWithCategory[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as any;

  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("status", "published")
    .lte("publish_date", new Date().toISOString())
    .order("publish_date", { ascending: false });

  if (error) {
    console.error("Error fetching articles:", error);
    return [];
  }

  return data as ArticleWithCategory[];
}

async function getCategories(): Promise<CategoryItem[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as any;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return (data || []) as CategoryItem[];
}

export default async function BlogPage() {
  const articles = await getArticles();
  const categories = await getCategories();

  const featuredArticles = articles.filter((a) => a.is_featured);
  const regularArticles = articles.filter((a) => !a.is_featured);

  return (
    <>
      {/* Hero Section */}
      <section className={styles.blogHero}>
        <h1>Blog</h1>
        <p>Conseils, astuces et inspiration pour votre bien-être</p>
      </section>

      <div className={styles.blogContainer}>
        {/* Articles destacados */}
        {featuredArticles.length > 0 && (
          <section className={styles.featuredSection}>
            <h2>Articles à la une</h2>
            <div className={styles.featuredGrid}>
              {featuredArticles.slice(0, 2).map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className={styles.featuredCard}
                >
                  {article.featured_image && (
                    <div className={styles.featuredImage}>
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div className={styles.featuredContent}>
                    {article.category && (
                      <span className={styles.categoryBadge}>
                        {article.category.name}
                      </span>
                    )}
                    <h3>{article.title}</h3>
                    {article.excerpt && <p>{article.excerpt}</p>}
                    <span className={styles.readMore}>Lire l&apos;article →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Filtros por categoría */}
        {categories.length > 0 && (
          <div className={styles.categoryFilters}>
            <Link href="/blog" className={styles.categoryFilter}>
              Tous
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                className={styles.categoryFilter}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Lista de artículos */}
        {regularArticles.length > 0 ? (
          <section className={styles.articlesSection}>
            <div className={styles.articlesGrid}>
              {regularArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className={styles.articleCard}
                >
                  {article.featured_image && (
                    <div className={styles.articleImage}>
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div className={styles.articleContent}>
                    {article.category && (
                      <span className={styles.categoryBadge}>
                        {article.category.name}
                      </span>
                    )}
                    <h3>{article.title}</h3>
                    {article.excerpt && <p>{article.excerpt}</p>}
                    <div className={styles.articleMeta}>
                      {article.publish_date && (
                        <span>
                          {new Date(article.publish_date).toLocaleDateString("fr-CH", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      <span>{article.views} vues</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className={styles.emptyState}>
            <h3>Aucun article pour le moment</h3>
            <p>Revenez bientôt pour découvrir nos prochains articles !</p>
          </div>
        )}
      </div>
    </>
  );
}
