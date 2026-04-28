import { baseLayout } from "./base-layout";

interface PasswordChangedVars {
  name: string;
  changedAt: string;
  ipAddress?: string;
}

export function passwordChangedEmail(vars: PasswordChangedVars) {
  const html = baseLayout(`
    <h1>Your password was changed</h1>
    <p>Hi ${vars.name},</p>
    <p>This is a confirmation that the password for your TaurAI account was successfully changed.</p>
    <div style="margin: 20px 0;">
      <div class="info-row">
        <span class="info-label">Date &amp; Time:</span>
        <span class="info-value">${vars.changedAt}</span>
      </div>
      ${vars.ipAddress ? `<div class="info-row">
        <span class="info-label">IP Address:</span>
        <span class="info-value">${vars.ipAddress}</span>
      </div>` : ""}
    </div>
    <div class="alert-box">
      <p><strong>Didn't make this change?</strong> If you did not change your password, your account may have been compromised. Please reset your password immediately and contact our support team.</p>
    </div>
    <hr class="divider" />
    <p class="muted">This is an automated security notification from TaurAI.</p>
  `);

  return {
    subject: "Your password was changed - TaurAI",
    html,
  };
}
