import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Check, Clock, MapPin } from "lucide-react";
import FAQ from "@/components/FAQ";
import Countdown from "@/components/Countdown";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cours à domicile - Pilates chez vous",
  description: "Séances de Pilates privées à domicile dans le Jura. Je viens directement chez vous pour des séances personnalisées, adaptées à votre rythme. Bébé bienvenu.",
};

const avantages = [
  {
    icon: "home",
    title: "Confort de votre maison",
    description: "Pas besoin de vous déplacer. Je viens directement chez vous avec tout le matériel nécessaire.",
  },
  {
    icon: "baby",
    title: "Bébé à côté de vous",
    description: "Votre bébé peut rester près de vous pendant la séance. On s'adapte à son rythme.",
  },
  {
    icon: "clock",
    title: "Horaires flexibles",
    description: "Nous convenons ensemble du moment qui vous convient le mieux, selon votre emploi du temps.",
  },
  {
    icon: "user",
    title: "Séances personnalisées",
    description: "Un programme sur mesure, adapté à vos besoins spécifiques et à vos objectifs.",
  },
  {
    icon: "heart",
    title: "Attention individuelle",
    description: "Toute mon attention est portée sur vous, pour une progression optimale et sécurisée.",
  },
  {
    icon: "star",
    title: "Progression à votre rythme",
    description: "On avance ensemble, sans pression, en respectant votre corps et votre énergie du moment.",
  },
];

const faqItems = [
  {
    question: "Où intervenez-vous pour les cours à domicile ?",
    answer: "J'interviens dans le Jura, Suisse. Contactez-moi pour vérifier si votre localité est dans ma zone d'intervention.",
  },
  {
    question: "Quel matériel dois-je préparer ?",
    answer: "Rien du tout ! J'apporte tout le matériel nécessaire : tapis, accessoires, etc. Vous n'avez qu'à prévoir une tenue confortable et une gourde.",
  },
  {
    question: "Combien de temps dure une séance ?",
    answer: "Une séance dure environ 45 minutes. On prend le temps nécessaire pour bien travailler et s'adapter à vos besoins.",
  },
  {
    question: "Puis-je inviter une amie à participer ?",
    answer: "Oui, c'est possible ! Les séances peuvent accueillir jusqu'à 2 personnes. C'est une belle façon de partager ce moment.",
  },
  {
    question: "Mon bébé peut-il être présent pendant la séance ?",
    answer: "Absolument ! Votre bébé est le bienvenu. On s'adapte à ses besoins et on peut faire des pauses si nécessaire.",
  },
  {
    question: "Comment réserver une séance ?",
    answer: <>Contactez-moi par WhatsApp ou via la <Link href="/contact">page contact</Link>. Nous conviendrons ensemble d&apos;un créneau qui vous convient.</>,
  },
];

export default function CoursADomicilePage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image
            src="/images/madre-con-su-hija-practicar-yoga-en-casa.jpg"
            alt="Cours à domicile - Pilates chez vous"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          <div className={styles.heroOverlay}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Séances privées</div>
          <h1 className={styles.heroTitle}>Cours à domicile</h1>
          <p className={styles.heroSubtitle}>
            Je viens directement chez vous pour des séances personnalisées
          </p>

          <div className={styles.heroCtaContainer}>
            <Link href="/reserver" className={styles.heroCtaPrimary}>
              <Calendar size={20} />
              Réserver une séance
            </Link>
            <Link href="#tarifs" className={styles.heroCtaSecondary}>
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className={styles.introSection}>
        <div className={styles.introGrid}>
          <div className={styles.introImageWrapper}>
            <Image
              src="/images/madre-con-su-hija-practicar-yoga-en-casa-2.jpg"
              alt="Pilates à domicile"
              width={500}
              height={600}
              className={styles.introImage}
            />
          </div>

          <div className={styles.introContent}>
            <h2>Le Pilates chez vous, à votre rythme</h2>
            <p>Vous préférez la tranquillité de votre maison ? Vous avez un bébé et vous déplacer est compliqué ?</p>
            <p>Je viens directement chez vous pour des séances privées adaptées à votre rythme. Votre bébé est à côté, et nous prenons le temps nécessaire.</p>
            <p>Un accompagnement sur mesure, dans le confort de votre foyer, pour vous reconnecter à votre corps en toute sérénité.</p>
            <p><strong>Aucun déplacement, aucun stress</strong> — juste vous et votre bien-être.</p>
          </div>
        </div>
      </section>

      {/* Pourquoi Section */}
      <section className={styles.pourquoiSection}>
        <div className={styles.pourquoiContent}>
          <h2>Core de Maman – Cours à domicile</h2>
          <p>
            Les premières semaines après un accouchement ne sont pas toujours simples. Se déplacer avec un bébé, tout organiser, respecter les horaires... cela peut vite devenir une source de stress.
          </p>
          <p>
            Avec les cours Core de Maman à domicile, vous restez dans votre cocon. Je viens directement chez vous, dans le confort de votre maison. Votre bébé peut être à vos côtés, et nous prenons le temps nécessaire, sans pression.
          </p>
          <p>
            <strong>Chaque séance est privée, personnalisée et adaptée à votre énergie du moment.</strong> L&apos;objectif est de vous accompagner en douceur, de respecter votre rythme et de vous offrir un espace sécurisant pour prendre soin de votre corps.
          </p>
        </div>
      </section>

      {/* Avantages Section */}
      <section className={styles.beneficesSection}>
        <div className={styles.sectionHeader}>
          <h2>Les avantages du cours à domicile</h2>
          <p>Un accompagnement personnalisé dans votre environnement familier.</p>
        </div>

        <div className={styles.beneficesGrid}>
          {avantages.map((avantage, index) => (
            <div key={index} className={styles.beneficeItem}>
              <div className={styles.beneficeIcon}>
                <Check size={32} />
              </div>
              <h3>{avantage.title}</h3>
              <p>{avantage.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pour Qui Section */}
      <section className={styles.pourquiSection}>
        <div className={styles.pourquiGrid}>
          <div className={styles.pourquiContent}>
            <h2>Pour qui</h2>
            <ul className={styles.pourquiList}>
              <li>
                <Check size={20} />
                <span>Mamans avec bébé qui préfèrent rester à la maison</span>
              </li>
              <li>
                <Check size={20} />
                <span>Personnes souhaitant un accompagnement 100% personnalisé</span>
              </li>
              <li>
                <Check size={20} />
                <span>Celles qui préfèrent l'intimité de leur foyer</span>
              </li>
            </ul>

            <h2>Comment ça se passe</h2>
            <ul className={styles.pourquiList}>
              <li>
                <Check size={20} />
                <span>Je viens chez vous avec tout le matériel</span>
              </li>
              <li>
                <Check size={20} />
                <span>Séance de 45 minutes adaptée à vos besoins</span>
              </li>
              <li>
                <Check size={20} />
                <span>Programme évolutif selon votre progression</span>
              </li>
            </ul>

            <h2>Zone d'intervention</h2>
            <ul className={styles.pourquiList}>
              <li>
                <MapPin size={20} />
                <span>Jura, Suisse</span>
              </li>
              <li>
                <Clock size={20} />
                <span>Horaires flexibles, sur rendez-vous</span>
              </li>
            </ul>
          </div>

          <div className={styles.pourquiImageWrapper}>
            <Image
              src="/images/madre-con-su-hija-practicar-yoga-en-casa-3.jpg"
              alt="Pilates à domicile avec bébé"
              fill
              className={styles.pourquiImage}
            />
          </div>
        </div>
      </section>

      {/* Tarifs Section */}
      <section className={styles.tarifsSection} id="tarifs">
        <div className={styles.sectionHeader}>
          <h2>Tarifs</h2>
          <p>Des formules adaptées à vos besoins.</p>
        </div>

        <div className={styles.tarifsGrid}>
          <div className={styles.tarifCard}>
            <h3>Séance individuelle</h3>
            <p className={styles.tarifSchedule}>
              <strong>Sur rendez-vous</strong><br />
              45 minutes
            </p>
            <div className={styles.tarifPrice}>CHF 40.-</div>
            <p className={styles.tarifPriceDetail}>par séance</p>
            <ul className={styles.tarifFeatures}>
              <li><Check size={16} /> Séance personnalisée</li>
              <li><Check size={16} /> Matériel fourni</li>
              <li><Check size={16} /> Sans engagement</li>
            </ul>
            <Link href="/reserver" className={styles.tarifCta}>
              Réserver une séance
            </Link>
          </div>

          <div className={`${styles.tarifCard} ${styles.tarifCardHighlight}`}>
            <div className={styles.tarifBadge}>Offre de lancement</div>
            <h3>Pack 6 séances</h3>
            <p className={styles.tarifSchedule}>
              <strong>Sur rendez-vous</strong><br />
              6 x 45 minutes
            </p>
            <div className={styles.tarifPrice}>
              <span className={styles.tarifPriceOld}>CHF 240.-</span>
              CHF 180.-
            </div>
            <p className={styles.tarifPriceDetail}>Après le 1er mars : CHF 220.-</p>
            <Countdown targetDate={new Date("2026-03-01T00:00:00")} />
            <ul className={styles.tarifFeatures}>
              <li><Check size={16} /> 6 séances de 45 minutes</li>
              <li><Check size={16} /> Suivi personnalisé</li>
              <li><Check size={16} /> Matériel fourni</li>
              <li><Check size={16} /> Progression adaptée</li>
            </ul>
            <Link href="/reserver" className={styles.tarifCta}>
              Acheter le pack
            </Link>
          </div>
        </div>

        <div className={styles.tarifsNote}>
          <p>Frais de déplacement inclus dans la zone du Jura, Suisse.</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <h2>Questions fréquentes</h2>
          <p>Vous avez des questions ? Voici les réponses.</p>
        </div>
        <FAQ items={faqItems} />
      </section>

      {/* CTA Final */}
      <section className={styles.ctaFinal}>
        <h2>Prête à commencer ?</h2>
        <p>
          Réservez votre première séance à domicile et découvrez le confort d'un accompagnement personnalisé chez vous.
        </p>
        <div className={styles.ctaFinalButtons}>
          <Link href="/reserver" className={styles.heroCtaPrimary}>
            <Calendar size={20} />
            Réserver une séance
          </Link>
          <Link href="/contact" className={styles.heroCtaSecondary}>
            Poser une question
          </Link>
        </div>
      </section>
    </>
  );
}
