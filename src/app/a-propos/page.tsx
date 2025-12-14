import Image from "next/image";
import Link from "next/link";
import { Award, Heart, Users, Target, CheckCircle, Sparkles } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
  title: "À Propos - Core de Femme | Chloé Manzambi",
  description:
    "Découvrez mon parcours : ancienne athlète professionnelle, maman de trois enfants, et passionnée par l'accompagnement des femmes à travers le Pilates.",
};

export default function APropos() {
  return (
    <>
      {/* Hero Section avec image de fond */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="/images/wellness-relax.jpg"
            alt="Bien-être et relaxation"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>
            <Sparkles size={16} />
            Mon Histoire
          </span>
          <h1 className={styles.heroTitle}>
            Je suis Chloé
          </h1>
          <p className={styles.heroSubtitle}>
            Ancienne athlète, maman de trois enfants, passionnée par le mouvement et le bien-être féminin.
          </p>
        </div>
      </section>

      {/* Section Histoire - Layout moderne */}
      <section className={styles.storySection}>
        <div className={styles.storyContainer}>
          <div className={styles.storyImageCol}>
            <div className={styles.storyImageWrapper}>
              <Image
                src="/images/chloe-apropos-core-de-femme.png"
                alt="Chloé Manzambi - Fondatrice Core de Femme"
                width={500}
                height={600}
                className={styles.storyImage}
              />
              <div className={styles.storyImageDecor}></div>
            </div>
          </div>

          <div className={styles.storyContent}>
            <h2>Mon parcours</h2>

            <p className={styles.storyLead}>
              Depuis toujours, je suis fascinée par le corps humain — sa force, sa souplesse, sa capacité d&apos;adaptation.
            </p>

            <p>
              Mon parcours sportif de haut niveau m&apos;a appris la rigueur, la discipline et la persévérance. Mais c&apos;est la maternité qui m&apos;a fait redécouvrir le corps autrement : un corps à écouter, à comprendre et à accompagner avec bienveillance.
            </p>

            <p>
              Après ma formation comme coach sportive, je me suis spécialisée dans la <strong>méthode APOR</strong> et le <strong>Pilates De Gasquet</strong>, des approches centrées sur la respiration, la posture et le respect du corps.
            </p>

            <p>
              Aujourd&apos;hui, <strong>Core de Femme</strong> est l&apos;aboutissement de ce parcours : un espace où le mouvement devient reconnexion à soi.
            </p>

            <p className={styles.signature}>— Chloé</p>
          </div>
        </div>
      </section>

      {/* Section Chiffres clés */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>15+</span>
            <span className={styles.statLabel}>années de sport</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>3</span>
            <span className={styles.statLabel}>certifications</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>3</span>
            <span className={styles.statLabel}>enfants</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statLabel}>passion</span>
          </div>
        </div>
      </section>

      {/* Section Formations - Design épuré */}
      <section className={styles.formationsSection}>
        <div className={styles.formationsContainer}>
          <div className={styles.formationsHeader}>
            <h2>Mes formations</h2>
            <p>Un parcours dédié au mouvement et au bien-être féminin</p>
          </div>

          <div className={styles.formationsGrid}>
            <div className={styles.formationItem}>
              <div className={styles.formationIcon}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.formationText}>
                <h3>Méthode APOR</h3>
                <p>Abdominaux et Périnée - Approche De Gasquet pour la rééducation post-partum</p>
              </div>
            </div>

            <div className={styles.formationItem}>
              <div className={styles.formationIcon}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.formationText}>
                <h3>Pilates De Gasquet</h3>
                <p>Pilates adapté aux femmes, respectueux de la physiologie féminine</p>
              </div>
            </div>

            <div className={styles.formationItem}>
              <div className={styles.formationIcon}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.formationText}>
                <h3>Coach Sportive Certifiée</h3>
                <p>Formation complète en coaching sportif et préparation physique</p>
              </div>
            </div>

            <div className={styles.formationItem}>
              <div className={styles.formationIcon}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.formationText}>
                <h3>Athlète Professionnelle</h3>
                <p>Expérience de haut niveau en compétition sportive</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Valeurs - Design horizontal */}
      <section className={styles.valuesSection}>
        <div className={styles.valuesHeader}>
          <h2>Mes valeurs</h2>
        </div>

        <div className={styles.valuesGrid}>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>
              <Heart size={32} />
            </div>
            <h3>Bienveillance</h3>
            <p>Chaque femme est unique. J&apos;accompagne sans jugement, avec écoute et respect du rythme de chacune.</p>
          </div>

          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>
              <Target size={32} />
            </div>
            <h3>Précision</h3>
            <p>La qualité du mouvement prime sur la quantité. Chaque exercice est adapté et exécuté avec conscience.</p>
          </div>

          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>
              <Users size={32} />
            </div>
            <h3>Communauté</h3>
            <p>Core de Femme est plus qu&apos;un studio : c&apos;est un espace de partage entre femmes qui se soutiennent.</p>
          </div>

          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>
              <Award size={32} />
            </div>
            <h3>Excellence</h3>
            <p>Formée aux meilleures méthodes, je me forme continuellement pour offrir un accompagnement de qualité.</p>
          </div>
        </div>
      </section>

      {/* Section Citation */}
      <section className={styles.quoteSection}>
        <div className={styles.quoteBackground}>
          <Image
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80"
            alt="Pilates - Mouvement conscient"
            fill
            style={{ objectFit: "cover" }}
          />
          <div className={styles.quoteOverlay}></div>
        </div>
        <div className={styles.quoteContent}>
          <blockquote>
            &ldquo;Le Pilates n&apos;est pas qu&apos;une pratique physique. C&apos;est un moment pour soi, une reconnexion au corps et à l&apos;esprit. Chaque séance est une occasion de se recentrer, de respirer et de retrouver sa force intérieure.&rdquo;
          </blockquote>
          <cite>— Chloé Manzambi</cite>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Prête à commencer ?</h2>
          <p>
            Rejoignez-moi pour une séance découverte gratuite et découvrez les bienfaits du Pilates adapté aux femmes.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/seances-decouvertes" className={styles.ctaBtnPrimary}>
              Réserver une séance découverte
            </Link>
            <Link href="/contact" className={styles.ctaBtnSecondary}>
              Me contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
