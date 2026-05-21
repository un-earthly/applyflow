"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, MessageCircle, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // In a real app, this would send to a backend API
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Get in touch
        </h1>
        <p className="text-lg text-muted-foreground">
          Have a question, feature request, or just want to say hi? We'd love to hear from you.
        </p>
      </section>

      {/* Contact Options */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Mail className="h-6 w-6 text-primary mb-2" />
              <CardTitle className="text-base">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <a
                href="mailto:support@applyflow.app"
                className="text-primary hover:underline text-sm font-medium"
              >
                support@applyflow.app
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageCircle className="h-6 w-6 text-primary mb-2" />
              <CardTitle className="text-base">Discord</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Join our community for real-time support and feature discussions.
              </p>
              <a
                href="https://discord.gg/applyflow"
                className="text-primary hover:underline text-sm font-medium"
              >
                Join our Discord
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted && (
              <Alert className="mb-6 bg-primary/10 text-primary border-primary/20">
                <Send className="h-4 w-4" />
                <AlertDescription>
                  Thanks for reaching out! We'll be in touch soon.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Teaser */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Didn't find what you needed?</h2>
          <p className="text-muted-foreground mb-6">
            Check out our frequently asked questions or browse the documentation.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/#faq" className="text-primary hover:underline font-medium">
              View FAQ
            </a>
            <span className="text-muted-foreground">•</span>
            <a href="https://docs.applyflow.app" className="text-primary hover:underline font-medium">
              Read docs
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
