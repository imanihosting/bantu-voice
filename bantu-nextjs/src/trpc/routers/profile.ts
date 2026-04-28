import { z } from "zod";

import { prisma } from "@/lib/db";
import { getSignedImageUrl } from "@/lib/storage";
import { authProcedure, createTRPCRouter } from "../init";

export const profileRouter = createTRPCRouter({
  getProfile: authProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: ctx.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        street: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    // If image is an S3 key (not a URL), generate a signed URL
    let imageUrl = user.image;
    if (imageUrl && !imageUrl.startsWith("http")) {
      try {
        imageUrl = await getSignedImageUrl(imageUrl);
      } catch {
        imageUrl = null;
      }
    }

    return { ...user, image: imageUrl };
  }),

  updateProfile: authProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").optional(),
        phone: z.string().optional().nullable(),
        street: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        postalCode: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await prisma.user.update({
        where: { id: ctx.userId },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.phone !== undefined && { phone: input.phone }),
          ...(input.street !== undefined && { street: input.street }),
          ...(input.city !== undefined && { city: input.city }),
          ...(input.state !== undefined && { state: input.state }),
          ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
          ...(input.country !== undefined && { country: input.country }),
        },
        select: {
          id: true,
          name: true,
          phone: true,
          street: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
        },
      });

      return updated;
    }),
});
