import { Metadata } from "next";
import Link from "next/link";
import styles from "../mentions-legales/page.module.css";

export const metadata: Metadata = {
  title: "Politique de Confidentialité - Core de Femme",
  description: "Politique de confidentialité du site Core de Femme. Informations sur la collecte et le traitement de vos données personnelles.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Politique de Confidentialité</h1>
        <p className={styles.lastUpdate}>Dernière mise à jour : Janvier 2026</p>

        <section className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            Chez Core de Femme, nous attachons une grande importance à la protection de votre vie privée.
            Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons
            vos données personnelles lorsque vous utilisez notre site web et nos services.
          </p>
          <p>
            En utilisant notre site, vous acceptez les pratiques décrites dans cette politique.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Responsable du traitement</h2>
          <p>Le responsable du traitement des données est :</p>
          <ul>
            <li><strong>Nom :</strong> Chloé Manzambi</li>
            <li><strong>Activité :</strong> Core de Femme - Studio de Pilates</li>
            <li><strong>Adresse :</strong> Porrentruy, Jura, Suisse</li>
            <li><strong>Email :</strong> <a href="mailto:policy@coredefemme.ch">policy@coredefemme.ch</a></li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Données collectées</h2>
          <p>Nous pouvons collecter les données suivantes :</p>
          <ul>
            <li><strong>Données d&apos;identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
            <li><strong>Données de réservation :</strong> historique des cours, préférences, packs achetés</li>
            <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées</li>
            <li><strong>Données de communication :</strong> messages envoyés via le formulaire de contact</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Finalités du traitement</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>Gérer vos réservations de cours et votre compte client</li>
            <li>Vous contacter concernant vos réservations ou vos demandes</li>
            <li>Vous envoyer des informations sur nos cours et offres (avec votre consentement)</li>
            <li>Améliorer nos services et l&apos;expérience utilisateur</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Base légale du traitement</h2>
          <p>Le traitement de vos données repose sur :</p>
          <ul>
            <li><strong>L&apos;exécution d&apos;un contrat :</strong> pour gérer vos réservations et paiements</li>
            <li><strong>Votre consentement :</strong> pour l&apos;envoi de communications marketing</li>
            <li><strong>L&apos;intérêt légitime :</strong> pour améliorer nos services</li>
            <li><strong>Les obligations légales :</strong> pour la comptabilité et la facturation</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Durée de conservation</h2>
          <p>
            Nous conservons vos données personnelles aussi longtemps que nécessaire pour les finalités
            pour lesquelles elles ont été collectées, généralement :
          </p>
          <ul>
            <li><strong>Données clients :</strong> 5 ans après la dernière activité</li>
            <li><strong>Données de facturation :</strong> 10 ans (obligation légale suisse)</li>
            <li><strong>Messages de contact :</strong> 2 ans</li>
            <li><strong>Données de navigation :</strong> 13 mois</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>7. Partage des données</h2>
          <p>
            Vos données peuvent être partagées avec des tiers de confiance pour le fonctionnement
            de nos services :
          </p>
          <ul>
            <li><strong>Hébergement :</strong> Vercel (USA) - pour l&apos;hébergement du site</li>
            <li><strong>Domaine :</strong> Infomaniak (Suisse) - pour la gestion du nom de domaine</li>
            <li><strong>Base de données :</strong> Supabase - pour le stockage sécurisé des données</li>
            <li><strong>Paiement :</strong> Stripe - pour le traitement des paiements</li>
            <li><strong>Email :</strong> Resend - pour l&apos;envoi d&apos;emails transactionnels</li>
          </ul>
          <p>
            Nous ne vendons jamais vos données personnelles à des tiers.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Vos droits</h2>
          <p>
            Conformément à la Loi fédérale sur la protection des données (LPD) et au RGPD,
            vous disposez des droits suivants :
          </p>
          <ul>
            <li><strong>Droit d&apos;accès :</strong> obtenir une copie de vos données</li>
            <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
            <li><strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li><strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos données</li>
            <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à :{" "}
            <a href="mailto:policy@coredefemme.ch">policy@coredefemme.ch</a>
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Cookies</h2>
          <p>
            Notre site utilise des cookies pour améliorer votre expérience de navigation :
          </p>
          <ul>
            <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
            <li><strong>Cookies d&apos;authentification :</strong> pour maintenir votre session connectée</li>
            <li><strong>Cookies analytiques :</strong> pour comprendre comment le site est utilisé</li>
          </ul>
          <p>
            Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines
            fonctionnalités du site pourraient ne pas fonctionner correctement.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Sécurité</h2>
          <p>
            Nous mettons en place des mesures de sécurité techniques et organisationnelles
            appropriées pour protéger vos données contre tout accès non autorisé, modification,
            divulgation ou destruction :
          </p>
          <ul>
            <li>Chiffrement SSL/TLS pour toutes les communications</li>
            <li>Accès restreint aux données personnelles</li>
            <li>Mots de passe sécurisés et hashés</li>
            <li>Sauvegardes régulières</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>11. Transferts internationaux</h2>
          <p>
            Certaines données peuvent être transférées vers des pays situés en dehors de la Suisse
            (notamment les USA pour l&apos;hébergement). Ces transferts sont encadrés par des garanties
            appropriées conformément à la législation en vigueur.
          </p>
        </section>

        <section className={styles.section}>
          <h2>12. Modifications</h2>
          <p>
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
            Les modifications seront publiées sur cette page avec la date de mise à jour.
            Nous vous encourageons à consulter régulièrement cette page.
          </p>
        </section>

        <section className={styles.section}>
          <h2>13. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits,
            contactez-nous à :
          </p>
          <ul>
            <li><strong>Email :</strong> <a href="mailto:policy@coredefemme.ch">policy@coredefemme.ch</a></li>
          </ul>
          <p>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez également déposer une
            plainte auprès du Préposé fédéral à la protection des données et à la transparence (PFPDT).
          </p>
        </section>

        <div className={styles.backLink}>
          <Link href="/">← Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  );
}
