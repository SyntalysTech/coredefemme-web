"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Mail, Instagram, Send, Check, Loader2 } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import styles from "./page.module.css";

function ContactContent() {
  const searchParams = useSearchParams();
  const subjectFromUrl = searchParams.get("subject") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: subjectFromUrl,
    message: "",
  });

  // Update subject when URL changes
  useEffect(() => {
    if (subjectFromUrl) {
      setFormData(prev => ({ ...prev, subject: subjectFromUrl }));
    }
  }, [subjectFromUrl]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Une erreur est survenue");
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

          {status === "success" ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <Check size={32} />
              </div>
              <h3>Message envoyé !</h3>
              <p>Merci pour votre message. Je vous répondrai dans les plus brefs délais.</p>
              <button
                onClick={() => setStatus("idle")}
                className={styles.btnReset}
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {status === "error" && (
                <div className={styles.errorMessage}>
                  {errorMessage || "Une erreur est survenue. Veuillez réessayer."}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  Nom complet <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Votre nom complet"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={status === "loading"}
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
                  disabled={status === "loading"}
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
                  disabled={status === "loading"}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sujet</label>
                <select
                  name="subject"
                  className="form-select"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={status === "loading"}
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="Réservation Core de Maman">Réservation Core de Maman</option>
                  <option value="Réservation Sculpt Pilates">Réservation Sculpt Pilates</option>
                  <option value="Cours privé à domicile">Cours privé à domicile</option>
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
                  disabled={status === "loading"}
                  rows={5}
                />
              </div>

              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={20} className={styles.spinner} />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Envoyer le message
                  </>
                )}
              </button>
            </form>
          )}
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
              <BsWhatsapp size={28} />
            </div>
            <div className={styles.infoContent}>
              <h3>WhatsApp</h3>
              <p>
                <a href="https://wa.me/41767059777" target="_blank" rel="noopener noreferrer">+41 76 705 97 77</a><br />
                <small>Lundi - Samedi : 9h - 19h</small>
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
                href="https://wa.me/41767059777"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                title="WhatsApp"
              >
                <BsWhatsapp size={22} />
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

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} className={styles.spinner} />
      </div>
    }>
      <ContactContent />
    </Suspense>
  );
}
