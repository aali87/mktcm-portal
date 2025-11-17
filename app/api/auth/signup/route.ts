import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

// Brevo API configuration
const BREVO_API_URL = 'https://api.brevo.com/v3';
const PORTAL_USERS_LIST_ID = 9;
const WELCOME_EMAIL_TEMPLATE_ID = 2; // Portal welcome email template

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Add user to Brevo and send welcome email
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      try {
        // Split name into first and last name
        const nameParts = validatedData.name.split(' ');
        const firstName = nameParts[0] || validatedData.name;
        const lastName = nameParts.slice(1).join(' ') || '';

        // Add contact to Brevo list
        await fetch(`${BREVO_API_URL}/contacts`, {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            email: validatedData.email,
            attributes: {
              FIRSTNAME: firstName,
              LASTNAME: lastName,
            },
            listIds: [PORTAL_USERS_LIST_ID],
            updateEnabled: true,
          }),
        });

        // Send welcome email
        await fetch(`${BREVO_API_URL}/smtp/email`, {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            to: [{
              email: validatedData.email,
              name: validatedData.name,
            }],
            templateId: WELCOME_EMAIL_TEMPLATE_ID,
          }),
        });

        console.log('User added to Brevo and welcome email sent:', validatedData.email);
      } catch (brevoError) {
        // Don't fail signup if Brevo fails - just log the error
        console.error('Brevo error during signup:', brevoError);
      }
    } else {
      console.warn('BREVO_API_KEY not set - skipping Brevo integration');
    }

    return NextResponse.json(
      {
        user,
        message: "Account created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
