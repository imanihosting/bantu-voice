import { baseLayout } from "./base-layout";

interface SecurityAlertVars {
  name: string;
  event: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  loginUrl: string;
}

export function securityAlertEmail(vars: SecurityAlertVars) {
  const html = baseLayout(`
    <h1>Security Alert</h1>
    <p>Hi ${vars.name},</p>
    <p>We detected the following activity on your TaurAI account:</p>
    <div class="alert-box">
      <p><strong>${vars.event}</strong></p>
    </div>
    <div style="margin: 20px 0;">
      <div class="info-row">
        <span class="info-label">Date &amp; Time:</span>
        <span class="info-value">${vars.timestamp}</span>
      </div>
      ${vars.ipAddress ? `<div class="info-row">
        <span class="info-label">IP Address:</span>
        <span class="info-value">${vars.ipAddress}</span>
      </div>` : ""}
      ${vars.userAgent ? `<div class="info-row">
        <span class="info-label">Device:</span>
        <span class="info-value">${vars.userAgent}</span>
      </div>` : ""}
    </div>
    <p>If this was you, no further action is needed. If you do not recognize this activity, we recommend securing your account immediately.</p>
    <div class="btn-container">
      <a href="${vars.loginUrl}" class="btn">Review Account Security</a>
    </div>
    <hr class="divider" />
    <p class="muted">This is an automated security notification from TaurAI.</p>
  `);

  return {
    subject: `Security Alert: ${vars.event} - TaurAI`,
    html,
  };
}
