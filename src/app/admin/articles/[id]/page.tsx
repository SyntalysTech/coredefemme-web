"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  ImagePlus,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "../new/page.module.css";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category_id: number | null;
  featured_image: string | null;
  status: "draft" | "published";
  is_featured: boolean;
  created_at: string;
  publish_date: string | null;
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [articleRes, categoriesRes] = await Promise.all([
        supabase.from("articles").select("*").eq("id", id).single(),
        supabase.from("categories").select("id, name, slug").order("name"),
      ]);

      if (articleRes.error) throw articleRes.error;

      const articleData = articleRes.data as Article;
      setArticle(articleData);
      setTitle(articleData.title);
      setSlug(articleData.slug);
      setExcerpt(articleData.excerpt || "");
      setContent(articleData.content || "");
      setCategoryId(articleData.category_id);
      setFeaturedImage(articleData.featured_image || "");
      setStatus(articleData.status);
      setIsFeatured(articleData.is_featured);

      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      router.push("/admin/articles");
    } finally {
      setIsLoading(false);
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);
  }

  function insertFormatting(format: string) {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newText = "";
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        newText = `<strong>${selectedText || "texte en gras"}</strong>`;
        cursorOffset = selectedText ? 0 : -9;
        break;
      case "italic":
        newText = `<em>${selectedText || "texte en italique"}</em>`;
        cursorOffset = selectedText ? 0 : -5;
        break;
      case "h2":
        newText = `\n<h2>${selectedText || "Titre"}</h2>\n`;
        cursorOffset = selectedText ? 0 : -6;
        break;
      case "h3":
        newText = `\n<h3>${selectedText || "Sous-titre"}</h3>\n`;
        cursorOffset = selectedText ? 0 : -6;
        break;
      case "ul":
        newText = `\n<ul>\n  <li>${selectedText || "Élément"}</li>\n</ul>\n`;
        cursorOffset = selectedText ? 0 : -12;
        break;
      case "ol":
        newText = `\n<ol>\n  <li>${selectedText || "Élément"}</li>\n</ol>\n`;
        cursorOffset = selectedText ? 0 : -12;
        break;
      case "quote":
        newText = `\n<blockquote>${selectedText || "Citation"}</blockquote>\n`;
        cursorOffset = selectedText ? 0 : -14;
        break;
      case "link":
        newText = `<a href="URL">${selectedText || "texte du lien"}</a>`;
        cursorOffset = selectedText ? 0 : -4;
        break;
      case "image":
        newText = `\n<figure>\n  <img src="URL_IMAGE" alt="${selectedText || "description"}" />\n  <figcaption>${selectedText || "Légende"}</figcaption>\n</figure>\n`;
        cursorOffset = 0;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  async function handleSave(saveStatus: "draft" | "published") {
    if (!title.trim()) {
      alert("Le titre est requis");
      return;
    }

    setIsSaving(true);

    try {
      const articleData = {
        title: title.trim(),
        slug: slug || generateSlug(title),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        category_id: categoryId,
        featured_image: featuredImage.trim() || null,
        status: saveStatus,
        is_featured: isFeatured,
        publish_date:
          saveStatus === "published" && !article?.publish_date
            ? new Date().toISOString()
            : article?.publish_date,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("articles")
        .update(articleData)
        .eq("id", id);

      if (error) throw error;

      setStatus(saveStatus);
      alert("Article sauvegardé avec succès !");
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.")) {
      return;
    }

    try {
      await supabase.from("articles").delete().eq("id", id);
      router.push("/admin/articles");
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Erreur lors de la suppression");
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.loadingContainer}>
        <p>Article non trouvé</p>
      </div>
    );
  }

  return (
    <div className={styles.editorPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/articles" className={styles.backBtn}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1>Modifier l&apos;article</h1>
            <span className={styles.statusIndicator}>
              {status === "draft" ? "Brouillon" : "Publié"}
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          {status === "published" && (
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              className={styles.saveDraftBtn}
            >
              <ExternalLink size={18} />
              Voir
            </Link>
          )}
          <button
            onClick={() => handleSave("draft")}
            className={styles.saveDraftBtn}
            disabled={isSaving}
          >
            <Save size={18} />
            Enregistrer
          </button>
          <button
            onClick={() => handleSave("published")}
            className={styles.publishBtn}
            disabled={isSaving}
          >
            <Eye size={18} />
            {status === "published" ? "Mettre à jour" : "Publier"}
          </button>
        </div>
      </header>

      {/* Main Editor */}
      <div className={styles.editorLayout}>
        <div className={styles.editorMain}>
          {/* Title */}
          <div className={styles.titleSection}>
            <input
              type="text"
              placeholder="Titre de l'article..."
              value={title}
              onChange={handleTitleChange}
              className={styles.titleInput}
            />
            <div className={styles.slugField}>
              <span className={styles.slugPrefix}>/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="slug-article"
                className={styles.slugInput}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className={styles.excerptSection}>
            <label>Extrait (résumé court)</label>
            <textarea
              placeholder="Un court résumé qui apparaîtra dans les listes d'articles..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={styles.excerptInput}
              rows={3}
            />
          </div>

          {/* Content Editor */}
          <div className={styles.contentSection}>
            <label>Contenu</label>

            {/* Toolbar */}
            <div className={styles.toolbar}>
              <button
                type="button"
                onClick={() => insertFormatting("bold")}
                title="Gras"
                className={styles.toolbarBtn}
              >
                <Bold size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("italic")}
                title="Italique"
                className={styles.toolbarBtn}
              >
                <Italic size={18} />
              </button>
              <div className={styles.toolbarDivider} />
              <button
                type="button"
                onClick={() => insertFormatting("h2")}
                title="Titre H2"
                className={styles.toolbarBtn}
              >
                <Heading2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("h3")}
                title="Titre H3"
                className={styles.toolbarBtn}
              >
                <Heading3 size={18} />
              </button>
              <div className={styles.toolbarDivider} />
              <button
                type="button"
                onClick={() => insertFormatting("ul")}
                title="Liste à puces"
                className={styles.toolbarBtn}
              >
                <List size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("ol")}
                title="Liste numérotée"
                className={styles.toolbarBtn}
              >
                <ListOrdered size={18} />
              </button>
              <div className={styles.toolbarDivider} />
              <button
                type="button"
                onClick={() => insertFormatting("quote")}
                title="Citation"
                className={styles.toolbarBtn}
              >
                <Quote size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("link")}
                title="Lien"
                className={styles.toolbarBtn}
              >
                <LinkIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("image")}
                title="Image"
                className={styles.toolbarBtn}
              >
                <ImagePlus size={18} />
              </button>
            </div>

            <textarea
              id="content-editor"
              placeholder="Écrivez votre article en HTML..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.contentEditor}
              rows={20}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className={styles.editorSidebar}>
          {/* Category */}
          <div className={styles.sidebarCard}>
            <h3>Catégorie</h3>
            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              className={styles.selectInput}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div className={styles.sidebarCard}>
            <h3>Image à la une</h3>
            <input
              type="text"
              placeholder="URL de l'image..."
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              className={styles.textInput}
            />
            {featuredImage && (
              <div className={styles.imagePreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredImage} alt="Preview" />
              </div>
            )}
          </div>

          {/* Options */}
          <div className={styles.sidebarCard}>
            <h3>Options</h3>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Article mis en avant
            </label>
          </div>

          {/* Info */}
          <div className={styles.sidebarCard}>
            <h3>Informations</h3>
            <p className={styles.previewHint}>
              Créé le : {new Date(article.created_at).toLocaleDateString("fr-FR")}
            </p>
            {article.publish_date && (
              <p className={styles.previewHint}>
                Publié le : {new Date(article.publish_date).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>

          {/* Delete */}
          <div className={styles.sidebarCard}>
            <button onClick={handleDelete} className={styles.deleteBtn}>
              <Trash2 size={18} />
              Supprimer l&apos;article
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
