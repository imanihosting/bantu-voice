import { baseLayout } from "./base-layout";

interface InvitationVars {
  inviterName: string;
  organizationName: string;
  inviteUrl: string;
  role?: string;
}

export function invitationEmail(vars: InvitationVars) {
  const html = baseLayout(`
    <h1>You've been invited to join TaurAI</h1>
    <p><strong>${vars.inviterName}</strong> has invited you to join <strong>${vars.organizationName}</strong> on TaurAI${vars.role ? ` as a <strong>${vars.role}</strong>` : ""}.</p>
    <p>TaurAI is a powerful text-to-speech and transcription platform. Accept the invitation below to get started.</p>
    <div class="btn-container">
      <a href="${vars.inviteUrl}" class="btn">Accept Invitation</a>
    </div>
    <hr class="divider" />
    <p class="muted">If the button above doesn't work, copy and paste this URL into your browser:</p>
    <p class="muted" style="word-break: break-all;">${vars.inviteUrl}</p>
    <p class="muted">This invitation will expire in 7 days. If you were not expecting this invitation, you can safely ignore this email.</p>
  `);

  return {
    subject: `${vars.inviterName} invited you to join ${vars.organizationName} on TaurAI`,
    html,
  };
}
