"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Globe, Building2, Tag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const inputTypes = [
  {
    value: "INSTAGRAM_USERNAME",
    label: "Instagram",
    icon: Search,
    placeholder: "@username or username",
    description: "Analyze a public Instagram profile",
  },
  {
    value: "WEBSITE_URL",
    label: "Website",
    icon: Globe,
    placeholder: "https://example.com",
    description: "Analyze a public website",
  },
  {
    value: "COMPANY_NAME",
    label: "Company",
    icon: Building2,
    placeholder: "Acme Corporation",
    description: "Discover company intelligence",
  },
  {
    value: "BRAND_NAME",
    label: "Brand",
    icon: Tag,
    placeholder: "Brand Name",
    description: "Search by brand name",
  },
] as const;

export default function SearchPage() {
  const router = useRouter();
  const [inputType, setInputType] = useState<string>("INSTAGRAM_USERNAME");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = inputTypes.find((t) => t.value === inputType)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputType, inputValue: inputValue.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Search failed");
        return;
      }

      toast.success("Search started successfully");
      router.push(`/search/${data.search.id}`);
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search Workspace</h1>
        <p className="text-muted-foreground mt-1">
          Discover publicly available business contact information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Search</CardTitle>
          <CardDescription>
            Only public information will be collected. Private or hidden data is never accessed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {inputTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setInputType(type.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                    inputType === type.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {type.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{selected.description}</Label>
              <Input
                placeholder={selected.placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Starting search..." : "Start Search"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
