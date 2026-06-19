import Link from "next/link";
import {
  Search,
  Shield,
  BarChart3,
  FileText,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Search Workspace",
    description:
      "Analyze public Instagram profiles, websites, company names, and brand names to discover publicly available contact information.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "We only collect information intentionally made public. No hidden data, no private records, no unauthorized access.",
  },
  {
    icon: BarChart3,
    title: "Confidence Scoring",
    description:
      "Every contact is scored by source reliability — contact pages, footers, and official profiles rank highest.",
  },
  {
    icon: FileText,
    title: "Reports & Export",
    description:
      "Generate professional reports with AI insights. Export leads to CSV, Excel, or JSON.",
  },
];

const plans = [
  { name: "Free", price: "$0", searches: "50 searches/mo", features: ["Basic search", "Lead dashboard", "CSV export"] },
  { name: "Professional", price: "$49", searches: "500 searches/mo", features: ["All collectors", "AI insights", "Excel export", "Priority support"] },
  { name: "Enterprise", price: "Custom", searches: "Unlimited", features: ["Custom rate limits", "API access", "Dedicated support", "Audit logs"] },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              PC
            </div>
            <span className="font-semibold">PCIP</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground mb-6">
          Public data only · Privacy compliant
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          Public Contact
          <br />
          <span className="text-primary">Intelligence Platform</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
          Discover and organize publicly available business contact information
          from social media profiles and websites — ethically, legally, and
          transparently.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-card/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Core Features</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Modular collectors, confidence scoring, and AI-powered insights — built for teams that respect privacy.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.name === "Professional" ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  <CardDescription>{plan.searches}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={plan.name === "Professional" ? "default" : "outline"} asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Public Contact Intelligence Platform. Public data only.</p>
        </div>
      </footer>
    </div>
  );
}
