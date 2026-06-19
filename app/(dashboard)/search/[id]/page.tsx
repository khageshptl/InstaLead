"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bookmark, FileText, RefreshCw, Mail, Phone, MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface Contact {
  id: string;
  type: string;
  value: string;
  label?: string;
  source: string;
  sourceUrl?: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidenceScore: number;
}

interface SearchData {
  id: string;
  inputType: string;
  inputValue: string;
  status: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  profile?: {
    displayName?: string;
    username?: string;
    bio?: string;
    websiteUrl?: string;
    businessCategory?: string;
    location?: string;
    hasContactButton: boolean;
    profileImageUrl?: string;
    followerCount?: number;
    rawData?: {
      followingCount?: number;
      postCount?: number;
      highlightCount?: number;
      isVerified?: boolean;
      isBusinessAccount?: boolean;
      isProfessionalAccount?: boolean;
      businessContactMethod?: string;
      categoryEnum?: string;
      bioLinks?: Array<{ title?: string; url?: string }>;
      businessAddress?: {
        street_address?: string;
        city_name?: string;
        zip_code?: string;
      };
    };
  };
  website?: {
    url: string;
    title?: string;
    description?: string;
    contactPageUrl?: string;
    aboutPageUrl?: string;
  };
  contacts: Contact[];
}

const contactIcons: Record<string, typeof Mail> = {
  EMAIL: Mail,
  PHONE: Phone,
  ADDRESS: MapPin,
  SOCIAL: Share2,
};

export default function SearchDetailPage() {
  const params = useParams();
  const [search, setSearch] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSearch = useCallback(async () => {
    const res = await fetch(`/api/searches/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setSearch(data.search);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchSearch();
    const interval = setInterval(() => {
      if (search?.status === "QUEUED" || search?.status === "PROCESSING") {
        fetchSearch();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchSearch, search?.status]);

  const saveLead = async () => {
    if (!search) return;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchId: search.id }),
    });
    if (res.ok) {
      toast.success("Lead saved");
    } else {
      toast.error("Failed to save lead");
    }
  };

  const generateReport = async () => {
    if (!search) return;
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchId: search.id }),
    });
    if (res.ok) {
      toast.success("Report generation started");
    } else {
      toast.error("Failed to generate report");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  if (!search) {
    return <div className="text-center py-12 text-muted-foreground">Search not found</div>;
  }

  const isProcessing = search.status === "QUEUED" || search.status === "PROCESSING";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/search"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{search.inputValue}</h1>
          <p className="text-sm text-muted-foreground">
            {search.inputType.replace(/_/g, " ")} · {formatDate(search.createdAt)}
          </p>
        </div>
        <Badge variant={search.status === "COMPLETED" ? "HIGH" : search.status === "FAILED" ? "LOW" : "MEDIUM"}>
          {search.status}
        </Badge>
      </div>

      {isProcessing && (
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <p>Processing search — collecting public information...</p>
          </CardContent>
        </Card>
      )}

      {search.errorMessage && (
        <Card className="border-destructive/50">
          <CardContent className="py-4 text-destructive text-sm">{search.errorMessage}</CardContent>
        </Card>
      )}

      {search.status === "COMPLETED" && (
        <div className="flex gap-3">
          <Button onClick={saveLead} variant="outline">
            <Bookmark className="h-4 w-4" /> Save Lead
          </Button>
          <Button onClick={generateReport} variant="outline">
            <FileText className="h-4 w-4" /> Generate Report
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {search.profile && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {search.profile.profileImageUrl && (
                <img
                  src={search.profile.profileImageUrl}
                  alt={search.profile.displayName || search.profile.username || "Profile"}
                  className="h-16 w-16 rounded-full border border-border mb-2"
                />
              )}
              {search.profile.displayName && <p><strong>Name:</strong> {search.profile.displayName}</p>}
              {search.profile.username && <p><strong>Username:</strong> @{search.profile.username}</p>}
              {search.profile.bio && <p><strong>Bio:</strong> {search.profile.bio}</p>}
              {search.profile.websiteUrl && (
                <p>
                  <strong>Website:</strong>{" "}
                  <a href={search.profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {search.profile.websiteUrl}
                  </a>
                </p>
              )}
              {search.profile.businessCategory && <p><strong>Category:</strong> {search.profile.businessCategory}</p>}
              {search.profile.location && <p><strong>Location:</strong> {search.profile.location}</p>}
              {search.profile.followerCount != null && (
                <p><strong>Followers:</strong> {search.profile.followerCount.toLocaleString()}</p>
              )}
              {search.profile.rawData?.followingCount != null && (
                <p><strong>Following:</strong> {search.profile.rawData.followingCount.toLocaleString()}</p>
              )}
              {search.profile.rawData?.postCount != null && (
                <p><strong>Posts:</strong> {search.profile.rawData.postCount.toLocaleString()}</p>
              )}
              {search.profile.rawData?.highlightCount != null && (
                <p><strong>Highlights:</strong> {search.profile.rawData.highlightCount}</p>
              )}
              {search.profile.rawData?.isVerified && <p><strong>Verified:</strong> Yes</p>}
              {search.profile.rawData?.isBusinessAccount && <p><strong>Business account:</strong> Yes</p>}
              {search.profile.rawData?.isProfessionalAccount && <p><strong>Professional account:</strong> Yes</p>}
              {search.profile.rawData?.businessContactMethod && (
                <p><strong>Contact method:</strong> {search.profile.rawData.businessContactMethod}</p>
              )}
              {search.profile.hasContactButton && <p><strong>Public contact button:</strong> Available</p>}
              {search.profile.rawData?.bioLinks && search.profile.rawData.bioLinks.length > 0 && (
                <div>
                  <strong>Bio links:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {search.profile.rawData.bioLinks.map((link, i) => (
                      <li key={i}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {link.title || link.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {search.website && (
          <Card>
            <CardHeader>
              <CardTitle>Website Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {search.website.title && <p><strong>Title:</strong> {search.website.title}</p>}
              {search.website.description && <p><strong>Description:</strong> {search.website.description}</p>}
              {search.website.contactPageUrl && <p><strong>Contact:</strong> {search.website.contactPageUrl}</p>}
              {search.website.aboutPageUrl && <p><strong>About:</strong> {search.website.aboutPageUrl}</p>}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public Contacts ({search.contacts.length})</CardTitle>
          <CardDescription>Only publicly displayed contact information</CardDescription>
        </CardHeader>
        <CardContent>
          {search.contacts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No public contacts found yet.</p>
          ) : (
            <div className="space-y-3">
              {search.contacts.map((contact) => {
                const Icon = contactIcons[contact.type] || Mail;
                return (
                  <div key={contact.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{contact.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {contact.label || contact.type} · {contact.source}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {(contact.confidenceScore * 100).toFixed(0)}%
                      </span>
                      <Badge variant={contact.confidence}>{contact.confidence}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
