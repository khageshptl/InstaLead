import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for the Public Contact Intelligence Platform (PCIP) — a research and educational project.",
};

export default function PrivacyPolicyPage() {
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
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
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
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              Research Project
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: <strong>{lastUpdated}</strong>
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="prose prose-sm max-w-none space-y-10 text-foreground">

          {/* Research Notice */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <h2 className="text-base font-semibold text-primary mb-2">
              ⚠️ Research & Educational Purpose Notice
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Public Contact Intelligence Platform (PCIP) is a{" "}
              <strong>student research and academic study project</strong>. It is
              not a commercial product. This platform was built solely to study
              how publicly available business contact information is structured
              and indexed across social media and websites. No data is sold,
              shared with third parties, or used for commercial gain.
            </p>
          </div>

          <Section title="1. Who We Are">
            <p>
              PCIP (Public Contact Intelligence Platform) is an academic and
              research-oriented web application. It is operated by an individual
              student/researcher for the purpose of studying publicly available
              data on the internet. This is not a registered business entity and
              does not offer commercial services.
            </p>
            <p className="mt-3">
              For questions about this policy, contact us at:{" "}
              <strong>[your-email@example.com]</strong>
            </p>
          </Section>

          <Section title="2. What Data We Collect">
            <Subsection title="2.1 Data About You (Platform Users)">
              <p>When you create an account, we collect:</p>
              <ul>
                <li>Your name and email address (for authentication)</li>
                <li>Hashed password (we never store your plain-text password)</li>
                <li>Account creation date and login timestamps</li>
                <li>Search history (what usernames / URLs you searched)</li>
              </ul>
            </Subsection>
            <Subsection title="2.2 Data We Retrieve From Third-Party Sources">
              <p>
                When you run a search, the platform fetches publicly visible
                information from third-party websites (e.g., Instagram, company
                websites). This includes:
              </p>
              <ul>
                <li>
                  Business email addresses intentionally displayed on public
                  profiles
                </li>
                <li>Phone numbers listed on public business profiles</li>
                <li>Business addresses listed publicly</li>
                <li>Website URLs linked from public profiles</li>
                <li>Publicly visible bio text</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground border-l-2 border-border pl-4">
                <strong>Important:</strong> We only retrieve data that has been
                voluntarily and intentionally made public by the profile owner.
                We do not access private profiles, private messages, or any
                data behind authentication.
              </p>
            </Subsection>
            <Subsection title="2.3 Technical Data">
              <p>We automatically collect standard technical data including:</p>
              <ul>
                <li>IP address (for rate limiting and security)</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and actions taken (audit log)</li>
              </ul>
            </Subsection>
          </Section>

          <Section title="3. How We Use Your Data">
            <p>We use your data solely for the following purposes:</p>
            <ul>
              <li>To authenticate you and maintain your session</li>
              <li>To process and display your search results</li>
              <li>To enforce usage limits and prevent abuse</li>
              <li>
                To study patterns in how publicly listed contact data is
                structured (academic research only)
              </li>
              <li>To improve the research platform</li>
            </ul>
            <p className="mt-3 font-medium">
              We do NOT:
            </p>
            <ul>
              <li>Sell your personal data to anyone</li>
              <li>Share your data with third-party advertisers</li>
              <li>Use your data for any commercial purpose</li>
              <li>Send unsolicited marketing emails</li>
            </ul>
          </Section>

          <Section title="4. Legal Basis for Processing (GDPR)">
            <p>
              If you are located in the European Economic Area (EEA), we
              process your personal data under the following legal bases:
            </p>
            <ul>
              <li>
                <strong>Contract performance:</strong> Processing your account
                data to provide the platform service you signed up for
              </li>
              <li>
                <strong>Legitimate interest:</strong> Security, fraud
                prevention, and platform improvement
              </li>
              <li>
                <strong>Consent:</strong> For any optional data processing you
                explicitly agree to
              </li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground border-l-2 border-border pl-4">
              For third-party data collected (public business emails, etc.), we
              rely on <strong>legitimate interest</strong> — accessing publicly
              displayed business contact information for research and study
              purposes, in a manner consistent with the expectations of business
              account owners who voluntarily publish such information.
            </p>
          </Section>

          <Section title="5. Data Storage & Retention">
            <ul>
              <li>
                Your account data is stored in a secure database. Passwords are
                hashed using industry-standard bcrypt.
              </li>
              <li>
                Search results and collected contacts are stored and linked to
                your account.
              </li>
              <li>
                You may delete your account at any time, which will remove all
                associated data.
              </li>
              <li>
                We retain audit logs for a maximum of <strong>90 days</strong>{" "}
                for security purposes.
              </li>
              <li>
                This is a research project — data is not retained for commercial
                purposes and will be deleted when the research study concludes.
              </li>
            </ul>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement reasonable technical and organizational measures to
              protect your data, including:
            </p>
            <ul>
              <li>Encrypted database connections (TLS)</li>
              <li>Hashed passwords (bcrypt)</li>
              <li>Rate limiting to prevent brute-force attacks</li>
              <li>Audit logging for all sensitive actions</li>
              <li>Session-based authentication with secure cookies</li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              However, no system is 100% secure. As a research project running
              in a non-production environment, we recommend not storing sensitive
              personal information on this platform.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>
              Depending on your location, you may have the following rights:
            </p>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of the personal data we
                hold about you
              </li>
              <li>
                <strong>Correction:</strong> Ask us to correct inaccurate data
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and
                all associated data
              </li>
              <li>
                <strong>Portability:</strong> Request an export of your data in
                a machine-readable format
              </li>
              <li>
                <strong>Objection:</strong> Object to certain types of
                processing
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <strong>[your-email@example.com]</strong>. We will respond within
              30 days.
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>We use cookies and similar storage only for:</p>
            <ul>
              <li>Session authentication (required for login to work)</li>
              <li>
                Remembering your theme preference (dark/light mode) — stored
                locally in your browser
              </li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              We do not use tracking cookies, advertising cookies, or
              third-party analytics cookies.
            </p>
          </Section>

          <Section title="9. Third-Party Services">
            <p>
              This platform fetches data from third-party websites (Instagram,
              company websites, etc.) as part of its core research function.
              These third parties have their own privacy policies:
            </p>
            <ul>
              <li>
                <a
                  href="https://privacycenter.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Instagram / Meta Privacy Policy
                </a>
              </li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              We are not affiliated with, endorsed by, or partnered with
              Instagram, Meta, or any other third-party platform.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              This platform is intended for adults (18+) engaged in research or
              educational activities. We do not knowingly collect personal data
              from children under 13. If you believe we have inadvertently
              collected data from a child, contact us immediately.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy as the research project evolves.
              Changes will be posted on this page with an updated date. Your
              continued use of the platform after changes constitutes acceptance
              of the updated policy.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              For any privacy-related questions, requests, or concerns, contact:
            </p>
            <div className="rounded-lg border border-border bg-card p-4 mt-3 text-sm">
              <p>
                <strong>PCIP Research Project</strong>
              </p>
              <p>
                Email:{" "}
                <strong>[your-email@example.com]</strong>
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
            <Link href="/privacy" className="hover:text-foreground transition-colors font-medium text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
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

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-base font-medium text-foreground mb-2">{title}</h3>
      <div className="text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}
