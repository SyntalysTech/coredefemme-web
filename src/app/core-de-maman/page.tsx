import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Check, Clock, Dumbbell, Droplets } from "lucide-react";
import FAQ from "@/components/FAQ";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Core de Maman - Pilates Post-Partum",
  description: "Cours de Pilates post-partum à Bressaucourt. Programme doux et progressif pour mamans: rééducation du périnée, renforcement du core, respiration consciente.",
};

const benefices = [
  {
    icon: "heart",
    title: "Rééducation du périnée",
    description: "Exercices doux et progressifs pour renforcer votre périnée et retrouver votre confort au quotidien.",
  },
  {
    icon: "clock",
    title: "Respiration consciente",
    description: "Apprenez à respirer pleinement pour vous recentrer, gérer le stress et soutenir votre rééducation.",
  },
  {
    icon: "shield",
    title: "Renforcement du transverse",
    description: "Retrouvez votre sangle abdominale profonde avec des exercices adaptés et respectueux de votre corps.",
  },
  {
    icon: "check",
    title: "Posture et alignement",
    description: "Corrigez les déséquilibres posturaux liés à la grossesse et aux sollicitations du quotidien avec bébé.",
  },
  {
    icon: "layers",
    title: "Énergie retrouvée",
    description: "Retrouvez progressivement votre vitalité et votre force à votre rythme.",
  },
  {
    icon: "heart-2",
    title: "Moment pour soi",
    description: "Un espace bienveillant pour vous reconnecter à vous-même, loin des sollicitations du quotidien.",
  },
];

const faqItems = [
  {
    question: "Mon bébé a moins de 3 mois, puis-je participer ?",
    answer: "Oui, absolument ! Core de Maman est adapté dès la naissance de votre bébé. Les exercices sont doux et progressifs, pensés pour respecter votre corps en phase de récupération. J'adapte chaque mouvement à votre niveau et à votre ressenti.",
  },
  {
    question: "Je n'ai jamais fait de Pilates, est-ce pour moi ?",
    answer: "Oui ! Core de Maman accueille tous les niveaux. Aucune expérience préalable en Pilates n'est nécessaire. Les cours sont conçus pour être accessibles et bienveillants, avec un accompagnement personnalisé pour chaque participante.",
  },
  {
    question: "Faut-il du matériel ?",
    answer: "Non, tout le matériel est fourni sur place. Il suffit de prendre une gourde et un petit linge.",
  },
  {
    question: "J'ai eu une césarienne, puis-je suivre ce cours ?",
    answer: "Oui, Core de Maman convient également aux mamans ayant eu une césarienne. Les exercices respectent votre cicatrisation et nous adaptons les mouvements selon vos besoins. N'hésitez pas à me contacter pour discuter de votre situation spécifique.",
  },
  {
    question: "Puis-je venir avec mon bébé ?",
    answer: "Oui, bébé jusqu'à 12 mois est le bienvenu.",
  },
  {
    question: "Combien de temps après l'accouchement puis-je commencer ?",
    answer: "Vous pouvez commencer dès que vous vous sentez prête, généralement quelques semaines après l'accouchement. Chaque femme est différente. Si vous avez des questions ou des préoccupations médicales, n'hésitez pas à consulter votre sage-femme ou médecin, et à me contacter pour en discuter.",
  },
];

export default function CoreDeMamanPage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image
            src="/images/pilates-post-partum.png"
            alt="Core de Maman - Post-partum Pilates"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          <div className={styles.heroOverlay}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Pour les Mamans</div>
          <h1 className={styles.heroTitle}>Core de Maman</h1>
          <p className={styles.heroSubtitle}>
            Que tu aies accouché récemment, il y a 5 ans ou 10 ans +
          </p>

          <div className={styles.heroCtaContainer}>
            <Link href="/contact" className={styles.heroCtaPrimary}>
              <Calendar size={20} />
              Ma séance d'essai gratuite
            </Link>
            <Link href="#tarifs" className={styles.heroCtaSecondary}>
              Horaire & tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className={styles.introSection}>
        <div className={styles.introGrid}>
          <div className={styles.introImageWrapper}>
            <Image
              src="/images/mom-baby.jpg"
              alt="Maman et bébé - Core de Maman"
              width={500}
              height={600}
              className={styles.introImage}
            />
          </div>

          <div className={styles.introContent}>
            <h2>Un moment pour toi, en toute bienveillance</h2>
            <p>Parce qu&apos;après avoir donné la vie, ton corps mérite toute ton attention.</p>
            <p>Ce programme doux et progressif s&apos;adresse à toi, que tu aies accouché récemment ou il y a plusieurs années.</p>
            <p>(Re)découvre ta puissance intérieure, renforce ton core et reconnecte-toi à ton corps avec bienveillance et gratitude.</p>
            <p>Tu souffres de fuites urinaires, d&apos;un ventre ballonné, de maux de dos ou d&apos;un diastasis ?</p>
            <p><strong>Ce cours est fait pour toi</strong> — pour t&apos;accompagner pas à pas, en douceur, vers plus de confort, de confiance et de force.</p>
          </div>
        </div>
      </section>

      {/* Bénéfices Section */}
      <section className={styles.beneficesSection}>
        <div className={styles.sectionHeader}>
          <h2>Objectifs du cours</h2>
          <p>Renforcer le centre (transverse) et le plancher pelvien, améliorer la posture et la mobilité, retrouver confort et confiance en son corps après l&apos;accouchement.</p>
        </div>

        <div className={styles.beneficesGrid}>
          {benefices.map((benefice, index) => (
            <div key={index} className={styles.beneficeItem}>
              <div className={styles.beneficeIcon}>
                <Check size={32} />
              </div>
              <h3>{benefice.title}</h3>
              <p>{benefice.description}</p>
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
                <span>Mamans ayant accouché récemment ou il y a plusieurs années</span>
              </li>
              <li>
                <Check size={20} />
                <span>Toutes celles qui souhaitent se reconnecter à leur corps, soulager maux de dos, ventre ballonné, fuites urinaires ou diastasis</span>
              </li>
            </ul>

            <h2>Comment se déroule le cours</h2>
            <ul className={styles.pourquiList}>
              <li>
                <Check size={20} />
                <span>Séances douces et progressives</span>
              </li>
              <li>
                <Check size={20} />
                <span>Exercices adaptés à ton niveau</span>
              </li>
              <li>
                <Check size={20} />
                <span>Progression individuelle, respect du corps et du rythme de chacune</span>
              </li>
            </ul>

            <h2>Infos pratiques</h2>
            <ul className={styles.pourquiList}>
              <li>
                <Clock size={20} />
                <span>Durée : 60 min</span>
              </li>
              <li>
                <Dumbbell size={20} />
                <span>Tout est fourni sur place</span>
              </li>
              <li>
                <Droplets size={20} />
                <span>Une gourde et un petit linge recommandés</span>
              </li>
            </ul>
            <p style={{ marginTop: '1rem', fontWeight: 'bold', color: '#A9806A' }}>
              Bébés bienvenus ! Amenez votre petit avec vous pendant la séance.
            </p>
          </div>

          <div className={styles.pourquiImageWrapper}>
            <Image
              src="/images/pilates-post-partum.png"
              alt="Groupe Core de Maman Jura"
              width={500}
              height={600}
              className={styles.pourquiImage}
            />
          </div>
        </div>
      </section>

      {/* Tarifs Section */}
      <section className={styles.tarifsSection} id="tarifs">
        <div className={styles.sectionHeader}>
          <h2>Horaire & Tarifs</h2>
          <p>Choisissez la formule qui vous convient.</p>
        </div>

        <div className={styles.tarifsGrid}>
          <div className={styles.tarifCard}>
            <h3>Séance Découverte</h3>
            <p className={styles.tarifSchedule}>
              <strong>Mercredi matin</strong><br />
              09h30 - 10h30
            </p>
            <div className={styles.tarifPrice}>Gratuit</div>
            <p className={styles.tarifPriceDetail}>On commence le 14/01/2026</p>
            <ul className={styles.tarifFeatures}>
              <li><Check size={16} /> Découvrir la méthode</li>
              <li><Check size={16} /> Sans engagement</li>
              <li><Check size={16} /> Tous niveaux acceptés</li>
            </ul>
            <Link href="/contact" className={styles.tarifCta}>
              Réserver ma séance d'essai gratuite
            </Link>
          </div>

          <div className={styles.tarifCard}>
            <h3>Pack 6 séances</h3>
            <p className={styles.tarifSchedule}>
              <strong>Mercredi matin</strong><br />
              09h30 - 10h30
            </p>
            <div className={styles.tarifPrice}>CHF XX</div>
            <p className={styles.tarifPriceDetail}>Par pack de 6 séances</p>
            <ul className={styles.tarifFeatures}>
              <li><Check size={16} /> Séances de 60 minutes</li>
              <li><Check size={16} /> Suivi personnalisé</li>
              <li><Check size={16} /> Groupe convivial</li>
              <li><Check size={16} /> Matériel fourni</li>
            </ul>
            <Link href="/contact" className={styles.tarifCta}>
              Acheter le pack
            </Link>
          </div>

          <div className={styles.tarifCard}>
            <h3>Cours privé</h3>
            <p className={styles.tarifSchedule}>
              <strong>Séance post-partum à domicile</strong><br />
              Je viens à vous !
            </p>
            <div className={styles.tarifPrice}>CHF XX</div>
            <p className={styles.tarifPriceDetail}>Par séance</p>
            <ul className={styles.tarifFeatures}>
              <li><Check size={16} /> Séance individuelle</li>
              <li><Check size={16} /> À domicile</li>
              <li><Check size={16} /> Programme personnalisé</li>
            </ul>
            <Link href="/contact" className={styles.tarifCta}>
              Me contacter
            </Link>
          </div>
        </div>

        <div className={styles.tarifsLocation}>
          <strong>Mes cours se déroulent à la salle Crossfit la Vouivre</strong>
          <p>Rue Pierre-Péquignat 7, 1er étage<br />2900 Porrentruy, Suisse</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <h2>Questions fréquentes</h2>
          <p>Vous avez des questions ? Nous avons les réponses.</p>
        </div>
        <FAQ items={faqItems} />
      </section>

      {/* CTA Final */}
      <section className={styles.ctaFinal}>
        <h2>Prête à retrouver votre centre ?</h2>
        <p>
          Rejoignez Core de Maman et offrez-vous ce moment de reconnexion. Venez tester, votre premier cours est gratuit.
        </p>
        <div className={styles.ctaFinalButtons}>
          <Link href="/contact" className={styles.heroCtaPrimary}>
            <Calendar size={20} />
            Réserver ma séance d'essai gratuite
          </Link>
          <Link href="/contact" className={styles.heroCtaSecondary}>
            Poser une question
          </Link>
        </div>
      </section>
    </>
  );
}
