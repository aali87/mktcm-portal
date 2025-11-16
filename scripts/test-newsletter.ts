/**
 * Test script for newsletter subscription endpoint
 *
 * Usage:
 *   npx tsx scripts/test-newsletter.ts
 */

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testNewsletterSubscription() {
  console.log('Testing newsletter subscription endpoint...\n');

  const testEmail = `test-${Date.now()}@example.com`;

  try {
    console.log(`1. Testing with valid email: ${testEmail}`);
    const response1 = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });

    const data1 = await response1.json();
    console.log('Response:', response1.status, data1);
    console.log('✓ Valid email test completed\n');

    // Test 2: Invalid email
    console.log('2. Testing with invalid email format');
    const response2 = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'invalid-email' }),
    });

    const data2 = await response2.json();
    console.log('Response:', response2.status, data2);
    console.log('✓ Invalid email test completed\n');

    // Test 3: Missing email
    console.log('3. Testing with missing email');
    const response3 = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data3 = await response3.json();
    console.log('Response:', response3.status, data3);
    console.log('✓ Missing email test completed\n');

    // Test 4: Duplicate subscription
    console.log('4. Testing duplicate subscription (same email as test 1)');
    const response4 = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });

    const data4 = await response4.json();
    console.log('Response:', response4.status, data4);
    console.log('✓ Duplicate subscription test completed\n');

    console.log('All tests completed successfully! ✅');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testNewsletterSubscription();
