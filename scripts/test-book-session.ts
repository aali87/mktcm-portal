/**
 * Test script for book session endpoint
 *
 * Usage:
 *   npx tsx scripts/test-book-session.ts
 */

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testBookSession() {
  console.log('Testing book session endpoint...\n');

  const testEmail = `test-${Date.now()}@example.com`;

  try {
    // Test 1: Valid booking request
    console.log('1. Testing with valid booking data');
    const response1 = await fetch(`${API_URL}/api/book-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Jane',
        lastName: 'Doe',
        email: testEmail,
        phone: '+12345678900',
        message: 'I am interested in fertility support sessions.',
        interests: ['Fertility Support', 'Acupuncture for Wellness'],
        newsletterOptIn: true,
      }),
    });

    const data1 = await response1.json();
    console.log('Response:', response1.status, data1);
    console.log('✓ Valid booking test completed\n');

    // Test 2: Missing required field
    console.log('2. Testing with missing firstName');
    const response2 = await fetch(`${API_URL}/api/book-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastName: 'Doe',
        email: testEmail,
        phone: '+12345678900',
        message: 'Test message',
        interests: ['Fertility Support'],
        newsletterOptIn: false,
      }),
    });

    const data2 = await response2.json();
    console.log('Response:', response2.status, data2);
    console.log('✓ Missing field test completed\n');

    // Test 3: Invalid email format
    console.log('3. Testing with invalid email');
    const response3 = await fetch(`${API_URL}/api/book-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+12345678900',
        message: 'Test message',
        interests: ['Fertility Support'],
        newsletterOptIn: false,
      }),
    });

    const data3 = await response3.json();
    console.log('Response:', response3.status, data3);
    console.log('✓ Invalid email test completed\n');

    // Test 4: Empty interests array
    console.log('4. Testing with empty interests array');
    const response4 = await fetch(`${API_URL}/api/book-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Jane',
        lastName: 'Doe',
        email: testEmail,
        phone: '+12345678900',
        message: 'Test message',
        interests: [],
        newsletterOptIn: false,
      }),
    });

    const data4 = await response4.json();
    console.log('Response:', response4.status, data4);
    console.log('✓ Empty interests test completed\n');

    // Test 5: Duplicate booking (same email as test 1)
    console.log('5. Testing duplicate booking');
    const response5 = await fetch(`${API_URL}/api/book-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Jane',
        lastName: 'Smith',
        email: testEmail,
        phone: '+19876543210',
        message: 'Updated message',
        interests: ['Acupuncture for Wellness'],
        newsletterOptIn: false,
      }),
    });

    const data5 = await response5.json();
    console.log('Response:', response5.status, data5);
    console.log('✓ Duplicate booking test completed\n');

    console.log('All tests completed successfully! ✅');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testBookSession();
