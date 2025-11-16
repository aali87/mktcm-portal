import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Brevo API configuration
const BREVO_API_URL = 'https://api.brevo.com/v3';
const NEWSLETTER_LIST_ID = 5;
const WELCOME_EMAIL_TEMPLATE_ID = 1;

interface BrevoContactResponse {
  id?: number;
  code?: string;
  message?: string;
}

interface BrevoEmailResponse {
  messageId?: string;
  code?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Validate email presence
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check for Brevo API key
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Newsletter service is not configured' },
        { status: 500 }
      );
    }

    // Step 1: Create or update contact in Brevo
    const contactResponse = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        listIds: [NEWSLETTER_LIST_ID],
        updateEnabled: true, // Update contact if already exists
      }),
    });

    const contactData: BrevoContactResponse = await contactResponse.json();

    // Handle duplicate contact (already subscribed)
    if (!contactResponse.ok && contactData.code === 'duplicate_parameter') {
      console.log('Contact already exists:', email);

      // Try to update existing contact to ensure they're in the list
      const updateResponse = await fetch(`${BREVO_API_URL}/contacts/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          listIds: [NEWSLETTER_LIST_ID],
        }),
      });

      if (!updateResponse.ok) {
        console.error('Failed to update existing contact:', await updateResponse.text());
      }

      return NextResponse.json(
        {
          success: true,
          message: 'You are already subscribed to our newsletter!'
        },
        { status: 200 }
      );
    }

    // Handle other Brevo API errors
    if (!contactResponse.ok) {
      console.error('Brevo contact creation error:', contactData);
      return NextResponse.json(
        { success: false, error: 'Failed to subscribe to newsletter' },
        { status: 500 }
      );
    }

    console.log('Contact created/updated successfully:', email);

    // Step 2: Send welcome email using template
    const emailResponse = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        to: [{ email: email }],
        templateId: WELCOME_EMAIL_TEMPLATE_ID,
      }),
    });

    const emailData: BrevoEmailResponse = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Brevo welcome email error:', emailData);
      // Don't fail the request if welcome email fails - contact is still subscribed
      console.warn('Welcome email failed to send, but subscription was successful');
    } else {
      console.log('Welcome email sent successfully:', email);
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to newsletter'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://awesome-stick-193250.framer.app',
    'https://stellar-room-885268.framer.app',
    'https://www.fertilityflowmethod.com',
    'https://fertilityflowmethod.com',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ];

  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowed => origin?.includes(allowed));

  if (isAllowed) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }

  return new NextResponse(null, { status: 403 });
}
