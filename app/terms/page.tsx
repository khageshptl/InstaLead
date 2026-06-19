import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for the Public Contact Intelligence Platform (PCIP) — a research and educational project.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "June 19, 2026";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              PC
            </div>
            <span className="font-semibold">PCIP</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-border bg-card/50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              Research Project
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: <strong>{lastUpdated}</strong>
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-10 text-foreground">

          {/* Research Notice */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <h2 className="text-base font-semibold text-primary mb-2">
              ⚠️ Research & Educational Purpose Notice
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Public Contact Intelligence Platform (PCIP) is built and
              maintained as a{" "}
              <strong>personal research and academic study project</strong>. It
              is not a commercial service. By using this platform, you
              acknowledge that it is provided &quot;as-is&quot; for educational
              and research exploration only, with no warranties of any kind.
            </p>
          </div>

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using the PCIP platform (&quot;Service&quot;),
              you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you do not agree to all of these Terms, do
              not use the Service.
            </p>
            <p className="mt-3">
              These Terms apply to all users of the Service, including users who
              create accounts and use the platform&apos;s search features.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              PCIP is a research tool that retrieves and organizes{" "}
              <strong>publicly available</strong> business contact information
              from:
            </p>
            <ul>
              <li>Public Instagram business profiles</li>
              <li>Company websites</li>
              <li>Publicly listed social media pages</li>
            </ul>
            <p className="mt-3">
              The Service is designed exclusively for{" "}
              <strong>research, academic study, and personal learning</strong>.
              It is not intended for commercial lead generation, mass emailing,
              or any form of spam.
            </p>
          </Section>

          <Section title="3. Eligibility">
            <p>You must be at least 18 years old to use this Service.</p>
            <p className="mt-3">
              By registering, you confirm that all information you provide is
              accurate and that you will comply with these Terms and all
              applicable laws.
            </p>
          </Section>

          <Section title="4. Permitted Use">
            <p>You may use this Service only for lawful purposes. Permitted uses include:</p>
            <ul>
              <li>Academic or student research into public data structures</li>
              <li>
                Personal study of how public contact information is indexed on
                the web
              </li>
              <li>Non-commercial exploration of publicly available information</li>
              <li>
                Verifying your own business&apos;s publicly visible contact
                information
              </li>
            </ul>
          </Section>

          <Section title="5. Prohibited Use">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 mb-4">
              <p className="text-sm font-medium text-destructive">
                Violation of these prohibitions may result in immediate account
                termination and could expose you to legal liability.
              </p>
            </div>
            <p>You expressly agree <strong>NOT</strong> to use this Service to:</p>
            <ul>
              <li>
                Send unsolicited commercial emails (spam) to any email addresses
                collected via the platform
              </li>
              <li>
                Harass, stalk, or contact individuals using data retrieved from
                the platform
              </li>
              <li>
                Violate any applicable privacy law (GDPR, CCPA, CAN-SPAM, CASL,
                etc.)
              </li>
              <li>
                Sell, license, or redistribute contact data obtained through the
                platform to any third party
              </li>
              <li>
                Use the platform for automated bulk data collection (scraping)
                beyond individual searches
              </li>
              <li>
                Circumvent or attempt to circumvent any rate limits, access
                controls, or security measures
              </li>
              <li>
                Access or attempt to access other users&apos; accounts or data
              </li>
              <li>
                Use the platform for any commercial lead generation or marketing
                purpose
              </li>
              <li>
                Impersonate any person or entity, or misrepresent your
                affiliation with any person or entity
              </li>
              <li>
                Use the Service in any manner that violates Instagram&apos;s,
                Meta&apos;s, or any other third-party platform&apos;s Terms of
                Service
              </li>
            </ul>
          </Section>

          <Section title="6. User Responsibility for Data Use">
            <p>
              The platform retrieves publicly visible information. However, you
              — the user — are solely responsible for how you use any
              information obtained through the Service.
            </p>
            <p className="mt-3">
              Specifically, you acknowledge that:
            </p>
            <ul>
              <li>
                You will comply with all applicable anti-spam laws before
                contacting anyone whose information you retrieved
              </li>
              <li>
                You will comply with GDPR or other applicable data protection
                laws if you store or process personal data from the platform
              </li>
              <li>
                The operator of PCIP is not liable for any misuse of data you
                retrieve through the Service
              </li>
              <li>
                Business contact data is retrieved for research purposes; any
                actual outreach you conduct is entirely your own responsibility
              </li>
            </ul>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              The PCIP platform, its code, design, and branding are owned by
              the project creator. You may not copy, reproduce, or create
              derivative works from the platform without explicit permission.
            </p>
            <p className="mt-3">
              Data retrieved by the platform from third-party sources (Instagram
              profiles, websites) belongs to the respective third-party owners.
              PCIP does not claim ownership of any retrieved data.
            </p>
          </Section>

          <Section title="8. No Affiliation with Instagram / Meta">
            <p>
              PCIP is an independent research project. It is{" "}
              <strong>
                not affiliated with, endorsed by, sponsored by, or partnered
                with Instagram, Meta Platforms Inc.
              </strong>
              , or any other social media company.
            </p>
            <p className="mt-3">
              Instagram and Meta are trademarks of Meta Platforms, Inc. Their
              mention is solely for descriptive purposes.
            </p>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR
              IMPLIED.
            </p>
            <p className="mt-3">
              As a research project, we do not warrant that:
            </p>
            <ul>
              <li>The Service will be available at all times</li>
              <li>
                Data retrieved is accurate, complete, or up-to-date (public
                profile data changes frequently)
              </li>
              <li>The Service will be error-free or uninterrupted</li>
              <li>
                Results will be suitable for any particular purpose
              </li>
            </ul>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, the PCIP
              project creator shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use
              of the Service.
            </p>
            <p className="mt-3">
              In no event shall our total liability to you exceed the amount you
              paid to use the Service in the twelve months preceding the claim
              (which, for a free research tool, is $0).
            </p>
          </Section>

          <Section title="11. Account Termination">
            <p>
              We reserve the right to suspend or terminate your account at any
              time, with or without notice, if:
            </p>
            <ul>
              <li>You violate any of these Terms</li>
              <li>We reasonably suspect misuse or abuse of the platform</li>
              <li>
                We decide to shut down the research project
              </li>
            </ul>
            <p className="mt-3">
              You may also delete your account at any time via the Settings
              page. Account deletion will permanently remove all your data.
            </p>
          </Section>

          <Section title="12. Privacy">
            <p>
              Your use of the Service is also governed by our{" "}
              <Link
                href="/privacy"
                className="text-primary underline hover:opacity-80 transition-opacity"
              >
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. Please
              read it carefully.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We may update these Terms as the research project evolves. Changes
              will be posted on this page with an updated date. Your continued
              use of the Service after changes constitutes your acceptance of
              the updated Terms.
            </p>
          </Section>

          <Section title="14. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of India, without regard to conflict of law principles.
              Any disputes shall be subject to the exclusive jurisdiction of the
              courts located in India.
            </p>
          </Section>

          <Section title="15. Contact">
            <p>
              For any questions about these Terms, contact:
            </p>
            <div className="rounded-lg border border-border bg-card p-4 mt-3 text-sm">
              <p>
                <strong>PCIP Research Project</strong>
              </p>
              <p>
                Email: <strong>[your-email@example.com]</strong>
              </p>
              <p className="text-muted-foreground mt-1">
                This is an academic/research project. Response times may vary.
              </p>
            </div>
          </Section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="mx-auto max-w-4xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PCIP — Research Project. Public data only.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors font-medium text-foreground">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}
