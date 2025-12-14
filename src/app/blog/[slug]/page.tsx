import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerClient } from "@/lib/supabase";
import { ArticleWithCategory } from "@/types/database";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string): Promise<ArticleWithCategory | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as any;

  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return null;
  }

  // Incrementar vistas
  await supabase
    .from("articles")
    .update({ views: (data.views || 0) + 1 })
    .eq("id", data.id);

  return data as ArticleWithCategory;
}

interface RelatedArticle {
  id: number;
  title: string;
  slug: string;
  featured_image: string | null;
}

async function getRelatedArticles(categoryId: number | null, currentId: number): Promise<RelatedArticle[]> {
  if (!categoryId) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as any;

  const { data } = await supabase
    .from("articles")
    .select("id, title, slug, featured_image")
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", currentId)
    .limit(3);

  return (data || []) as RelatedArticle[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Article non trouvé",
    };
  }

  return {
    title: article.title,
    description: article.excerpt || `Lisez ${article.title} sur Core de Femme`,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      images: article.featured_image ? [article.featured_image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.category_id, article.id);

  return (
    <>
      {/* Hero con imagen */}
      <section className={styles.articleHero}>
        {article.featured_image && (
          <div className={styles.heroImage}>
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
            <div className={styles.heroOverlay}></div>
          </div>
        )}

        <div className={styles.heroContent}>
          <Link href="/blog" className={styles.backLink}>
            <ArrowLeft size={18} />
            Retour au blog
          </Link>

          {article.category && (
            <span className={styles.categoryBadge}>
              {article.category.name}
            </span>
          )}

          <h1>{article.title}</h1>

          <div className={styles.articleMeta}>
            {article.publish_date && (
              <span>
                <Calendar size={16} />
                {new Date(article.publish_date).toLocaleDateString("fr-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            <span>
              <Eye size={16} />
              {article.views} vues
            </span>
          </div>
        </div>
      </section>

      {/* Contenido del artículo */}
      <article className={styles.articleContainer}>
        <div className={styles.articleBody}>
          {article.excerpt && (
            <p className={styles.excerpt}>{article.excerpt}</p>
          )}

          {article.content && (
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}
        </div>

        {/* Artículos relacionados */}
        {relatedArticles.length > 0 && (
          <aside className={styles.relatedSection}>
            <h3>Articles similaires</h3>
            <div className={styles.relatedGrid}>
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className={styles.relatedCard}
                >
                  {related.featured_image && (
                    <div className={styles.relatedImage}>
                      <Image
                        src={related.featured_image}
                        alt={related.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <span>{related.title}</span>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* CTA */}
        <div className={styles.articleCta}>
          <h3>Envie de passer à l&apos;action ?</h3>
          <p>Réservez votre séance découverte gratuite et commencez votre transformation.</p>
          <Link href="/seances-decouvertes" className={styles.ctaBtn}>
            Réserver gratuitement
          </Link>
        </div>
      </article>
    </>
  );
}
