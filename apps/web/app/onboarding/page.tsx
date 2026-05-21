import { redirect } from "next/navigation";

export default function OnboardingIndexPage(): never {
  redirect("/onboarding/welcome");
}
