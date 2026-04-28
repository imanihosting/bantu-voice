import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadImage, deleteObject, getSignedImageUrl } from "@/lib/storage";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  if (!user?.image) {
    return new Response(null, { status: 404 });
  }

  const signedUrl = await getSignedImageUrl(user.image);
  return new Response(null, {
    status: 302,
    headers: {
      Location: signedUrl,
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const contentType = file.type;
  if (!ALLOWED_TYPES.includes(contentType)) {
    return Response.json(
      { error: "Invalid file type. Use JPEG, PNG, or WebP." },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return Response.json(
      { error: "Image exceeds the 5 MB size limit." },
      { status: 413 },
    );
  }

  const ext = contentType.split("/")[1];
  const key = `avatars/${session.user.id}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadImage({ buffer, key, contentType });

    const imageUrl = await getSignedImageUrl(key);

    // Store the S3 key as the image value so we can generate signed URLs later
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: key },
    });

    return Response.json({ image: imageUrl });
  } catch {
    return Response.json(
      { error: "Failed to upload image. Please retry." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  if (user?.image) {
    try {
      await deleteObject(user.image);
    } catch {
      // Ignore S3 deletion errors — still clear DB reference
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: null },
  });

  return Response.json({ image: null });
}
