import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Check, Clock, MapPin, Users } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Séances Découverte Gratuites",
  description: "Réservez vos 3 séances découverte gratuites. Testez Core de Maman ou Sculpt Pilates à Bressaucourt, sans engagement.",
};

const seancesData = [
  {
    id: "maman",
    title: "Core de Maman",
    subtitle: "Post-partum & Reconnexion",
    schedule: "Mardi matin",
    time: "09h30 - 10h30",
    dates: ["11 novembre 2025", "18 novembre 2025", "25 novembre 2025"],
    description: "Programme doux et progressif pour les mamans. Rééducation du périnée, renforcement du core, respiration consciente.",
    features: [
      "Adapté à tous les niveaux",
      "Pour mamans (récemment ou depuis plusieurs années)",
      "Exercices doux et respectueux du corps",
      "Groupe bienveillant et convivial",
    ],
    href: "/core-de-maman",
    color: "#A9806A",
  },
  {
    id: "sculpt",
    title: "Sculpt Pilates",
    subtitle: "Renforcement & Énergie",
    schedule: "Jeudi soir",
    time: "18h00 - 19h00",
    dates: ["13 novembre 2025", "20 novembre 2025", "27 novembre 2025"],
    description: "Cours dynamique pour tonifier, sculpter et retrouver de l'énergie. Accessible à toutes, débutantes comme sportives.",
    features: [
      "Intensité adaptable selon ton niveau",
      "Renforcement musculaire global",
      "Pilates + renforcement + cardio léger",
      "Ambiance dynamique et bienveillante",
    ],
    href: "/sculpt-pilates",
    color: "#8B7355",
  },
];

export default function SeancesDecouvertesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Offre Limitée</div>
        <h1 className={styles.heroTitle}>3 Séances Découverte Gratuites</h1>
        <p className={styles.heroSubtitle}>
          Testez nos cours sans engagement et découvrez la méthode Core de Femme. Places limitées pour novembre 2025.
        </p>
      </section>

      {/* Séances Grid */}
      <section className={styles.seancesSection}>
        <div className={styles.seancesGrid}>
          {seancesData.map((seance) => (
            <div key={seance.id} className={styles.seanceCard}>
              <div className={styles.seanceHeader} style={{ backgroundColor: seance.color }}>
                <h2>{seance.title}</h2>
                <p>{seance.subtitle}</p>
              </div>

              <div className={styles.seanceBody}>
                <div className={styles.scheduleInfo}>
                  <div className={styles.scheduleItem}>
                    <Calendar size={20} />
                    <span>{seance.schedule}</span>
                  </div>
                  <div className={styles.scheduleItem}>
                    <Clock size={20} />
                    <span>{seance.time}</span>
                  </div>
                </div>

                <p className={styles.seanceDesc}>{seance.description}</p>

                <div className={styles.datesList}>
                  <h4>Dates des séances gratuites :</h4>
                  {seance.dates.map((date, index) => (
                    <div key={index} className={styles.dateItem}>
                      <Check size={16} />
                      <span>{date}</span>
                    </div>
                  ))}
                </div>

                <ul className={styles.featuresList}>
                  {seance.features.map((feature, index) => (
                    <li key={index}>
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className={styles.seanceActions}>
                  <a
                    href={`mailto:contact@coredefemme.ch?subject=Réservation Séances Découverte ${seance.title}&body=Bonjour,%0D%0A%0D%0AJe souhaite réserver mes 3 séances découverte gratuites pour ${seance.title}.%0D%0A%0D%0AMerci !`}
                    className={styles.reserveBtn}
                  >
                    Réserver mes 3 séances
                  </a>
                  <Link href={seance.href} className={styles.moreInfoBtn}>
                    En savoir plus
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className={styles.infoSection}>
        <h2>Informations Pratiques</h2>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <MapPin size={32} />
            <h3>Lieu</h3>
            <p>
              Domaine du Pré sur l&apos;Eau<br />
              Rue de la Maltière 82H<br />
              2904 Bressaucourt, Jura
            </p>
          </div>

          <div className={styles.infoCard}>
            <Users size={32} />
            <h3>Places limitées</h3>
            <p>
              Pour garantir un suivi personnalisé, les groupes sont limités à 8 personnes maximum.
            </p>
          </div>

          <div className={styles.infoCard}>
            <Check size={32} />
            <h3>À apporter</h3>
            <p>
              Votre tapis de yoga/Pilates, une gourde et une tenue confortable. Le reste du matériel est fourni.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Mini */}
      <section className={styles.faqMini}>
        <h2>Questions sur les séances découverte</h2>

        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h4>C&apos;est vraiment gratuit ?</h4>
            <p>Oui, les 3 séances découverte sont entièrement gratuites et sans engagement. C&apos;est l&apos;occasion idéale de découvrir la méthode.</p>
          </div>

          <div className={styles.faqItem}>
            <h4>Dois-je m&apos;inscrire aux 3 séances ?</h4>
            <p>Nous vous encourageons à venir aux 3 séances pour bien ressentir les bienfaits, mais ce n&apos;est pas obligatoire.</p>
          </div>

          <div className={styles.faqItem}>
            <h4>Puis-je tester les deux cours ?</h4>
            <p>Bien sûr ! Vous pouvez vous inscrire aux séances découverte des deux cours si vous le souhaitez.</p>
          </div>

          <div className={styles.faqItem}>
            <h4>Comment réserver ?</h4>
            <p>Cliquez sur "Réserver" et envoyez-moi un email. Je vous confirmerai votre inscription rapidement.</p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={styles.ctaFinal}>
        <h2>Prête à essayer ?</h2>
        <p>Réservez maintenant vos séances gratuites et offrez-vous ce moment de reconnexion.</p>
        <a
          href="mailto:contact@coredefemme.ch?subject=Réservation Séances Découverte&body=Bonjour,%0D%0A%0D%0AJe souhaite réserver mes séances découverte gratuites.%0D%0A%0D%0ACours souhaité : [Core de Maman / Sculpt Pilates / Les deux]%0D%0A%0D%0AMerci !"
          className={styles.ctaBtn}
        >
          Réserver par email
        </a>
      </section>
    </>
  );
}
