import { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Mentions Légales - Core de Femme",
  description: "Mentions légales du site Core de Femme. Informations sur l'éditeur, l'hébergeur et les conditions d'utilisation.",
};

export default function MentionsLegalesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Mentions Légales</h1>
        <p className={styles.lastUpdate}>Dernière mise à jour : Janvier 2026</p>

        <section className={styles.section}>
          <h2>1. Éditeur du site</h2>
          <p>Le site <strong>coredefemme.ch</strong> est édité par :</p>
          <ul>
            <li><strong>Nom :</strong> Chloé Manzambi</li>
            <li><strong>Activité :</strong> Core de Femme - Studio de Pilates</li>
            <li><strong>Adresse :</strong> Porrentruy, Jura, Suisse</li>
            <li><strong>Email :</strong> <a href="mailto:legal@coredefemme.ch">legal@coredefemme.ch</a></li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. Hébergement</h2>
          <p>Le site est hébergé par :</p>
          <ul>
            <li><strong>Vercel Inc.</strong></li>
            <li>440 N Barranca Ave #4133</li>
            <li>Covina, CA 91723, USA</li>
            <li>Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu de ce site (textes, images, logos, vidéos, graphismes, etc.) est la propriété
            exclusive de Core de Femme ou de ses partenaires et est protégé par les lois suisses et internationales
            relatives à la propriété intellectuelle.
          </p>
          <p>
            Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments
            du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable
            de Chloé Manzambi.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Responsabilité</h2>
          <p>
            Core de Femme s&apos;efforce de fournir des informations aussi précises que possible sur ce site. Toutefois,
            elle ne pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour,
            qu&apos;elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
          </p>
          <p>
            Les informations contenues sur ce site sont à titre indicatif et ne sauraient constituer un avis médical.
            En cas de doute, consultez un professionnel de santé.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Liens hypertextes</h2>
          <p>
            Le site peut contenir des liens hypertextes vers d&apos;autres sites. Core de Femme n&apos;exerce aucun
            contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Protection des données personnelles</h2>
          <p>
            Conformément à la Loi fédérale sur la protection des données (LPD) et au Règlement général sur la
            protection des données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification et de
            suppression de vos données personnelles.
          </p>
          <p>
            Pour plus d&apos;informations sur la gestion de vos données, veuillez consulter notre{" "}
            <Link href="/politique-confidentialite">Politique de Confidentialité</Link>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Cookies</h2>
          <p>
            Le site utilise des cookies pour améliorer l&apos;expérience utilisateur. En naviguant sur ce site,
            vous acceptez l&apos;utilisation de cookies conformément à notre politique de confidentialité.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Droit applicable et juridiction</h2>
          <p>
            Les présentes mentions légales sont régies par le droit suisse. Tout litige relatif à l&apos;utilisation
            du site sera soumis à la compétence exclusive des tribunaux du canton du Jura, Suisse.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Contact</h2>
          <p>
            Pour toute question concernant les présentes mentions légales, vous pouvez nous contacter à :{" "}
            <a href="mailto:legal@coredefemme.ch">legal@coredefemme.ch</a>
          </p>
        </section>

        <div className={styles.backLink}>
          <Link href="/">← Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  );
}
