import { redirect } from "next/navigation";

export default function TeamSettingsPage(): never {
  redirect("/dashboard/settings/team/members");
}
