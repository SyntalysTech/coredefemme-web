"use client";

import { useState } from "react";
import { MapPin, Mail, Phone, Instagram, Facebook, MessageCircle, Send } from "lucide-react";
import styles from "./page.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    phone: "",
    subject: "",
    withBaby: "",
    courseDate: "",
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
        prenom: "",
        nom: "",
        email: "",
        phone: "",
        subject: "",
        withBaby: "",
        courseDate: "",
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
                Prénom <span className="required">*</span>
              </label>
              <input
                type="text"
                name="prenom"
                className="form-input"
                placeholder="Votre prénom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Nom <span className="required">*</span>
              </label>
              <input
                type="text"
                name="nom"
                className="form-input"
                placeholder="Votre nom"
                value={formData.nom}
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
                <option value="Séance d'essai gratuite Core de Maman">Séance d'essai gratuite Core de Maman</option>
                <option value="Pack 6 séances Core de Maman">Pack 6 séances Core de Maman</option>
                <option value="Cours privé à domicile">Cours privé à domicile</option>
                <option value="Cours Sculpt Pilates">Cours Sculpt Pilates (bientôt disponible)</option>
                <option value="Informations générales">Informations générales</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Je viens avec mon bébé <span className="required">*</span>
              </label>
              <select
                name="withBaby"
                className="form-select"
                value={formData.withBaby}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez</option>
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Date du cours désiré
              </label>
              <input
                type="date"
                name="courseDate"
                className="form-input"
                value={formData.courseDate}
                onChange={handleChange}
              />
              <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                Core de Maman : Mercredi 09h30 - 10h30 (à partir du 14/01/2026)
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">
                Votre message
              </label>
              <textarea
                name="message"
                className="form-textarea"
                placeholder="Parlez-moi de votre besoin, vos questions..."
                value={formData.message}
                onChange={handleChange}
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
                Crossfit la Vouivre, Rue Pierre-Péquignat 7,<br />
                1er étage, 2900 Porrentruy
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
          <h2>Crossfit la Vouivre, Rue Pierre-Péquignat 7, 1er étage, 2900 Porrentruy</h2>
          <div className={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2698.5!2d7.0!3d47.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDI0JzAwLjAiTiA3wrAwMCcwMC4wIkU!5e0!3m2!1sfr!2sch!4v1234567890"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation Core de Femme - Crossfit la Vouivre Porrentruy"
            />
          </div>
        </div>
      </div>
    </>
  );
}
