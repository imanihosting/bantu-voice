"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { Navbar } from "@/features/marketing/components/navbar";
import { Footer } from "@/features/marketing/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
});

type ContactValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactValues) {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send message");
      }

      setIsSubmitted(true);
      toast.success("Message sent successfully. We'll get back to you soon!");
      form.reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <section className="border-t border-white/10 bg-black py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Header */}
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-base text-white/60 sm:text-lg">
              Have a question, partnership enquiry, or need support? We&apos;d
              love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Contact info */}
            <div className="space-y-8 lg:col-span-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Contact Information
                </h2>
                <p className="text-sm leading-relaxed text-white/60">
                  Reach out to us directly or use the contact form. We aim to
                  respond to all enquiries within 24–48 hours.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <Mail className="size-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Email</p>
                    <a
                      href="mailto:support@taurai.ai"
                      className="text-sm text-amber-400 underline underline-offset-2 hover:text-amber-300"
                    >
                      support@taurai.ai
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs leading-relaxed text-white/40">
                  For urgent matters or security-related concerns, please
                  include &quot;URGENT&quot; or &quot;SECURITY&quot; in your
                  subject line and we will prioritise your request.
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:col-span-3">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
                    <Send className="size-6 text-emerald-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Message Sent
                  </h3>
                  <p className="mb-6 max-w-sm text-sm text-white/60">
                    Thank you for reaching out. We&apos;ll get back to you as
                    soon as possible.
                  </p>
                  <Button
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80">
                              Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your name"
                                className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">
                            Subject
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="What is this about?"
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">
                            Message
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us how we can help..."
                              rows={5}
                              className="resize-none border-white/10 bg-white/5 text-white placeholder:text-white/30"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 size-4" />
                      )}
                      Send Message
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
