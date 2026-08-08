"use client";

import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, MessageCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settings.store";
import { toast } from "@/store/toast.store";
import { api, ApiError } from "@/lib/api";

export default function ContactPage() {
  const settings = useSettingsStore((s) => s.settings);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactInfo = [
    {
      icon: Mail,
      title: "Email us",
      body: settings?.supportEmail || "hello@gardenfairy.com",
      sub: "We reply within 24 hours",
    },
    {
      icon: Phone,
      title: "Call us",
      body: settings?.phone || "+234 123 456 7890",
      sub: "Mon–Sat, 9am – 6pm",
    },
    {
      icon: MapPin,
      title: "Visit us",
      body: "12 Admiralty Way, Lekki",
      sub: "Lagos, Nigeria",
    },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api<{ message: string; id?: string }>("/contact", {
        method: "POST",
        json: {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        },
      });

      setLoading(false);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent", res?.message || "We will get back to you shortly!");
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof ApiError ? err.message : "Failed to send message";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-primary">
          Get in touch
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">
          We&apos;d love to hear from you
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Questions about a plant, a space planner, or your order? Drop us a line.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Info cards */}
        <div className="space-y-4">
          {contactInfo.map((c) => (
            <Card key={c.title} className="border-muted">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="text-sm">{c.body}</p>
                  <p className="text-xs text-muted-foreground">{c.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card className="lg:col-span-2 border-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Send us a message
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-md border border-primary/30 bg-primary/10 p-6 text-center">
                <p className="text-sm font-semibold text-primary">
                  Thanks! Your message has been received.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Our team has been notified and will reply via email shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Adaeze Adeleke"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ada@example.com"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <input
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Plant care question, delivery inquiry..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us more about how we can help you..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {error ? (
                  <div className="sm:col-span-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-md">
                    {error}
                  </div>
                ) : null}

                <div className="sm:col-span-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending message...
                      </>
                    ) : (
                      "Send message"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
