import { NextResponse } from "next/server";
import { z } from "zod";

import { sendMail } from "@/lib/email";
import { contactFormEmail } from "@/lib/email-templates";
import { env } from "@/lib/env";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, email, subject, message } = parsed.data;

    const template = contactFormEmail({ name, email, subject, message });

    await sendMail({
      to: env.MS_GRAPH_SENDER_EMAIL,
      subject: template.subject,
      html: template.html,
      replyTo: email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Failed to send contact form email:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 },
    );
  }
}
