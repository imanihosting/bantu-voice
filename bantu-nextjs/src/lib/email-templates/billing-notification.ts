import { baseLayout } from "./base-layout";

interface BillingNotificationVars {
  name: string;
  event: "payment_success" | "payment_failed" | "subscription_renewed" | "subscription_cancelled" | "trial_ending";
  planName?: string;
  amount?: string;
  nextBillingDate?: string;
  dashboardUrl: string;
}

const eventMessages: Record<BillingNotificationVars["event"], { title: string; description: string }> = {
  payment_success: {
    title: "Payment Received",
    description: "Your payment has been processed successfully.",
  },
  payment_failed: {
    title: "Payment Failed",
    description: "We were unable to process your payment. Please update your payment method to avoid service interruption.",
  },
  subscription_renewed: {
    title: "Subscription Renewed",
    description: "Your subscription has been renewed successfully.",
  },
  subscription_cancelled: {
    title: "Subscription Cancelled",
    description: "Your subscription has been cancelled. You will continue to have access until the end of your current billing period.",
  },
  trial_ending: {
    title: "Trial Ending Soon",
    description: "Your free trial is ending soon. Upgrade to a paid plan to continue using TaurAI without interruption.",
  },
};

export function billingNotificationEmail(vars: BillingNotificationVars) {
  const msg = eventMessages[vars.event];

  const html = baseLayout(`
    <h1>${msg.title}</h1>
    <p>Hi ${vars.name},</p>
    <p>${msg.description}</p>
    ${vars.planName || vars.amount || vars.nextBillingDate ? `
    <div style="margin: 20px 0;">
      ${vars.planName ? `<div class="info-row">
        <span class="info-label">Plan:</span>
        <span class="info-value">${vars.planName}</span>
      </div>` : ""}
      ${vars.amount ? `<div class="info-row">
        <span class="info-label">Amount:</span>
        <span class="info-value">${vars.amount}</span>
      </div>` : ""}
      ${vars.nextBillingDate ? `<div class="info-row">
        <span class="info-label">Next Billing:</span>
        <span class="info-value">${vars.nextBillingDate}</span>
      </div>` : ""}
    </div>` : ""}
    <div class="btn-container">
      <a href="${vars.dashboardUrl}" class="btn">${vars.event === "payment_failed" ? "Update Payment Method" : "View Billing"}</a>
    </div>
    <hr class="divider" />
    <p class="muted">If you have questions about your billing, please contact our support team.</p>
  `);

  return {
    subject: `${msg.title} - TaurAI`,
    html,
  };
}
