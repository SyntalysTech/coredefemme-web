import { Resend } from 'resend';

// Inicializar Resend con la API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuración
export const EMAIL_CONFIG = {
  from: 'Core de Femme <bonjour@coredefemme.ch>', // Cambiar cuando tengan dominio verificado
  replyTo: 'contact@coredefemme.ch',
  bcc: 'contact@coredefemme.ch', // Copia a Chloé de todos los emails
};

// Logo en base64 o URL pública
export const LOGO_URL = 'https://coredefemme.ch/logos/logo-core-de-femme-no-bg.png';

// Colores de la marca
export const BRAND_COLORS = {
  primary: '#A9806A',
  dark: '#765C4A',
  light: '#FFF1E7',
  accent: '#D4A574',
  text: '#4A3728',
  white: '#FFFFFF',
};

// Tipos
export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

// Función principal de envío
export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: replyTo || EMAIL_CONFIG.replyTo,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending email:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Exportar instancia de Resend para uso directo si es necesario
export { resend };
