"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Baby, Home, Zap, HelpCircle, Calendar } from "lucide-react";
import styles from "./page.module.css";

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  items: FAQItem[];
  link: string;
  linkText: string;
}

const faqCategories: FAQCategory[] = [
  {
    id: "core-de-maman",
    title: "Core de Maman",
    icon: <Baby size={24} />,
    description: "Questions sur le programme post-partum",
    link: "/core-de-maman",
    linkText: "Voir le cours",
    items: [
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
    ],
  },
  {
    id: "domicile",
    title: "Cours à domicile",
    icon: <Home size={24} />,
    description: "Questions sur les séances privées",
    link: "/cours-a-domicile",
    linkText: "Voir le cours",
    items: [
      {
        question: "Où intervenez-vous pour les cours à domicile ?",
        answer: "J'interviens dans le Jura, Suisse. Contactez-moi pour vérifier si votre localité est dans ma zone d'intervention.",
      },
      {
        question: "Quel matériel dois-je préparer ?",
        answer: "Rien du tout ! J'apporte tout le matériel nécessaire : tapis, accessoires, etc. Vous n'avez qu'à prévoir une tenue confortable et une gourde.",
      },
      {
        question: "Combien de temps dure une séance à domicile ?",
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
        question: "Comment réserver une séance à domicile ?",
        answer: <>Contactez-moi par WhatsApp ou via la <Link href="/contact">page contact</Link>. Nous conviendrons ensemble d&apos;un créneau qui vous convient.</>,
      },
    ],
  },
  {
    id: "sculpt",
    title: "Sculpt Pilates",
    icon: <Zap size={24} />,
    description: "Questions sur le renforcement",
    link: "/sculpt-pilates",
    linkText: "Voir le cours",
    items: [
      {
        question: "Je n'ai jamais fait de Pilates, puis-je suivre ce cours ?",
        answer: "Oui, absolument ! Sculpt Pilates accueille tous les niveaux. Les exercices sont adaptables et je propose toujours des variantes pour les débutantes. Tu avanceras à ton rythme dans une atmosphère bienveillante.",
      },
      {
        question: "Est-ce un cours intense ?",
        answer: "Le cours est dynamique et tonifiant, mais toujours respectueux de ton corps. L'intensité est modulable selon ton niveau. Tu travailleras en profondeur, mais toujours avec conscience et contrôle, jamais dans la force brute.",
      },
      {
        question: "Quel matériel faut-il apporter pour Sculpt Pilates ?",
        answer: "Tout le matériel (bandes élastiques, poids légers, etc.) est fourni sur place. Viens avec une tenue confortable dans laquelle tu peux bouger librement.",
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
    ],
  },
  {
    id: "general",
    title: "Questions générales",
    icon: <HelpCircle size={24} />,
    description: "Informations pratiques",
    link: "/contact",
    linkText: "Nous contacter",
    items: [
      {
        question: "Où se déroulent les cours en groupe ?",
        answer: <>Les cours en groupe ont lieu à la salle <strong>La Vouivre</strong>, Rue Pierre-Péquignat 7, 1er étage, 2900 Porrentruy, Suisse.</>,
      },
      {
        question: "Comment réserver un cours ?",
        answer: <>Vous pouvez réserver directement sur la <Link href="/reserver">page de réservation</Link> ou me contacter par WhatsApp pour plus d&apos;informations.</>,
      },
      {
        question: "Quelle est la politique d'annulation ?",
        answer: "L'annulation est sans frais jusqu'à 2h avant le début du cours. Passé ce délai, la séance est due.",
      },
      {
        question: "Proposez-vous une séance découverte ?",
        answer: "Oui ! La première séance découverte est offerte pour les cours Core de Maman. C'est l'occasion idéale de tester la méthode sans engagement.",
      },
      {
        question: "Puis-je offrir une séance en cadeau ?",
        answer: <>Absolument ! Les séances font un excellent cadeau. <Link href="/contact">Contactez-moi</Link> pour organiser un bon cadeau personnalisé.</>,
      },
      {
        question: "Qui est Chloé Manzambi ?",
        answer: <>Je suis coach sportive et instructrice Pilates, ancienne athlète professionnelle. Formée aux méthodes APOR et Pilates De Gasquet, je me spécialise dans l&apos;accompagnement des femmes, notamment en post-partum. <Link href="/a-propos">En savoir plus sur mon parcours</Link>.</>,
      },
    ],
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("core-de-maman");
  const [activeItems, setActiveItems] = useState<Set<string>>(new Set());

  const toggleItem = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`;
    const newActiveItems = new Set(activeItems);
    if (newActiveItems.has(key)) {
      newActiveItems.delete(key);
    } else {
      newActiveItems.add(key);
    }
    setActiveItems(newActiveItems);
  };

  const currentCategory = faqCategories.find(c => c.id === activeCategory);

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Questions Fréquentes</h1>
          <p className={styles.heroSubtitle}>
            Trouvez toutes les réponses à vos questions sur mes cours de Pilates
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.faqContainer}>
          {/* Category Tabs */}
          <div className={styles.categoryTabs}>
            {faqCategories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryTab} ${activeCategory === category.id ? styles.active : ""}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryName}>{category.title}</span>
              </button>
            ))}
          </div>

          {/* Category Content */}
          {currentCategory && (
            <div className={styles.categoryContent}>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryHeaderIcon}>{currentCategory.icon}</div>
                <div>
                  <h2>{currentCategory.title}</h2>
                  <p>{currentCategory.description}</p>
                </div>
              </div>

              <div className={styles.faqList}>
                {currentCategory.items.map((item, index) => {
                  const isActive = activeItems.has(`${currentCategory.id}-${index}`);
                  return (
                    <div
                      key={index}
                      className={`${styles.faqItem} ${isActive ? styles.active : ""}`}
                    >
                      <button
                        className={styles.faqQuestion}
                        onClick={() => toggleItem(currentCategory.id, index)}
                        aria-expanded={isActive}
                      >
                        <span>{item.question}</span>
                        <ChevronDown size={20} className={styles.faqIcon} />
                      </button>
                      <div className={styles.faqAnswer}>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.categoryFooter}>
                <Link href={currentCategory.link} className={styles.categoryLink}>
                  {currentCategory.linkText}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Vous avez d&apos;autres questions ?</h2>
          <p>Je suis là pour vous répondre. N&apos;hésitez pas à me contacter !</p>
          <div className={styles.ctaButtons}>
            <Link href="/contact" className={styles.ctaPrimary}>
              Me contacter
            </Link>
            <Link href="/reserver" className={styles.ctaSecondary}>
              <Calendar size={18} />
              Réserver un cours
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
