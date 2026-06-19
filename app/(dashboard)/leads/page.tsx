"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface Lead {
  id: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  search: {
    id: string;
    inputType: string;
    inputValue: string;
    contacts: Array<{
      type: string;
      value: string;
      confidence: "HIGH" | "MEDIUM" | "LOW";
      confidenceScore: number;
    }>;
    profile?: { displayName?: string };
    website?: { title?: string };
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async (search?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/leads?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads);
    }
    setLoading(false);
  };

  const handleExport = async (format: string) => {
    const res = await fetch("/api/exports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format }),
    });
    if (res.ok) {
      toast.success(`${format} export started`);
    } else {
      toast.error("Export failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Explorer</h1>
          <p className="text-muted-foreground mt-1">Manage your saved leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("CSV")}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("EXCEL")}>
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("JSON")}>
            <Download className="h-4 w-4" /> JSON
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Filter leads..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            fetchLeads(e.target.value);
          }}
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No saved leads yet. Save leads from your search results.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const topContact = lead.search.contacts[0];
            const name =
              lead.search.profile?.displayName ||
              lead.search.website?.title ||
              lead.search.inputValue;

            return (
              <Link key={lead.id} href={`/search/${lead.search.id}`}>
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{name}</CardTitle>
                      {topContact && (
                        <Badge variant={topContact.confidence}>
                          {topContact.confidence}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {lead.search.inputType.replace(/_/g, " ")} · {formatDate(lead.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{lead.search.contacts.length} contacts</span>
                      {lead.tags.length > 0 && (
                        <div className="flex gap-1">
                          {lead.tags.map((tag) => (
                            <Badge key={tag} variant="default">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      {lead.notes && <span className="truncate max-w-xs">{lead.notes}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
