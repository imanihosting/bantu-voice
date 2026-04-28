import { baseLayout } from "./base-layout";

interface ContactFormVars {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function contactFormEmail(vars: ContactFormVars) {
  const html = baseLayout(`
    <h1>New Contact Form Submission</h1>
    <p>A visitor has submitted the contact form on the TaurAI website.</p>
    <div style="margin: 20px 0;">
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">${vars.name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value"><a href="mailto:${vars.email}" style="color: #18181b;">${vars.email}</a></span>
      </div>
      <div class="info-row">
        <span class="info-label">Subject:</span>
        <span class="info-value">${vars.subject}</span>
      </div>
    </div>
    <hr class="divider" />
    <h2 style="font-size: 16px; font-weight: 600; color: #18181b; margin: 0 0 12px;">Message</h2>
    <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #3f3f46;">${vars.message}</div>
    <hr class="divider" />
    <p class="muted">You can reply directly to this email to respond to <strong>${vars.name}</strong>.</p>
  `);

  return {
    subject: `Contact Form: ${vars.subject}`,
    html,
  };
}
