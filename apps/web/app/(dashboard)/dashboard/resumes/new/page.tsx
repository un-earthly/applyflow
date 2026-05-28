import { redirect } from "next/navigation";

export default function NewResumePage() {
  redirect("/dashboard/resumes?new=1");
}
