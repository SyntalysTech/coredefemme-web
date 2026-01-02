import { BRAND_COLORS, LOGO_URL } from './resend';

// =============================================
// PLANTILLA BASE
// =============================================
const baseTemplate = (content: string, preheader: string = '') => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Core de Femme</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', Arial, sans-serif;
      background-color: #ffffff;
      -webkit-font-smoothing: antialiased;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${BRAND_COLORS.white};
    }

    .preheader {
      display: none !important;
      visibility: hidden;
      opacity: 0;
      color: transparent;
      height: 0;
      width: 0;
      font-size: 0;
      line-height: 0;
    }

    a {
      color: ${BRAND_COLORS.primary};
      text-decoration: none;
    }

    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .mobile-padding {
        padding: 20px !important;
      }
      .mobile-center {
        text-align: center !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
  <!-- Preheader -->
  <span class="preheader">${preheader}</span>

  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
    <tr>
      <td style="padding: 30px 15px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="margin: 0 auto; background-color: ${BRAND_COLORS.light}; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 25px rgba(169, 128, 106, 0.15);">

          <!-- Header con Logo -->
          <tr>
            <td style="background: ${BRAND_COLORS.light}; padding: 30px; text-align: center; border-bottom: 3px solid ${BRAND_COLORS.primary};">
              <img src="${LOGO_URL}" alt="Core de Femme" width="180" style="max-width: 180px; height: auto; display: inline-block;" />
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td class="mobile-padding" style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND_COLORS.light}; padding: 30px; text-align: center;">
              <p style="margin: 0 0 15px; color: ${BRAND_COLORS.text}; font-size: 14px; font-weight: 500;">
                Chloé Manzambi
              </p>
              <p style="margin: 0 0 15px; color: ${BRAND_COLORS.text}; font-size: 13px; opacity: 0.8;">
                La Vouivre, Rue Pierre-Péquignat 7, 1er étage<br>
                2900 Porrentruy, Jura, Suisse
              </p>
              <p style="margin: 0 0 20px;">
                <a href="https://coredefemme.ch" style="color: ${BRAND_COLORS.primary}; font-size: 13px; font-weight: 500;">coredefemme.ch</a>
              </p>
              <div style="border-top: 1px solid rgba(169, 128, 106, 0.2); padding-top: 20px;">
                <a href="https://www.instagram.com/coredefemme" style="display: inline-block; margin: 0 10px;">
                  <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="24" style="opacity: 0.7;" />
                </a>
                <a href="https://wa.me/41795551234" style="display: inline-block; margin: 0 10px;">
                  <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" width="24" style="opacity: 0.7;" />
                </a>
              </div>
              <p style="margin: 20px 0 0; color: ${BRAND_COLORS.text}; font-size: 11px; opacity: 0.6;">
                © ${new Date().getFullYear()} Core de Femme. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// =============================================
// COMPONENTES REUTILIZABLES
// =============================================
const button = (text: string, href: string) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 25px auto;">
    <tr>
      <td style="background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.dark} 100%); border-radius: 30px; padding: 14px 35px;">
        <a href="${href}" style="color: ${BRAND_COLORS.white}; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

const infoBox = (content: string) => `
  <div style="background-color: ${BRAND_COLORS.light}; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid ${BRAND_COLORS.primary};">
    ${content}
  </div>
`;

const heading = (text: string) => `
  <h1 style="color: ${BRAND_COLORS.primary}; font-size: 24px; font-weight: 600; margin: 0 0 20px; line-height: 1.4;">
    ${text}
  </h1>
`;

const paragraph = (text: string) => `
  <p style="color: ${BRAND_COLORS.text}; font-size: 15px; line-height: 1.7; margin: 0 0 15px;">
    ${text}
  </p>
`;

const divider = () => `
  <hr style="border: none; border-top: 1px solid rgba(169, 128, 106, 0.2); margin: 25px 0;" />
`;

// =============================================
// PLANTILLAS DE EMAIL
// =============================================

// 1. Confirmación de reservación
export function reservationConfirmationTemplate({
  customerName,
  reservationNumber,
  serviceName,
  sessionDate,
  sessionTime,
  location,
  price,
  queuePosition,
}: {
  customerName: string;
  reservationNumber: string;
  serviceName: string;
  sessionDate: string;
  sessionTime: string;
  location: string;
  price: string;
  queuePosition?: number;
}) {
  const isQueued = queuePosition !== undefined && queuePosition > 0;

  const content = `
    ${heading(isQueued ? 'Vous êtes sur la liste d\'attente' : 'Réservation confirmée !')}

    ${paragraph(`Bonjour <strong>${customerName}</strong>,`)}

    ${isQueued
      ? paragraph(`Votre demande de réservation a été enregistrée. Vous êtes actuellement en <strong>position ${queuePosition}</strong> sur la liste d'attente. Nous vous contacterons dès qu'une place se libère.`)
      : paragraph(`Merci pour votre réservation ! Votre séance est confirmée. Nous avons hâte de vous accueillir.`)
    }

    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">Numéro de réservation</strong><br>
            <span style="color: ${BRAND_COLORS.primary}; font-size: 18px; font-weight: 600;">${reservationNumber}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">Cours</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${serviceName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">Date & Heure</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${sessionDate} à ${sessionTime}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">Lieu</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${location}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">Tarif</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${price}</span>
          </td>
        </tr>
      </table>
    `)}

    ${divider()}

    ${heading('À préparer')}
    ${paragraph(`
      <ul style="margin: 0; padding-left: 20px; color: ${BRAND_COLORS.text};">
        <li style="margin-bottom: 8px;">Une tenue confortable</li>
        <li style="margin-bottom: 8px;">Une gourde d'eau</li>
        <li style="margin-bottom: 8px;">Votre bonne humeur !</li>
      </ul>
    `)}

    ${paragraph('Le reste du matériel est fourni sur place.')}

    ${button('Voir ma réservation', 'https://coredefemme.ch/mes-reservations')}

    ${divider()}

    ${paragraph('En cas de question ou si vous devez annuler, contactez-moi par WhatsApp ou via le site.')}

    ${paragraph('À très vite !')}
    ${paragraph(`<strong>Chloé</strong><br><span style="opacity: 0.8;">Core de Femme</span>`)}
  `;

  return baseTemplate(content, `Votre réservation ${reservationNumber} est ${isQueued ? 'en attente' : 'confirmée'}`);
}

// 2. Annulation de réservation
export function reservationCancellationTemplate({
  customerName,
  reservationNumber,
  serviceName,
  sessionDate,
  sessionTime,
}: {
  customerName: string;
  reservationNumber: string;
  serviceName: string;
  sessionDate: string;
  sessionTime: string;
}) {
  const content = `
    ${heading('Réservation annulée')}

    ${paragraph(`Bonjour <strong>${customerName}</strong>,`)}

    ${paragraph(`Votre réservation a bien été annulée.`)}

    ${infoBox(`
      <p style="margin: 0; color: ${BRAND_COLORS.text};">
        <strong>Réservation ${reservationNumber}</strong><br>
        ${serviceName}<br>
        ${sessionDate} à ${sessionTime}
      </p>
    `)}

    ${paragraph('Si vous souhaitez réserver une autre séance, n\'hésitez pas à consulter notre planning.')}

    ${button('Voir le planning', 'https://coredefemme.ch')}

    ${paragraph('À bientôt !')}
    ${paragraph(`<strong>Chloé</strong><br><span style="opacity: 0.8;">Core de Femme</span>`)}
  `;

  return baseTemplate(content, `Réservation ${reservationNumber} annulée`);
}

// 3. Rappel de séance (24h avant)
export function sessionReminderTemplate({
  customerName,
  serviceName,
  sessionDate,
  sessionTime,
  location,
}: {
  customerName: string;
  serviceName: string;
  sessionDate: string;
  sessionTime: string;
  location: string;
}) {
  const content = `
    ${heading('Rappel : Votre séance demain !')}

    ${paragraph(`Bonjour <strong>${customerName}</strong>,`)}

    ${paragraph(`Petit rappel : votre séance de <strong>${serviceName}</strong> a lieu demain !`)}

    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">Date & Heure</strong><br>
            <span style="color: ${BRAND_COLORS.text}; font-size: 16px;">${sessionDate} à ${sessionTime}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">Lieu</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${location}</span>
          </td>
        </tr>
      </table>
    `)}

    ${paragraph('N\'oubliez pas votre tenue confortable et une gourde !')}

    ${paragraph(`Si vous ne pouvez pas venir, merci de me prévenir au plus vite pour libérer votre place.`)}

    ${button('Me contacter', 'https://coredefemme.ch/contact')}

    ${paragraph('À demain !')}
    ${paragraph(`<strong>Chloé</strong><br><span style="opacity: 0.8;">Core de Femme</span>`)}
  `;

  return baseTemplate(content, `Rappel : Séance demain ${sessionTime}`);
}

// 4. Place disponible (sortie de file d'attente)
export function queuePositionUpdatedTemplate({
  customerName,
  serviceName,
  sessionDate,
  sessionTime,
  isNowConfirmed,
  newPosition,
}: {
  customerName: string;
  serviceName: string;
  sessionDate: string;
  sessionTime: string;
  isNowConfirmed: boolean;
  newPosition?: number;
}) {
  const content = isNowConfirmed ? `
    ${heading('Bonne nouvelle ! Une place s\'est libérée !')}

    ${paragraph(`Bonjour <strong>${customerName}</strong>,`)}

    ${paragraph(`Une place vient de se libérer et votre réservation est maintenant <strong>confirmée</strong> !`)}

    ${infoBox(`
      <p style="margin: 0; color: ${BRAND_COLORS.text}; text-align: center;">
        <strong style="color: ${BRAND_COLORS.primary}; font-size: 18px;">${serviceName}</strong><br><br>
        ${sessionDate} à ${sessionTime}
      </p>
    `)}

    ${paragraph('Nous avons hâte de vous accueillir !')}

    ${button('Voir ma réservation', 'https://coredefemme.ch/mes-reservations')}

    ${paragraph(`<strong>Chloé</strong><br><span style="opacity: 0.8;">Core de Femme</span>`)}
  ` : `
    ${heading('Mise à jour de votre position')}

    ${paragraph(`Bonjour <strong>${customerName}</strong>,`)}

    ${paragraph(`Votre position sur la liste d'attente a été mise à jour. Vous êtes maintenant en <strong>position ${newPosition}</strong>.`)}

    ${infoBox(`
      <p style="margin: 0; color: ${BRAND_COLORS.text};">
        <strong>${serviceName}</strong><br>
        ${sessionDate} à ${sessionTime}
      </p>
    `)}

    ${paragraph('Nous vous contacterons dès qu\'une place se libère.')}

    ${paragraph(`<strong>Chloé</strong><br><span style="opacity: 0.8;">Core de Femme</span>`)}
  `;

  return baseTemplate(content, isNowConfirmed ? 'Votre place est confirmée !' : 'Mise à jour liste d\'attente');
}

// 5. Confirmation d'achat de pack
export function packPurchaseTemplate({
  customerName,
  serviceName,
  totalSessions,
  amountPaid,
  expiresAt,
}: {
  customerName: string;
  serviceName: string;
  totalSessions: number;
  amountPaid: string;
  expiresAt: string;
}) {
  const content = `
    ${heading('Pack acheté avec succès !')}

    ${paragraph(`Bonjour <strong>${customerName}</strong>,`)}

    ${paragraph(`Merci pour votre achat ! Votre pack de séances est maintenant actif.`)}

    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 5px 0; text-align: center;">
            <span style="color: ${BRAND_COLORS.primary}; font-size: 48px; font-weight: 700;">${totalSessions}</span><br>
            <span style="color: ${BRAND_COLORS.dark}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">séances</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 15px 0 5px; border-top: 1px solid rgba(169, 128, 106, 0.2); margin-top: 15px;">
            <strong style="color: ${BRAND_COLORS.dark};">Cours</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${serviceName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">Montant payé</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${amountPaid}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">Valide jusqu'au</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${expiresAt}</span>
          </td>
        </tr>
      </table>
    `)}

    ${paragraph('Vous pouvez dès maintenant réserver vos séances sur le site.')}

    ${button('Réserver une séance', 'https://coredefemme.ch')}

    ${paragraph('À très bientôt !')}
    ${paragraph(`<strong>Chloé</strong><br><span style="opacity: 0.8;">Core de Femme</span>`)}
  `;

  return baseTemplate(content, `Pack ${totalSessions} séances activé`);
}

// 6. Confirmation de message de contact
export function contactConfirmationTemplate({
  customerName,
  subject,
  message,
}: {
  customerName: string;
  subject: string;
  message: string;
}) {
  const content = `
    ${heading('Message bien reçu !')}

    ${paragraph(`Bonjour <strong>${customerName}</strong>,`)}

    ${paragraph(`Merci pour votre message ! Je l'ai bien reçu et je vous répondrai dans les plus brefs délais.`)}

    ${infoBox(`
      <p style="margin: 0 0 10px; color: ${BRAND_COLORS.dark};"><strong>Votre message :</strong></p>
      <p style="margin: 0; color: ${BRAND_COLORS.text}; font-style: italic;">
        ${subject ? `<strong>Objet :</strong> ${subject}<br><br>` : ''}
        "${message}"
      </p>
    `)}

    ${paragraph('En attendant, n\'hésitez pas à consulter notre site pour découvrir nos cours.')}

    ${button('Découvrir nos cours', 'https://coredefemme.ch')}

    ${paragraph('À bientôt !')}
    ${paragraph(`<strong>Chloé</strong><br><span style="opacity: 0.8;">Core de Femme</span>`)}
  `;

  return baseTemplate(content, 'Merci pour votre message');
}

// 7. Notification admin - Nouvelle réservation
export function adminNewReservationTemplate({
  reservationNumber,
  customerName,
  customerEmail,
  customerPhone,
  serviceName,
  sessionDate,
  sessionTime,
  isQueued,
  queuePosition,
}: {
  reservationNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  sessionDate: string;
  sessionTime: string;
  isQueued: boolean;
  queuePosition?: number;
}) {
  const content = `
    ${heading(isQueued ? 'Nouvelle inscription en liste d\'attente' : 'Nouvelle réservation !')}

    ${paragraph(`Une nouvelle ${isQueued ? 'inscription sur liste d\'attente' : 'réservation'} vient d'être effectuée.`)}

    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">Réservation</strong><br>
            <span style="color: ${BRAND_COLORS.primary}; font-size: 16px; font-weight: 600;">${reservationNumber}</span>
            ${isQueued ? `<br><span style="color: #e67e22; font-size: 12px;">En attente (position ${queuePosition})</span>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0 5px; border-top: 1px solid rgba(169, 128, 106, 0.2);">
            <strong style="color: ${BRAND_COLORS.dark};">Client</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${customerName}</span><br>
            <a href="mailto:${customerEmail}" style="color: ${BRAND_COLORS.primary};">${customerEmail}</a>
            ${customerPhone ? `<br><a href="tel:${customerPhone}" style="color: ${BRAND_COLORS.primary};">${customerPhone}</a>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0 5px; border-top: 1px solid rgba(169, 128, 106, 0.2);">
            <strong style="color: ${BRAND_COLORS.dark};">Séance</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${serviceName}</span><br>
            <span style="color: ${BRAND_COLORS.text};">${sessionDate} à ${sessionTime}</span>
          </td>
        </tr>
      </table>
    `)}

    ${button('Voir dans l\'admin', 'https://coredefemme.ch/admin/reservations')}
  `;

  return baseTemplate(content, `Nouvelle réservation : ${reservationNumber}`);
}

// 8. Notification admin - Annulation de réservation
export function adminCancellationTemplate({
  reservationNumber,
  customerName,
  customerEmail,
  customerPhone,
  serviceName,
  sessionDate,
  sessionTime,
  reason,
}: {
  reservationNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  sessionDate: string;
  sessionTime: string;
  reason?: string;
}) {
  const content = `
    ${heading('Réservation annulée')}

    ${paragraph('Une réservation vient d\'être annulée par le client.')}

    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">Réservation</strong><br>
            <span style="color: #e74c3c; font-size: 16px; font-weight: 600;">${reservationNumber}</span>
            <br><span style="color: #e74c3c; font-size: 12px;">ANNULÉE</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0 5px; border-top: 1px solid rgba(169, 128, 106, 0.2);">
            <strong style="color: ${BRAND_COLORS.dark};">Client</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${customerName}</span><br>
            <a href="mailto:${customerEmail}" style="color: ${BRAND_COLORS.primary};">${customerEmail}</a>
            ${customerPhone ? `<br><a href="tel:${customerPhone}" style="color: ${BRAND_COLORS.primary};">${customerPhone}</a>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0 5px; border-top: 1px solid rgba(169, 128, 106, 0.2);">
            <strong style="color: ${BRAND_COLORS.dark};">Séance</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${serviceName}</span><br>
            <span style="color: ${BRAND_COLORS.text};">${sessionDate} à ${sessionTime}</span>
          </td>
        </tr>
        ${reason ? `
        <tr>
          <td style="padding: 10px 0 5px; border-top: 1px solid rgba(169, 128, 106, 0.2);">
            <strong style="color: ${BRAND_COLORS.dark};">Raison</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${reason}</span>
          </td>
        </tr>
        ` : ''}
      </table>
    `)}

    ${paragraph('Une place est maintenant disponible pour cette séance.')}

    ${button('Voir dans l\'admin', 'https://coredefemme.ch/admin/reservations')}
  `;

  return baseTemplate(content, `Annulation : ${reservationNumber}`);
}

// 9. Notification admin - Nouveau message de contact
export function adminNewContactTemplate({
  customerName,
  customerEmail,
  customerPhone,
  subject,
  message,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject?: string;
  message: string;
}) {
  const content = `
    ${heading('Nouveau message de contact')}

    ${paragraph('Un nouveau message a été envoyé via le formulaire de contact.')}

    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 5px 0;">
            <strong style="color: ${BRAND_COLORS.dark};">De</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${customerName}</span><br>
            <a href="mailto:${customerEmail}" style="color: ${BRAND_COLORS.primary};">${customerEmail}</a>
            ${customerPhone ? `<br><a href="tel:${customerPhone}" style="color: ${BRAND_COLORS.primary};">${customerPhone}</a>` : ''}
          </td>
        </tr>
        ${subject ? `
        <tr>
          <td style="padding: 10px 0 5px; border-top: 1px solid rgba(169, 128, 106, 0.2);">
            <strong style="color: ${BRAND_COLORS.dark};">Objet</strong><br>
            <span style="color: ${BRAND_COLORS.text};">${subject}</span>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px 0 5px; border-top: 1px solid rgba(169, 128, 106, 0.2);">
            <strong style="color: ${BRAND_COLORS.dark};">Message</strong><br>
            <span style="color: ${BRAND_COLORS.text}; white-space: pre-wrap;">${message}</span>
          </td>
        </tr>
      </table>
    `)}

    ${button('Voir dans l\'admin', 'https://coredefemme.ch/admin/contacts')}
  `;

  return baseTemplate(content, `Nouveau message de ${customerName}`);
}
