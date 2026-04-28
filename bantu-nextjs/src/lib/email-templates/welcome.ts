import { baseLayout } from "./base-layout";

interface WelcomeEmailVars {
  name: string;
  loginUrl: string;
}

export function welcomeEmail(vars: WelcomeEmailVars) {
  const html = baseLayout(`
    <h1>Welcome to TaurAI, ${vars.name}!</h1>
    <p>Your account has been created successfully. You now have access to our powerful text-to-speech and transcription platform.</p>
    <p>Here are a few things you can do to get started:</p>
    <ul style="font-size: 15px; line-height: 1.8; color: #3f3f46; padding-left: 20px;">
      <li>Generate speech from text with our AI voices</li>
      <li>Transcribe audio files with high accuracy</li>
      <li>Create custom voices for your projects</li>
      <li>Access our developer API for integrations</li>
    </ul>
    <div class="btn-container">
      <a href="${vars.loginUrl}" class="btn">Go to Dashboard</a>
    </div>
    <hr class="divider" />
    <p class="muted">If you did not create this account, please ignore this email or contact our support team.</p>
  `);

  return {
    subject: "Welcome to TaurAI - Your account is ready",
    html,
  };
}
