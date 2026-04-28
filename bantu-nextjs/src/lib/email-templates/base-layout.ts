/**
 * Base email layout wrapper used by all templates.
 * Provides consistent branding, responsive structure, and footer.
 */
export function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TaurAI</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #ffffff; border-radius: 12px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .logo { text-align: center; margin-bottom: 24px; }
    .logo img { height: 36px; }
    .logo-text { font-size: 24px; font-weight: 700; color: #18181b; letter-spacing: -0.5px; }
    h1 { font-size: 22px; font-weight: 600; color: #18181b; margin: 0 0 8px; }
    p { font-size: 15px; line-height: 1.6; color: #3f3f46; margin: 0 0 16px; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #18181b; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; }
    .btn:hover { background-color: #27272a; }
    .btn-container { text-align: center; margin: 24px 0; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 24px 0; }
    .muted { font-size: 13px; color: #71717a; }
    .footer { text-align: center; padding: 24px 0 0; }
    .footer p { font-size: 12px; color: #a1a1aa; margin: 4px 0; }
    .code-box { background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #18181b; margin: 20px 0; }
    .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f4f4f5; }
    .info-label { font-size: 13px; color: #71717a; min-width: 120px; }
    .info-value { font-size: 13px; color: #18181b; font-weight: 500; }
    .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .alert-box p { color: #991b1b; margin: 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <span class="logo-text">TaurAI</span>
      </div>
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} TaurAI. All rights reserved.</p>
      <p>This is an automated message. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
}
