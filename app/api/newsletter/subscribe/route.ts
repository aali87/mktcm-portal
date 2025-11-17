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

    // Step 1: Try to create contact, or update if exists
    const contactResponse = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        listIds: [NEWSLETTER_LIST_ID],
        updateEnabled: true,
      }),
    });

    let contactData: BrevoContactResponse = {};

    // Safely parse JSON response
    try {
      const responseText = await contactResponse.text();
      if (responseText) {
        contactData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse Brevo response:', parseError);
      contactData = {};
    }

    // Handle duplicate contact - fetch existing data and merge
    // Check both error code and HTTP 400 status which Brevo uses for duplicates
    const isDuplicate = (!contactResponse.ok && contactData.code === 'duplicate_parameter') ||
                        (contactResponse.status === 400 && contactData.message?.includes('Contact already exist'));

    if (isDuplicate || (!contactResponse.ok && contactResponse.status === 400)) {
      console.log('Contact already exists, performing upsert:', email);

      // Fetch existing contact to preserve data
      const getResponse = await fetch(`${BREVO_API_URL}/contacts/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'api-key': brevoApiKey,
        },
      });

      if (getResponse.ok) {
        const existingContact = await getResponse.json();
        const existingListIds = existingContact.listIds || [];

        // Merge list IDs - add to newsletter list if not already there
        const updatedListIds = existingListIds.includes(NEWSLETTER_LIST_ID)
          ? existingListIds
          : [...existingListIds, NEWSLETTER_LIST_ID];

        // Update contact with merged list IDs
        const updateResponse = await fetch(`${BREVO_API_URL}/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: {
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            listIds: updatedListIds,
          }),
        });

        if (!updateResponse.ok) {
          console.error('Failed to update existing contact:', await updateResponse.text());
        } else {
          console.log('Contact updated with list membership:', email);
        }
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

    console.log('Contact created successfully:', email);

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
