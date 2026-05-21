import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface ResumeContent {
  basics?: {
    name?: string;
    label?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: { city?: string; region?: string; country?: string };
    profiles?: { network?: string; url?: string; username?: string }[];
  };
  work?: {
    company?: string;
    role?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    highlights?: string[];
  }[];
  education?: {
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
  }[];
  skills?: { name?: string; level?: string }[];
  projects?: { name?: string; description?: string; url?: string; highlights?: string[] }[];
  certifications?: { name?: string; issuer?: string; date?: string }[];
  languages?: { language?: string; fluency?: string }[];
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    color: "#1a1a2e",
    lineHeight: 1.4,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
    color: "#111827",
  },
  label: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
    fontSize: 9,
    color: "#374151",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 10,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#3730a3",
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#c7d2fe",
    paddingBottom: 2,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  entryMeta: {
    fontSize: 9,
    color: "#6b7280",
  },
  entrySubtitle: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 3,
  },
  entryBody: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 2,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1,
  },
  bulletDot: {
    width: 10,
    fontSize: 9,
    color: "#6b7280",
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: "#374151",
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillChip: {
    backgroundColor: "#ede9fe",
    color: "#4c1d95",
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  entryBlock: {
    marginBottom: 8,
  },
  summary: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 14,
    lineHeight: 1.5,
  },
});

function dateRange(start?: string, end?: string, current?: boolean): string {
  const s = start ?? "";
  const e = current ? "Present" : (end ?? "");
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

export function ResumePDF({ resume, name }: { resume: ResumeContent; name: string }) {
  const b = resume.basics ?? {};
  const locationStr = [b.location?.city, b.location?.region, b.location?.country]
    .filter(Boolean)
    .join(", ");

  const linkedInProfile = b.profiles?.find((p) => p.network?.toLowerCase() === "linkedin");

  return (
    <Document title={name} author={b.name}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        {b.name ? <Text style={styles.name}>{b.name}</Text> : null}
        {b.label ? <Text style={styles.label}>{b.label}</Text> : null}

        <View style={styles.contactRow}>
          {b.email ? <Text>{b.email}</Text> : null}
          {b.phone ? <Text>{b.phone}</Text> : null}
          {locationStr ? <Text>{locationStr}</Text> : null}
          {b.url ? <Text>{b.url}</Text> : null}
          {linkedInProfile?.url ? <Text>{linkedInProfile.url}</Text> : null}
        </View>

        <View style={styles.divider} />

        {/* Summary */}
        {b.summary ? <Text style={styles.summary}>{b.summary}</Text> : null}

        {/* Work */}
        {resume.work && resume.work.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.work.map((job, i) => (
              <View key={i} style={styles.entryBlock}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{job.role ?? ""}</Text>
                  <Text style={styles.entryMeta}>{dateRange(job.startDate, job.endDate, job.current)}</Text>
                </View>
                <Text style={styles.entrySubtitle}>
                  {job.company ?? ""}
                  {job.location ? `  ·  ${job.location}` : ""}
                </Text>
                {job.description ? <Text style={styles.entryBody}>{job.description}</Text> : null}
                {job.highlights?.map((h, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{h}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {resume.education && resume.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, i) => (
              <View key={i} style={styles.entryBlock}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.institution ?? ""}</Text>
                  <Text style={styles.entryMeta}>{dateRange(edu.startDate, edu.endDate)}</Text>
                </View>
                <Text style={styles.entrySubtitle}>
                  {[edu.degree, edu.field].filter(Boolean).join(", ")}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {resume.skills.map((s, i) => (
                <Text key={i} style={styles.skillChip}>{s.name ?? ""}</Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((p, i) => (
              <View key={i} style={styles.entryBlock}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{p.name ?? ""}</Text>
                  {p.url ? <Text style={styles.entryMeta}>{p.url}</Text> : null}
                </View>
                {p.description ? <Text style={styles.entryBody}>{p.description}</Text> : null}
                {p.highlights?.map((h, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{h}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((c, i) => (
              <View key={i} style={styles.entryBlock}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{c.name ?? ""}</Text>
                  {c.date ? <Text style={styles.entryMeta}>{c.date}</Text> : null}
                </View>
                {c.issuer ? <Text style={styles.entrySubtitle}>{c.issuer}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Languages */}
        {resume.languages && resume.languages.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.skillsRow}>
              {resume.languages.map((l, i) => (
                <Text key={i} style={styles.skillChip}>
                  {l.language ?? ""}{l.fluency ? ` (${l.fluency})` : ""}
                </Text>
              ))}
            </View>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
