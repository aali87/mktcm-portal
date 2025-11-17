import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Brevo API configuration
const BREVO_API_URL = 'https://api.brevo.com/v3';
const BOOK_SESSION_LIST_ID = 6;

interface BrevoContactResponse {
  id?: number;
  code?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { firstName, lastName, email, phone, message, interests, newsletterOptIn } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
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

    // Validate interests array
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one area of interest' },
        { status: 400 }
      );
    }

    // Check for Brevo API key
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Booking service is not configured' },
        { status: 500 }
      );
    }

    // Try to create contact in Brevo
    const contactResponse = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          PHONE: phone,
          MESSAGE: message,
          INTERESTS: interests.join(', '),
          NEWSLETTER_OPTIN: newsletterOptIn || false,
        },
        listIds: [BOOK_SESSION_LIST_ID],
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

    // Handle duplicate contact - perform proper upsert
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
        const existingAttributes = existingContact.attributes || {};
        const existingListIds = existingContact.listIds || [];

        // Merge attributes - only update if new value provided and existing is blank/missing
        const mergedAttributes: Record<string, any> = {
          FIRSTNAME: existingAttributes.FIRSTNAME || firstName,
          LASTNAME: existingAttributes.LASTNAME || lastName,
          PHONE: existingAttributes.PHONE || phone,
          MESSAGE: message, // Always update message with latest
          INTERESTS: interests.join(', '), // Always update interests with latest
          NEWSLETTER_OPTIN: newsletterOptIn || existingAttributes.NEWSLETTER_OPTIN || false,
        };

        // Merge list IDs - add to book-session list if not already there
        const updatedListIds = existingListIds.includes(BOOK_SESSION_LIST_ID)
          ? existingListIds
          : [...existingListIds, BOOK_SESSION_LIST_ID];

        // Update contact with merged data
        const updateResponse = await fetch(`${BREVO_API_URL}/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: {
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            attributes: mergedAttributes,
            listIds: updatedListIds,
          }),
        });

        if (!updateResponse.ok) {
          console.error('Failed to update existing contact:', await updateResponse.text());
        } else {
          console.log('Contact upserted successfully:', email);
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: "Thank you! We'll be in touch soon."
        },
        { status: 200 }
      );
    }

    // Handle other Brevo API errors
    if (!contactResponse.ok) {
      console.error('Brevo contact creation error:', contactData);
      return NextResponse.json(
        { success: false, error: 'Failed to submit booking request' },
        { status: 500 }
      );
    }

    console.log('Contact created successfully:', email);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Thank you! We'll be in touch soon."
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Book session error:', error);
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
