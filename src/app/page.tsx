import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle, ChevronDown, Sparkles, Heart, Shield, Users, ArrowRight } from "lucide-react";
import WelcomeModal from "@/components/WelcomeModal";
import CoursSplit from "@/components/CoursSplit";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <WelcomeModal />

      {/* Hero Section - Full Screen avec image de fond */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="/images/hero-pilates-bg.jpg"
            alt="Pilates Core de Femme"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center 30%" }}
            quality={90}
          />
          <div className={styles.heroOverlay}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={16} />
            1 séance découverte offerte
          </div>

          <h1 className={styles.heroTitle}>
            Reconnectez-vous<br />à votre corps
          </h1>

          <p className={styles.heroSubtitle}>
            Rééducation post-partum et sculpt Pilates à Porrentruy
          </p>

          <div className={styles.heroCtaContainer}>
            <Link href="/reserver" className={`${styles.heroCta} ${styles.heroCtaPrimary}`}>
              Réserver ma séance découverte
            </Link>
            <Link href="#cours" className={`${styles.heroCta} ${styles.heroCtaSecondary}`}>
              Découvrir les cours
            </Link>
          </div>
        </div>

        <div className={styles.scrollIndicator}>
          <ChevronDown size={32} />
        </div>
      </section>

      {/* Section Valeurs - Design épuré */}
      <section className={styles.valuesSection}>
        <div className={styles.valuesContainer}>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>
              <Heart size={28} />
            </div>
            <div className={styles.valueText}>
              <h3>Bienveillance</h3>
              <p>Un accompagnement adapté à votre rythme</p>
            </div>
          </div>
          <div className={styles.valueDivider}></div>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>
              <Shield size={28} />
            </div>
            <div className={styles.valueText}>
              <h3>Expertise</h3>
              <p>Méthode APOR & Pilates De Gasquet</p>
            </div>
          </div>
          <div className={styles.valueDivider}></div>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>
              <Users size={28} />
            </div>
            <div className={styles.valueText}>
              <h3>Petits groupes</h3>
              <p>Maximum 8 personnes par séances</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cours Section - Split Interactif */}
      <CoursSplit />

      {/* Section Témoignage / Citation */}
      <section className={styles.quoteSection}>
        <div className={styles.quoteBackground}>
          <Image
            src="/images/pilates-stretch.jpg"
            alt="Pilates étirement"
            fill
            style={{ objectFit: "cover" }}
          />
          <div className={styles.quoteOverlay}></div>
        </div>
        <div className={styles.quoteContent}>
          <blockquote>
            &ldquo;Le Pilates n&apos;est pas qu&apos;une pratique physique.
            C&apos;est un moment pour soi, une reconnexion au corps et à l&apos;esprit.&rdquo;
          </blockquote>
          <cite>— Chloé Manzambi</cite>
          <Link href="/a-propos" className={styles.quoteLink}>
            Découvrir mon parcours
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Contact CTA Section - Design moderne */}
      <section className={styles.contactCtaSection}>
        <div className={styles.contactCtaContent}>
          <h2 className={styles.contactCtaTitle}>Prête à commencer ?</h2>
          <p className={styles.contactCtaText}>
            Réservez votre séance découverte offerte et faites le premier pas
            vers votre bien-être.
          </p>

          <div className={styles.contactCtaButtons}>
            <Link href="/contact" className={`${styles.contactBtn} ${styles.contactBtnPrimary}`}>
              <Mail size={20} />
              Me Contacter
            </Link>
            <a href="https://wa.me/41767059777" target="_blank" rel="noopener noreferrer" className={`${styles.contactBtn} ${styles.contactBtnSecondary}`}>
              <MessageCircle size={20} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
