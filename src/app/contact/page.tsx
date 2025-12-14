"use client";

import { useState } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Mail, Phone, Instagram, Facebook, MessageCircle, Send } from "lucide-react";
import styles from "./page.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulación de envío - en producción conectar con Supabase o API
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className={styles.contactHero}>
        <h1>Contactez-moi</h1>
        <p>Une question ? Besoin d&apos;informations ? Je suis là pour t&apos;accompagner.</p>
      </section>

      {/* Main Content */}
      <div className={styles.contactContainer}>
        {/* Form Card */}
        <div className={styles.contactFormCard}>
          <h2>Envoyez-moi un message</h2>
          <p className={styles.subtitle}>Je vous répondrai dans les 24-48h</p>

          {status === "success" && (
            <div className="alert alert-success">
              Merci pour votre message ! Je vous répondrai dans les plus brefs délais.
            </div>
          )}

          {status === "error" && (
            <div className="alert alert-error">
              Une erreur est survenue. Veuillez réessayer.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Votre nom <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Prénom et nom"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+41 XX XXX XX XX"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Sujet <span className="required">*</span>
              </label>
              <select
                name="subject"
                className="form-select"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez un sujet</option>
                <option value="Cours Core de Maman">Cours Core de Maman</option>
                <option value="Cours Sculpt Pilates">Cours Sculpt Pilates</option>
                <option value="Séances découverte">Séances découverte</option>
                <option value="Informations générales">Informations générales</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Votre message <span className="required">*</span>
              </label>
              <textarea
                name="message"
                className="form-textarea"
                placeholder="Parlez-moi de votre besoin, vos questions..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isSubmitting}
            >
              <Send size={20} />
              {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className={styles.contactInfoCard}>
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <MapPin size={28} />
            </div>
            <div className={styles.infoContent}>
              <h3>Adresse</h3>
              <p>
                Domaine du Pré sur l&apos;Eau<br />
                Rue de la Maltière 82H<br />
                2904 Bressaucourt, Jura<br />
                Suisse
              </p>
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <Mail size={28} />
            </div>
            <div className={styles.infoContent}>
              <h3>Email</h3>
              <p>
                <a href="mailto:contact@coredefemme.ch">contact@coredefemme.ch</a>
              </p>
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <Phone size={28} />
            </div>
            <div className={styles.infoContent}>
              <h3>Téléphone</h3>
              <p>
                <a href="tel:+41000000000">+41 XX XXX XX XX</a><br />
                <small>Lundi - Samedi: 9h - 19h</small>
              </p>
            </div>
          </div>

          <div className={styles.socialLinks}>
            <h3>Suivez-moi</h3>
            <p>Rejoignez la communauté Core de Femme</p>
            <div className={styles.socialButtons}>
              <a
                href="https://www.instagram.com/core_de_femme"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                title="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                title="Facebook"
              >
                <Facebook size={24} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                title="WhatsApp"
              >
                <MessageCircle size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className={styles.mapSection}>
        <div className={styles.mapCard}>
          <h2>Où nous trouver</h2>
          <p className={styles.subtitle}>Domaine du Pré sur l&apos;Eau, Bressaucourt</p>
          <div className={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2698.5!2d7.0!3d47.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDI0JzAwLjAiTiA3wrAwMCcwMC4wIkU!5e0!3m2!1sfr!2sch!4v1234567890"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation Core de Femme"
            />
          </div>
        </div>
      </div>
    </>
  );
}
