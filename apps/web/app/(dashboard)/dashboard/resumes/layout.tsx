import { ResumeDialogs } from "./_components/resume-dialogs";

export default function ResumesLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <>
      {children}
      <ResumeDialogs />
    </>
  );
}
