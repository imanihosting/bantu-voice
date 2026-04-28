import { baseLayout } from "./base-layout";

interface EmailVerificationVars {
  name: string;
  verificationUrl: string;
}

export function emailVerificationEmail(vars: EmailVerificationVars) {
  const html = baseLayout(`
    <h1>Verify your email address</h1>
    <p>Hi ${vars.name},</p>
    <p>Please verify your email address to complete your TaurAI account setup. This link will expire in 24 hours.</p>
    <div class="btn-container">
      <a href="${vars.verificationUrl}" class="btn">Verify Email Address</a>
    </div>
    <hr class="divider" />
    <p class="muted">If the button above doesn't work, copy and paste this URL into your browser:</p>
    <p class="muted" style="word-break: break-all;">${vars.verificationUrl}</p>
    <p class="muted">If you did not create a TaurAI account, you can safely ignore this email.</p>
  `);

  return {
    subject: "Verify your email address - TaurAI",
    html,
  };
}
