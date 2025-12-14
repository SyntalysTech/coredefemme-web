"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const slug = generateSlug(formData.name);

      if (editingId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from("categories")
          .update({
            name: formData.name,
            slug,
            description: formData.description || null,
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("categories").insert({
          name: formData.name,
          slug,
          description: formData.description || null,
        });

        if (error) throw error;
      }

      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCategory(id: number) {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cette catégorie ? Les articles associés ne seront pas supprimés mais n'auront plus de catégorie."
      )
    )
      return;

    try {
      await supabase.from("categories").delete().eq("id", id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  }

  return (
    <div className={styles.categoriesPage}>
      <header className={styles.header}>
        <div>
          <h1>Catégories</h1>
          <p>Organisez vos articles par catégorie</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className={styles.newBtn}
          >
            <Plus size={20} />
            Nouvelle catégorie
          </button>
        )}
      </header>

      {/* Form */}
      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>
              {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </h2>
            <button onClick={resetForm} className={styles.closeBtn}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Nom de la catégorie *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Bien-être"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description (optionnel)</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brève description de la catégorie..."
                rows={3}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={resetForm}
                className={styles.cancelBtn}
              >
                Annuler
              </button>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={isSaving}
              >
                {isSaving ? (
                  "Enregistrement..."
                ) : (
                  <>
                    <Check size={18} />
                    {editingId ? "Mettre à jour" : "Créer"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : categories.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Aucune catégorie pour le moment</p>
          <button
            onClick={() => setShowForm(true)}
            className={styles.emptyBtn}
          >
            Créer votre première catégorie
          </button>
        </div>
      ) : (
        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <div key={category.id} className={styles.categoryCard}>
              <div className={styles.categoryInfo}>
                <h3>{category.name}</h3>
                {category.description && <p>{category.description}</p>}
                <span className={styles.slug}>/{category.slug}</span>
              </div>

              <div className={styles.categoryActions}>
                <button
                  onClick={() => startEdit(category)}
                  className={styles.editBtn}
                  title="Modifier"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className={styles.deleteBtn}
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
