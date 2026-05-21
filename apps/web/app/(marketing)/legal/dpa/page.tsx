export default function DpaPage(): React.ReactElement {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Data Processing Agreement</h1>
        <p className="text-muted-foreground mb-8">Last updated: May 2026</p>

        <div className="space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Introduction</h2>
            <p>
              This Data Processing Agreement ("DPA") is entered into between ApplyFlow ("Processor")
              and the customer entity ("Controller") and forms part of the Terms of Service.
              This DPA applies where ApplyFlow processes personal data on behalf of the Controller.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Definitions</h2>
            <p>
              "Personal data," "data subject," "processing," and "controller" have the meanings
              given in applicable data protection law, including the GDPR where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Processing details</h2>
            <p>
              ApplyFlow processes personal data only on documented instructions from the Controller,
              including for transfers to third countries. Processing is limited to what is necessary
              to provide the ApplyFlow service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Sub-processors</h2>
            <p>
              ApplyFlow uses the following sub-processors: Google Firebase (infrastructure),
              Stripe (payments), OpenAI (AI features, opt-in only). Controller will be notified of
              any changes to this list with 30 days notice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Security</h2>
            <p>
              ApplyFlow implements appropriate technical and organizational measures to protect
              personal data, including encryption at rest and in transit, access controls, and
              regular security assessments.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Contact</h2>
            <p>
              For DPA-related inquiries, contact privacy@applyflow.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
