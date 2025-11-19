/**
 * Brevo Email Service
 * Handles all transactional emails via Brevo API
 */

const BREVO_API_URL = 'https://api.brevo.com/v3';
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'noreply@mktcm.com';
const FROM_NAME = process.env.BREVO_FROM_NAME || 'MKTCM Fertility Portal';

// Brevo List IDs
export const BREVO_LISTS = {
  PORTAL_USERS: 9,
} as const;

interface SendHtmlEmailParams {
  to: {
    email: string;
    name?: string;
  };
  subject: string;
  htmlContent: string;
}

interface AddContactParams {
  email: string;
  firstName: string;
  lastName: string;
  listIds?: number[];
}

/**
 * Send an HTML email via Brevo
 */
async function sendHtmlEmail({ to, subject, htmlContent }: SendHtmlEmailParams): Promise<boolean> {
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
        sender: {
          name: FROM_NAME,
          email: FROM_EMAIL,
        },
        to: [to],
        subject,
        htmlContent,
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

    console.log('[Email] Email sent successfully:', { email: to.email, subject });
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
  const firstName = name.split(' ')[0] || 'there';

  return sendHtmlEmail({
    to: { email, name },
    subject: 'Welcome to MKTCM Fertility Portal',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to MKTCM</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Hello ${firstName}!</h2>

                      <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Thank you for joining the MKTCM Fertility Portal. We're excited to support you on your fertility journey with our evidence-based Traditional Chinese Medicine programs.
                      </p>

                      <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Your account has been created successfully. You can now access your personalized dashboard and explore our programs designed to support your fertility naturally.
                      </p>

                      <table cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                        <tr>
                          <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                              Go to Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        <strong>What's next?</strong>
                      </p>

                      <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #4a5568; font-size: 16px; line-height: 1.8;">
                        <li>Explore our free TCM fertility workshop</li>
                        <li>Download your free TCM food therapy guides</li>
                        <li>Browse our specialized fertility programs</li>
                        <li>Track your progress and access resources anytime</li>
                      </ul>

                      <p style="margin: 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        If you have any questions, feel free to reach out. We're here to help!
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 8px 0; color: #718096; font-size: 14px;">
                        MKTCM Fertility Portal
                      </p>
                      <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                        Supporting your fertility journey with Traditional Chinese Medicine
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
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
  const firstName = name.split(' ')[0] || 'there';
  const formattedAmount = (amount / 100).toFixed(2);

  return sendHtmlEmail({
    to: { email, name },
    subject: `Your purchase confirmation - ${productName}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Purchase Confirmed!</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Thank you, ${firstName}!</h2>

                      <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Your purchase has been confirmed and you now have full access to <strong>${productName}</strong>.
                      </p>

                      <!-- Purchase Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                        <tr style="background-color: #f7fafc;">
                          <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #718096; font-size: 14px; font-weight: 600; text-transform: uppercase;">Purchase Summary</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0; color: #4a5568; font-size: 15px;">Program:</td>
                                <td align="right" style="padding: 8px 0; color: #1a1a1a; font-size: 15px; font-weight: 600;">${productName}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #4a5568; font-size: 15px;">Amount Paid:</td>
                                <td align="right" style="padding: 8px 0; color: #10b981; font-size: 18px; font-weight: 700;">$${formattedAmount}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <table cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                        <tr>
                          <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                              Access Your Program
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        <strong>Ready to get started?</strong>
                      </p>

                      <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #4a5568; font-size: 16px; line-height: 1.8;">
                        <li>Watch your program videos anytime</li>
                        <li>Download accompanying workbooks and resources</li>
                        <li>Track your progress through the program</li>
                        <li>Practice at your own pace</li>
                      </ul>

                      <p style="margin: 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        We're excited to support you on this journey. If you have any questions, don't hesitate to reach out.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 8px 0; color: #718096; font-size: 14px;">
                        MKTCM Fertility Portal
                      </p>
                      <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                        Supporting your fertility journey with Traditional Chinese Medicine
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
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
  const firstName = name.split(' ')[0] || 'there';

  return sendHtmlEmail({
    to: { email, name },
    subject: 'Reset your password - MKTCM Fertility Portal',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Reset Your Password</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Hello ${firstName},</h2>

                      <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password for your MKTCM Fertility Portal account.
                      </p>

                      <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Click the button below to create a new password:
                      </p>

                      <table cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                        <tr>
                          <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Info Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <tr>
                          <td style="padding: 16px 20px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                              <strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 8px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>

                      <p style="margin: 0; padding: 12px; background-color: #f7fafc; border-radius: 4px; word-break: break-all; color: #4a5568; font-size: 13px;">
                        ${resetUrl}
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 8px 0; color: #718096; font-size: 14px;">
                        MKTCM Fertility Portal
                      </p>
                      <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                        Supporting your fertility journey with Traditional Chinese Medicine
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}
