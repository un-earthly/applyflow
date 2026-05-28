"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, CreditCard } from "lucide-react";

const SEAT_PRICE = 15; // per seat per month

export default function TeamBillingPage(): React.ReactElement {
  const { user } = useAuth();
  const [seats, setSeats] = useState(5);
  const [addingSeats, setAddingSeats] = useState(false);
  const [additionalSeats, setAdditionalSeats] = useState(1);

  const handleAddSeats = async () => {
    if (!user) return;
    setAddingSeats(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ flow: "add_seats", quantity: seats + additionalSeats }),
      });
      const { url } = (await res.json()) as { url: string };
      if (url) window.location.href = url;
    } finally {
      setAddingSeats(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Team billing</h2>
        <p className="text-muted-foreground text-sm">Manage seats and billing for your team.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />Seats
            </CardTitle>
            <CardDescription>Active seats in your plan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{seats}</p>
            <p className="text-muted-foreground text-sm">of {seats} seats used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />Monthly cost
            </CardTitle>
            <CardDescription>Billed monthly</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${seats * SEAT_PRICE}</p>
            <p className="text-muted-foreground text-sm">${SEAT_PRICE} per seat</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="max-w-sm space-y-4">
        <div>
          <h3 className="font-medium">Add seats</h3>
          <p className="text-muted-foreground text-sm">Each additional seat is ${SEAT_PRICE}/mo. Changes are prorated.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="additional-seats">Number of seats to add</Label>
          <Input
            id="additional-seats"
            type="number"
            min={1}
            max={100}
            value={additionalSeats}
            onChange={(e) => setAdditionalSeats(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
        <p className="text-muted-foreground text-sm">
          New monthly total: <strong>${(seats + additionalSeats) * SEAT_PRICE}/mo</strong>
        </p>
        <Button onClick={handleAddSeats} disabled={addingSeats}>
          {addingSeats ? "Redirecting…" : "Add seats via Stripe"}
        </Button>
      </div>
    </div>
  );
}
