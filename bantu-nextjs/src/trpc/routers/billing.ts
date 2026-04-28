import { createTRPCRouter, orgProcedure } from "../init";

export const billingRouter = createTRPCRouter({
  getStatus: orgProcedure.query(async () => {
    return {
      hasActiveSubscription: true,
      customerId: null,
      estimatedCostCents: 0,
    };
  }),
});
