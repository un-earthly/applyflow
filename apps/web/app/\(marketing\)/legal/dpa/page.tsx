export default function DPAPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="mb-2 text-3xl font-bold">Data Processing Agreement</h1>
      <p className="text-muted-foreground mb-8 text-sm">Last updated: May 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
          <p>
            This Data Processing Agreement (&quot;DPA&quot;) is entered into between ApplyFlow, Inc. (&quot;Data Processor&quot;) and the entity using ApplyFlow services (&quot;Data Controller&quot;).
          </p>
          <p>
            This DPA supplements the Terms of Service and governs the processing of personal data in accordance with GDPR, CCPA, and other applicable data protection laws.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">2. Scope</h2>
          <p>
            This DPA applies to all processing of personal data by ApplyFlow on behalf of the Data Controller when using our platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">3. Processing Details</h2>
          <h3 className="font-semibold text-foreground mt-4 mb-2">3.1 Types of Personal Data</h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Contact information (name, email, phone)</li>
            <li>Resume data (work history, education, skills)</li>
            <li>Application information (companies, roles, dates)</li>
            <li>Communication logs (messages, notes)</li>
            <li>Usage analytics and performance data</li>
          </ul>

          <h3 className="font-semibold text-foreground mt-4 mb-2">3.2 Purpose of Processing</h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Providing the ApplyFlow service</li>
            <li>Improving service quality and user experience</li>
            <li>Compliance with legal obligations</li>
            <li>Fraud prevention and security</li>
            <li>Analytics and service optimization</li>
          </ul>

          <h3 className="font-semibold text-foreground mt-4 mb-2">3.3 Duration</h3>
          <p>
            Processing continues for the duration of your subscription and for a reasonable period afterward for compliance and backup purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Controller Rights</h2>
          <p>
            The Data Controller retains all rights over personal data, including:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Right to access personal data</li>
            <li>Right to rectification</li>
            <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">5. Processor Obligations</h2>
          <p>
            ApplyFlow commits to:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Process data only as instructed by the Data Controller</li>
            <li>Implement appropriate security measures</li>
            <li>Maintain confidentiality of personal data</li>
            <li>Assist with data subject rights requests</li>
            <li>Provide information about processing activities</li>
            <li>Delete or return data upon request</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">6. Sub-processors</h2>
          <p>
            ApplyFlow may use the following sub-processors to provide the service:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Google Cloud Platform (hosting)</li>
            <li>Firebase (authentication and database)</li>
            <li>Stripe (payment processing)</li>
            <li>SendGrid (email delivery)</li>
            <li>OpenAI (AI processing)</li>
          </ul>
          <p className="mt-3">
            Data Controller will be notified of any changes to sub-processors at least 30 days in advance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">7. Security Measures</h2>
          <p>
            ApplyFlow implements technical and organizational measures including:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Encryption of data in transit (TLS) and at rest</li>
            <li>Access controls and authentication</li>
            <li>Regular security audits</li>
            <li>Incident response procedures</li>
            <li>Employee data protection training</li>
            <li>Backup and disaster recovery</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">8. Data Transfers</h2>
          <p>
            Personal data is processed in the United States. For international transfers, ApplyFlow complies with applicable data protection laws and implements Standard Contractual Clauses where required.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">9. Data Deletion</h2>
          <p>
            Upon account termination or request, ApplyFlow will delete personal data within 30 days, except where:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Required by law to retain</li>
            <li>Necessary for fraud prevention or security</li>
            <li>Requested in backup storage (deleted within 90 days)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">10. Assistance with Data Subject Rights</h2>
          <p>
            ApplyFlow will, at no cost, assist Data Controllers in responding to data subject requests within 10 business days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">11. Breach Notification</h2>
          <p>
            ApplyFlow will notify Data Controller of any confirmed personal data breach within 24 hours of discovery, including:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Nature and scope of breach</li>
            <li>Data affected</li>
            <li>Likely consequences</li>
            <li>Measures taken or proposed</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">12. Audit Rights</h2>
          <p>
            Data Controller has the right to audit ApplyFlow's compliance with this DPA, including on-site inspections with reasonable notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">13. Liability</h2>
          <p>
            Each party's liability for breach of this DPA is subject to the limitations in the Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">14. Contact</h2>
          <p>
            For DPA inquiries or to exercise data rights, contact:
          </p>
          <p className="mt-2">
            <strong>Data Protection Officer</strong><br />
            ApplyFlow, Inc.<br />
            Email: privacy@applyflow.app
          </p>
        </section>

        <section>
          <p className="text-sm italic mt-6">
            This DPA is effective as of the date you start using ApplyFlow and continues for the duration of our business relationship.
          </p>
        </section>
      </div>
    </div>
  );
}
