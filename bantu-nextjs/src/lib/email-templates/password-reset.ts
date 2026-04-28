import { baseLayout } from "./base-layout";

interface PasswordResetVars {
  name: string;
  resetUrl: string;
}

export function passwordResetEmail(vars: PasswordResetVars) {
  const html = baseLayout(`
    <h1>Reset your password</h1>
    <p>Hi ${vars.name},</p>
    <p>We received a request to reset your TaurAI account password. Click the button below to set a new password. This link will expire in 1 hour.</p>
    <div class="btn-container">
      <a href="${vars.resetUrl}" class="btn">Reset Password</a>
    </div>
    <hr class="divider" />
    <p class="muted">If the button above doesn't work, copy and paste this URL into your browser:</p>
    <p class="muted" style="word-break: break-all;">${vars.resetUrl}</p>
    <p class="muted">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  `);

  return {
    subject: "Reset your password - TaurAI",
    html,
  };
}
