import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Questions Fréquentes",
  description: "Trouvez toutes les réponses à vos questions sur les cours de Pilates Core de Femme : Core de Maman, cours à domicile, Sculpt Pilates, réservations et informations pratiques.",
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
