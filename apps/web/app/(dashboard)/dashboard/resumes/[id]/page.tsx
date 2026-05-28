import { redirect } from "next/navigation";

export default function ResumeIndexPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/resumes/${params.id}/edit`);
}
