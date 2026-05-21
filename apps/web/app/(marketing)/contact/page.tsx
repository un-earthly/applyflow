"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, CheckCircle2 } from "lucide-react";

export default function ContactPage(): React.ReactElement {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact us</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Email</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  For general inquiries, reach us at{" "}
                  <a href="mailto:hello@applyflow.app" className="text-primary hover:underline">
                    hello@applyflow.app
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Already a user? Log in and use the support link in your dashboard for faster
                  responses.
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            {sent ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold">Message sent</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We&apos;ll get back to you within 1-2 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
