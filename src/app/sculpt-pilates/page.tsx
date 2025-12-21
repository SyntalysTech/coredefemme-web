import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Check, Zap, Clock, Dumbbell, Droplets } from "lucide-react";
import FAQ from "@/components/FAQ";
import styles from "../core-de-maman/page.module.css";

export const metadata: Metadata = {
  title: "Sculpt Pilates - Renforcement Féminin",
  description: "Cours de Sculpt Pilates à Bressaucourt. Renforcement musculaire global, tonification, énergie et vitalité. Accessible à toutes.",
};

const benefices = [
  {
    icon: "zap",
    title: "Renforcement musculaire global",
    description: "Travaille tout le corps en profondeur avec des exercices ciblés et des enchaînements fluides.",
  },
  {
    icon: "clock",
    title: "Tonification et sculpture",
    description: "Affine ta silhouette, sculpte tes muscles et retrouve un corps ferme et harmonieux.",
  },
  {
    icon: "shield",
    title: "Core strength",
    description: "Renforce ta sangle abdominale profonde, améliore ta stabilité et ton équilibre.",
  },
  {
    icon: "check",
    title: "Posture et alignement",
    description: "Corrige les déséquilibres posturaux et retrouve un alignement optimal du corps.",
  },
  {
    icon: "layers",
    title: "Énergie et vitalité",
    description: "Gagne en énergie, dynamisme et confiance grâce au mouvement conscient et puissant.",
  },
  {
    icon: "tool",
    title: "Mouvement conscient",
    description: "Chaque exercice intègre respiration, intention et conscience corporelle pour un résultat durable.",
  },
];

const faqItems = [
  {
    question: "Je n'ai jamais fait de Pilates, puis-je suivre ce cours ?",
    answer: "Oui, absolument ! Sculpt Pilates accueille tous les niveaux. Les exercices sont adaptables et je propose toujours des variantes pour les débutantes. Tu avanceras à ton rythme dans une atmosphère bienveillante.",
  },
  {
    question: "Est-ce un cours intense ?",
    answer: "Le cours est dynamique et tonifiant, mais toujours respectueux de ton corps. L'intensité est modulable selon ton niveau. Tu travailleras en profondeur, mais toujours avec conscience et contrôle, jamais dans la force brute.",
  },
  {
    question: "Quel materiel faut il apporter ?",
    answer: "Tout le matériel (bandes élastiques, poids légers ect) est fourni sur place. Viens avec une tenue confortable dans laquelle tu peux bouger librement.",
  },
  {
    question: "Quelle différence avec du fitness ou de la musculation ?",
    answer: "Sculpt Pilates privilégie la qualité du mouvement à la quantité. On travaille avec conscience, respiration et alignement. L'objectif n'est pas de soulever lourd, mais de créer une force fonctionnelle, équilibrée et durable, ancrée dans le centre (core).",
  },
  {
    question: "Peut-on combiner Core de Maman et Sculpt Pilates ?",
    answer: "Oui, c'est même complémentaire ! Si tu as suivi Core de Maman et que tu te sens prête pour plus d'intensité, Sculpt Pilates est une excellente suite. N'hésite pas à me contacter pour discuter de ton parcours.",
  },
  {
    question: "Y a-t-il des contre-indications ?",
    answer: "Si tu as des douleurs chroniques, des blessures récentes ou des problèmes de santé particuliers, je te recommande de consulter ton médecin avant de commencer. Ensuite, contacte-moi pour qu'on adapte les exercices à ta situation.",
  },
];

export default function SculptPilatesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image
            src="/images/pilates-matwork.png"
            alt="Sculpt Pilates - Renforcement Féminin Bressaucourt"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          <div className={styles.heroOverlay}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Renforcement</div>
          <h1 className={styles.heroTitle}>Sculpt Pilates</h1>
          <p className={styles.heroSubtitle}>
            Bouge, renforce ton core et redécouvre la force de ton corps dans un cours à ton rythme.
          </p>

          <div className={styles.heroCtaContainer}>
            <Link href="/contact" className={styles.heroCtaPrimary}>
              <Calendar size={20} />
              Réserver une séance découverte
            </Link>
            <Link href="#tarifs" className={styles.heroCtaSecondary}>
              Horaire et tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className={styles.introSection}>
        <div className={styles.introGrid}>
          <div className={styles.introImageWrapper}>
            <Image
              src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80"
              alt="Cours Sculpt Pilates Bressaucourt"
              width={500}
              height={600}
              className={styles.introImage}
            />
          </div>

          <div className={styles.introContent}>
            <h2>Bouge, renforce ton core et redécouvre la force de ton corps</h2>
            <p>Accessible à toutes, ce cours dynamique te permet de progresser pas à pas, que tu sois débutante ou déjà sportive.</p>
            <p>Tu veux tonifier ton corps, retrouver de l&apos;énergie et te sentir plus confiante ?</p>
            <p><strong>Le Sculpt Pilates est fait pour toi</strong> — pour te challenger en douceur, célébrer chaque progrès et te reconnecter à ta puissance intérieure.</p>
          </div>
        </div>
      </section>

      {/* Bénéfices Section */}
      <section className={styles.beneficesSection}>
        <div className={styles.sectionHeader}>
          <h2>Objectifs du cours</h2>
          <p>Renforcement musculaire global, tonification du core, des bras, des jambes, amélioration de la posture et de la mobilité</p>
        </div>

        <div className={styles.beneficesGrid}>
          {benefices.map((benefice, index) => (
            <div key={index} className={styles.beneficeItem}>
              <div className={styles.beneficeIcon}>
                <Zap size={32} />
              </div>
              <h3>{benefice.title}</h3>
              <p>{benefice.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pour Qui Section */}
      <section className={styles.pourquiSection}>
        <div className={styles.pourquiGrid} style={{ maxWidth: "1000px", margin: "0 auto", alignItems: "center" }}>
          <div className={styles.pourquiContent}>
            <h2>Pour qui</h2>
            <ul className="check-list">
              <li>Accessible à toutes, débutantes comme sportives</li>
              <li>Celles qui veulent se tonifier, gagner en force et en énergie</li>
            </ul>

            <h2 style={{ marginTop: "2.5rem" }}>Comment se déroule le cours</h2>
            <ul className="check-list">
              <li>Exercices dynamiques mais progressifs</li>
              <li>Possibilité d&apos;adapter l&apos;intensité selon ton niveau</li>
              <li>Mélange Pilates + renforcement + cardio léger</li>
            </ul>

            <h2 style={{ marginTop: "2.5rem" }}>Infos pratiques</h2>
            <ul className="check-list">
              <li>Durée : 60min</li>
              <li>Tout est fourni sur place</li>
              <li>Une gourde et un petit linge recommandé</li>
            </ul>
          </div>

          <div style={{ borderRadius: "24px", overflow: "hidden", boxShadow: "0 30px 80px rgba(169, 128, 106, 0.2)" }}>
            <Image
              src="/images/sculp-pilates-pour-qui.jpg"
              alt="Groupe Sculpt Pilates Jura"
              width={500}
              height={350}
              style={{ objectFit: "cover", display: "block", width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </section>

      {/* Tarifs Section */}
      <section className={styles.tarifsSection} id="tarifs">
        <div className={styles.sectionHeader}>
          <h2>Horaire et Tarifs</h2>
          <p>Cours bientôt disponible</p>
        </div>

        <div className={styles.tarifsGrid}>
          <div className={styles.tarifCard}>
            <h3>Cours bientôt disponible</h3>
            <p className={styles.tarifSchedule}>
              Les cours Sculpt Pilates arrivent bientôt !
            </p>
            <ul className={styles.tarifFeatures}>
              <li><Check size={16} /> Découvrir la méthode</li>
              <li><Check size={16} /> Sans engagement</li>
              <li><Check size={16} /> Tous niveaux acceptés</li>
            </ul>
            <Link href="/contact" className={styles.tarifCta}>
              Me contacter pour plus d'infos
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <h2>Questions fréquentes</h2>
          <p>Toutes les réponses à tes questions sur Sculpt Pilates.</p>
        </div>
        <FAQ items={faqItems} />
      </section>

      {/* CTA Final */}
      <section className={styles.ctaFinal}>
        <h2>Prête à sculpter ton corps en conscience ?</h2>
        <p>
          Les cours arrivent bientôt
        </p>
        <div className={styles.ctaFinalButtons}>
          <Link href="/contact" className={styles.heroCtaPrimary}>
            <Calendar size={20} />
            Me contacter
          </Link>
          <Link href="/contact" className={styles.heroCtaSecondary}>
            Poser une question
          </Link>
        </div>
      </section>
    </>
  );
}
