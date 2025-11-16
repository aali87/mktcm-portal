# Newsletter Subscription API

## Endpoint

`POST /api/newsletter/subscribe`

## Description

Handles newsletter signups from the Framer website footer form. Integrates with Brevo API to create contacts and send welcome emails.

## CORS Configuration

The endpoint accepts requests from:
- `https://awesome-stick-193250.framer.app` (Framer website)
- `https://www.fertilityflowmethod.com`
- `https://fertilityflowmethod.com`
- Local development: `http://localhost:3000`

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "email": "user@example.com"
}
```

## Response

### Success (200 OK)
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

### Already Subscribed (200 OK)
```json
{
  "success": true,
  "message": "You are already subscribed to our newsletter!"
}
```

### Invalid Email (400 Bad Request)
```json
{
  "success": false,
  "error": "Invalid email format"
}
```

### Missing Email (400 Bad Request)
```json
{
  "success": false,
  "error": "Email is required"
}
```

### Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "error": "Failed to subscribe to newsletter"
}
```

## Brevo Integration

### Configuration
- **List ID**: 5 (Newsletter Subscribers)
- **Welcome Email Template ID**: 1

### Workflow
1. Validate email format
2. Create or update contact in Brevo (List ID: 5)
3. Send welcome email using Template ID: 1
4. Return success response

### Error Handling
- Duplicate contacts are handled gracefully with an update
- Welcome email failures don't cause the subscription to fail
- All errors are logged to console for debugging

## Environment Variables

Required environment variable in Railway:

```bash
BREVO_API_KEY=your_brevo_api_key_here
```

## Testing

### Local Testing
```bash
# Start dev server
npm run dev

# Run test script
npx tsx scripts/test-newsletter.ts
```

### Production Testing
```bash
curl -X POST https://your-railway-app.railway.app/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Testing from Framer

In your Framer form submission code:

```javascript
fetch('https://your-railway-app.railway.app/api/newsletter/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: emailInput.value })
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Subscribed successfully:', data.message);
      // Show success message to user
    } else {
      console.error('Subscription failed:', data.error);
      // Show error message to user
    }
  })
  .catch(error => {
    console.error('Network error:', error);
    // Show generic error message
  });
```

## Security

- Email validation prevents invalid submissions
- CORS restricts access to allowed domains
- API key is stored securely in environment variables
- No authentication required (public endpoint)

## Monitoring

Check Railway logs for:
- Successful subscriptions: `Contact created/updated successfully`
- Welcome emails: `Welcome email sent successfully`
- Errors: `Brevo contact creation error` or `Newsletter subscription error`

## Rate Limiting

Consider adding rate limiting in production to prevent abuse:
- Use Vercel/Railway rate limiting features
- Or implement custom rate limiting middleware
