# Vercel Environment Variables Setup

This document lists the required environment variables for the production deployment on Vercel.

## Required Environment Variables

### Kit.com (Newsletter Integration)

**Variable:** `KIT_API_KEY`
**Description:** API key from Kit.com (formerly ConvertKit) for newsletter subscriptions
**Where to get it:** Kit.com Dashboard → Settings → Advanced → API & Webhooks
**Example:** `dbq0hwh_3cpe-4j35GLYYg`

**Variable:** `KIT_API_BASE_URL` (Optional)
**Description:** Base URL for Kit API
**Default:** `https://api.kit.com/v4`
**Note:** Only set this if you need to use a different API version

### Cloudflare Turnstile (CAPTCHA)

**Variable:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
**Description:** Public site key for Cloudflare Turnstile CAPTCHA
**Where to get it:** Cloudflare Dashboard → Turnstile → Your Site → Settings
**Note:** Must start with `NEXT_PUBLIC_` to be accessible in browser

**Variable:** `TURNSTILE_SECRET_KEY`
**Description:** Secret key for server-side Turnstile verification
**Where to get it:** Cloudflare Dashboard → Turnstile → Your Site → Settings
**Note:** Keep this secret, server-side only

### Mailgun (Contact Form - if using)

**Variable:** `MAILGUN_API_KEY`
**Description:** API key for Mailgun email service
**Where to get it:** Mailgun Dashboard → Settings → API Keys

**Variable:** `MAILGUN_DOMAIN`
**Description:** Verified domain for sending emails
**Example:** `mg.yourdomain.com`

## How to Add Variables to Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. Add each variable:
   - Enter the **Key** (e.g., `KIT_API_KEY`)
   - Enter the **Value** (your actual key)
   - Select environments: Production, Preview, Development
5. Click **Save**
6. **Redeploy** your application for changes to take effect

## Testing Configuration

After adding environment variables, you can verify they're working by:

1. Visit: `https://yourdomain.com/api/health`
2. Check the response to see which variables are configured
3. The response will show `true` for configured variables (without revealing actual values)

Example response:
```json
{
  "timestamp": "2025-01-26T...",
  "environment": "production",
  "configured": {
    "kitApi": true,
    "kitApiLength": 25,
    "kitBaseUrl": true,
    "turnstileSecret": true,
    "turnstileSiteKey": true
  },
  "values": {
    "kitBaseUrl": "https://api.kit.com/v4"
  }
}
```

## Troubleshooting

### "Kit API is not configured" error

**Cause:** `KIT_API_KEY` is not set in Vercel
**Solution:**
1. Add the variable in Vercel dashboard
2. Redeploy the application
3. Check `/api/health` to verify

### Newsletter form not working

**Checklist:**
- [ ] `KIT_API_KEY` is set in Vercel
- [ ] `TURNSTILE_SECRET_KEY` is set in Vercel
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set in Vercel
- [ ] Application has been redeployed after adding variables
- [ ] Check Vercel deployment logs for errors

### How to check logs

1. Go to Vercel project dashboard
2. Click on **Deployments**
3. Click on the latest deployment
4. Click on **Functions** tab
5. Look for errors in the logs
