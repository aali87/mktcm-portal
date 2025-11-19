/**
 * Brevo Email Service
 * Handles all transactional emails via Brevo API
 */

const BREVO_API_URL = 'https://api.brevo.com/v3';

// Brevo Template IDs
export const EMAIL_TEMPLATES = {
  WELCOME: 2, // Portal welcome email
  PURCHASE_CONFIRMATION: 3, // Purchase confirmation email
  PASSWORD_RESET: 4, // Password reset email
} as const;

// Brevo List IDs
export const BREVO_LISTS = {
  PORTAL_USERS: 9,
} as const;

interface SendEmailParams {
  to: {
    email: string;
    name?: string;
  };
  templateId: number;
  params?: Record<string, any>;
}

interface AddContactParams {
  email: string;
  firstName: string;
  lastName: string;
  listIds?: number[];
}

/**
 * Send a transactional email via Brevo
 */
export async function sendEmail({ to, templateId, params }: SendEmailParams): Promise<boolean> {
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    console.error('[Email] BREVO_API_KEY not set - cannot send email');
    return false;
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        to: [to],
        templateId,
        params,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Email] Brevo API error:', {
        status: response.status,
        error: errorText,
      });
      return false;
    }

    console.log('[Email] Email sent successfully:', { email: to.email, templateId });
    return true;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}

/**
 * Add or update a contact in Brevo
 */
export async function addContactToBrevo({
  email,
  firstName,
  lastName,
  listIds = [BREVO_LISTS.PORTAL_USERS],
}: AddContactParams): Promise<boolean> {
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    console.error('[Email] BREVO_API_KEY not set - cannot add contact');
    return false;
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
        },
        listIds,
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Contact already exists is not an error
      if (response.status === 400 && errorText.includes('already exist')) {
        console.log('[Email] Contact already exists in Brevo:', email);
        return true;
      }

      console.error('[Email] Brevo API error adding contact:', {
        status: response.status,
        error: errorText,
      });
      return false;
    }

    console.log('[Email] Contact added to Brevo:', email);
    return true;
  } catch (error) {
    console.error('[Email] Error adding contact to Brevo:', error);
    return false;
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to: { email, name },
    templateId: EMAIL_TEMPLATES.WELCOME,
  });
}

/**
 * Send purchase confirmation email
 */
export async function sendPurchaseConfirmationEmail(
  email: string,
  name: string,
  productName: string,
  amount: number,
  dashboardUrl: string
): Promise<boolean> {
  return sendEmail({
    to: { email, name },
    templateId: EMAIL_TEMPLATES.PURCHASE_CONFIRMATION,
    params: {
      productName,
      amount: (amount / 100).toFixed(2), // Convert cents to dollars
      dashboardUrl,
    },
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<boolean> {
  return sendEmail({
    to: { email, name },
    templateId: EMAIL_TEMPLATES.PASSWORD_RESET,
    params: {
      resetUrl,
      name,
    },
  });
}
