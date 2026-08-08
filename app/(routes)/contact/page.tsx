"use client";

import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, MessageCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const contactInfo = [
    {
        icon: Mail,
        title: "Email us",
        body: "hello@gardenfairy.com",
        sub: "We reply within 24 hours",
    },
    {
        icon: Phone,
        title: "Call us",
        body: "+234 800 000 0000",
        sub: "Mon–Sat, 9am – 6pm",
    },
    {
        icon: MapPin,
        title: "Visit us",
        body: "12 Admiralty Way, Lekki",
        sub: "Lagos, Nigeria",
    },
];

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        // simulate request
        await new Promise((r) => setTimeout(r, 600));
        setLoading(false);
        setSubmitted(true);
        setForm({ name: "", email: "", subject: "", message: "" });
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
                    Questions about a plant, a planner, or your order? Drop us a line.
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
                                    Thanks! Your message has been sent.
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    We&apos;ll get back to you shortly.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="mt-4 text-xs font-medium text-primary hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm font-medium">Subject</label>
                                    <input
                                        required
                                        value={form.subject}
                                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm font-medium">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
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
