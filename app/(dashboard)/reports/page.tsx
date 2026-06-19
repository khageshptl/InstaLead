"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Report {
  id: string;
  title: string;
  createdAt: string;
  content: Record<string, unknown>;
  aiInsights?: {
    businessSummary?: string;
    industryClassification?: string;
    contactRecommendations?: string[];
    outreachSuggestions?: string[];
  };
  search: {
    inputType: string;
    inputValue: string;
    status: string;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => setReports(d.reports || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">View generated intelligence reports</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                No reports yet. Generate one from a completed search.
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card
                key={report.id}
                className={`cursor-pointer transition-colors ${selected?.id === report.id ? "border-primary" : "hover:bg-accent/50"}`}
                onClick={() => setSelected(report)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{report.title}</CardTitle>
                  <CardDescription>{formatDate(report.createdAt)}</CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <Card>
              <CardHeader>
                <CardTitle>{selected.title}</CardTitle>
                <CardDescription>
                  {selected.search.inputValue} ·{" "}
                  <Link href={`/search/${(selected.content as { search?: { id?: string } }).search?.id || ""}`} className="text-primary hover:underline">
                    View search
                  </Link>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selected.aiInsights && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2">Business Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        {selected.aiInsights.businessSummary}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Industry</h3>
                      <p className="text-sm">{selected.aiInsights.industryClassification}</p>
                    </div>
                    {selected.aiInsights.contactRecommendations && (
                      <div>
                        <h3 className="font-semibold mb-2">Contact Recommendations</h3>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {selected.aiInsights.contactRecommendations.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selected.aiInsights.outreachSuggestions && (
                      <div>
                        <h3 className="font-semibold mb-2">Outreach Suggestions</h3>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {selected.aiInsights.outreachSuggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                {!selected.aiInsights && (
                  <p className="text-sm text-muted-foreground">
                    Report is being generated. Refresh in a moment.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Select a report to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
