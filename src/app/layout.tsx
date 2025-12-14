import type { Metadata } from "next";
import { Montserrat, Lato } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: {
    default: "Core de Femme - Pilates Post-Partum & Renforcement Féminin | Bressaucourt, Jura",
    template: "%s | Core de Femme"
  },
  description: "Core de Femme - Pilates post-partum et renforcement féminin à Bressaucourt, Jura suisse. Cours avec Chloé Manzambi, ancienne athlète professionnelle. Reconnectez-vous à votre corps.",
  keywords: ["pilates suisse", "post-partum bressaucourt", "core de maman", "sculpt pilates", "renforcement féminin", "périnée", "respiration consciente", "jura suisse", "pilates femme", "coach sportive suisse"],
  authors: [{ name: "Chloé Manzambi - Core de Femme" }],
  creator: "Core de Femme",
  openGraph: {
    type: "website",
    locale: "fr_CH",
    url: "https://coredefemme.ch",
    siteName: "Core de Femme",
    title: "Core de Femme - Reconnectez-vous à votre corps | Pilates Post-Partum & Renforcement",
    description: "Cours de Pilates et renforcement pour femmes à Bressaucourt, Jura suisse. Programme post-partum et Sculpt Pilates par Chloé Manzambi.",
    images: [
      {
        url: "/logos/logo-core-de-femme-no-bg.png",
        width: 800,
        height: 600,
        alt: "Core de Femme Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Core de Femme - Reconnectez-vous à votre corps",
    description: "Cours de Pilates et renforcement pour femmes à Bressaucourt, Jura suisse",
  },
  icons: {
    icon: "/logos/logo-core-de-femme-icon-app.png",
    apple: "/logos/logo-core-de-femme-icon-app.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-CH">
      <head>
        <meta name="geo.region" content="CH-JU" />
        <meta name="geo.placename" content="Bressaucourt, Jura, Suisse" />
        <meta name="geo.position" content="47.4167;7.0167" />
        <meta name="ICBM" content="47.4167, 7.0167" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HealthAndBeautyBusiness",
              "name": "Core de Femme",
              "description": "Studio de Pilates et renforcement pour femmes, spécialisé en post-partum. Méthode APOR et Pilates De Gasquet.",
              "url": "https://coredefemme.ch",
              "image": "/logos/logo-core-de-femme-no-bg.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Rue de la Maltière 82H, Domaine du Pré sur l'Eau",
                "addressLocality": "Bressaucourt",
                "addressRegion": "Jura",
                "postalCode": "2904",
                "addressCountry": "CH"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "47.4167",
                "longitude": "7.0167"
              },
              "founder": {
                "@type": "Person",
                "name": "Chloé Manzambi",
                "jobTitle": "Coach Sportive & Instructrice Pilates"
              },
              "priceRange": "CHF",
              "openingHours": "Mo-Fr 09:00-19:00"
            })
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${lato.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
