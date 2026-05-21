"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, MoreHorizontal, Mail, Shield, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Role = "admin" | "member";

interface Member {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: "active" | "pending";
  joinedAt: string;
}

const MOCK_MEMBERS: Member[] = [
  { id: "1", email: "you@example.com", name: "You", role: "admin", status: "active", joinedAt: "2025-01-01" },
];

export default function TeamMembersPage(): React.ReactElement {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!user || !inviteEmail) return;
    setInviting(true);
    try {
      const token = await user.getIdToken();
      await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      setMembers((prev) => [
        ...prev,
        { id: Date.now().toString(), email: inviteEmail, name: inviteEmail, role: inviteRole, status: "pending", joinedAt: new Date().toISOString() },
      ]);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = (memberId: string, role: Role) => {
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role } : m));
  };

  const handleRemove = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Team members</h2>
          <p className="text-muted-foreground text-sm">Manage who has access to your workspace.</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger render={<Button size="sm"><UserPlus className="mr-2 h-4 w-4" />Invite member</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a team member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Email address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => v && setInviteRole(v as Role)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin — full access</SelectItem>
                    <SelectItem value="member">Member — can view and apply</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
                {inviting ? "Sending…" : "Send invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium">
                    {member.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-muted-foreground text-xs">{member.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={member.role}
                  onValueChange={(v) => v && handleRoleChange(member.id, v as Role)}
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Admin</span>
                    </SelectItem>
                    <SelectItem value="member">
                      <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Member</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {member.status === "active"
                  ? <Badge variant="secondary" className="text-xs">Active</Badge>
                  : <Badge variant="outline" className="text-muted-foreground text-xs"><Mail className="mr-1 h-3 w-3" />Pending</Badge>
                }
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(member.joinedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>} />
                  <DropdownMenuContent align="end">
                    {member.status === "pending" && (
                      <DropdownMenuItem>Resend invite</DropdownMenuItem>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          Remove member
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            They will lose access to the workspace immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleRemove(member.id)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
