import { SENDER_NAME, unsubscribeUrl } from './resend'

interface BlogPostEmailArgs {
  postTitle: string
  postDescription: string
  postUrl: string
  unsubscribeToken: string
  firstName?: string | null
}

export function renderBlogPostEmail({
  postTitle,
  postDescription,
  postUrl,
  unsubscribeToken,
  firstName,
}: BlogPostEmailArgs): { subject: string; html: string; text: string } {
  const greeting = firstName ? `Hey ${escape(firstName)},` : 'Hey,'
  const unsubUrl = unsubscribeUrl(unsubscribeToken)

  const subject = postTitle

  const text = `${greeting}

I just published a new post:

${postTitle}

${postDescription}

Read it here: ${postUrl}

— ${SENDER_NAME}

---
Don't want these? Unsubscribe: ${unsubUrl}
`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(postTitle)}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111;border:1px solid #222;border-radius:8px;">
          <tr>
            <td style="padding:32px 32px 16px 32px;">
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#a3a3a3;">${greeting}</p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#d4d4d4;">I just published a new post. Thought you'd find it useful.</p>
              <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.3;font-weight:600;color:#ffffff;">
                <a href="${escape(postUrl)}" style="color:#ffffff;text-decoration:none;">${escape(postTitle)}</a>
              </h1>
              <p style="margin:0 0 32px 0;font-size:15px;line-height:1.6;color:#a3a3a3;">${escape(postDescription)}</p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:6px;background:#00d2ff;">
                    <a href="${escape(postUrl)}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#000000;text-decoration:none;border-radius:6px;">Read the post →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0 0;font-size:15px;line-height:1.6;color:#a3a3a3;">— ${SENDER_NAME}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #222;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#737373;">
                You're receiving this because you subscribed at <a href="https://www.tarekalaaddin.com" style="color:#737373;">tarekalaaddin.com</a>.
                <br>
                <a href="${escape(unsubUrl)}" style="color:#737373;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html, text }
}

interface WelcomeEmailArgs {
  unsubscribeToken: string
  firstName?: string | null
}

export function renderWelcomeEmail({ unsubscribeToken, firstName }: WelcomeEmailArgs): {
  subject: string
  html: string
  text: string
} {
  const greeting = firstName ? `Hey ${escape(firstName)},` : 'Hey,'
  const unsubUrl = unsubscribeUrl(unsubscribeToken)

  const subject = `Welcome — you're in`

  const text = `${greeting}

Thanks for subscribing to my newsletter.

You'll get an email whenever I publish a new post — mostly about AI engineering, automation, and self development. No spam, no fluff.

You can browse existing posts here: https://www.tarekalaaddin.com/blog

Talk soon,
${SENDER_NAME}

---
Changed your mind? Unsubscribe: ${unsubUrl}
`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Welcome</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111;border:1px solid #222;border-radius:8px;">
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#a3a3a3;">${greeting}</p>
              <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;font-weight:600;color:#ffffff;">Welcome — you're in.</h1>
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#d4d4d4;">Thanks for subscribing.</p>
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#d4d4d4;">
                You'll get an email whenever I publish a new post — mostly about AI engineering, automation, and self development. No spam, no fluff.
              </p>
              <p style="margin:0 0 32px 0;font-size:15px;line-height:1.6;color:#d4d4d4;">
                In the meantime, you can browse existing posts here:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:6px;background:#00d2ff;">
                    <a href="https://www.tarekalaaddin.com/blog" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#000000;text-decoration:none;border-radius:6px;">Browse the blog →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0 0;font-size:15px;line-height:1.6;color:#a3a3a3;">Talk soon,<br>${SENDER_NAME}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #222;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#737373;">
                <a href="${escape(unsubUrl)}" style="color:#737373;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html, text }
}

function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
