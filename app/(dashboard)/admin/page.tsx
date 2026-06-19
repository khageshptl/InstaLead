"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Users, Search, Activity } from "lucide-react";

interface AdminData {
  stats: { totalUsers: number; totalSearches: number };
  recentSearches: Array<{
    id: string;
    inputValue: string;
    status: string;
    createdAt: string;
    user: { email: string };
    _count: { contacts: number };
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    createdAt: string;
    user?: { email: string; name?: string };
    resource?: string;
  }>;
  subscriptions: Array<{
    plan: string;
    status: string;
    _count: { id: number };
  }>;
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => {
        if (!r.ok) throw new Error("Forbidden");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Access denied"));
  }, []);

  if (error) {
    return <div className="text-center py-12 text-destructive">{error}</div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">Platform management and monitoring</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Users</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Searches</CardDescription>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalSearches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Subscriptions</CardDescription>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {data.subscriptions.map((s) => (
                <div key={`${s.plan}-${s.status}`} className="flex justify-between text-sm">
                  <span>{s.plan} ({s.status})</span>
                  <span>{s._count.id}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentSearches.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <div>
                  <p className="font-medium">{s.inputValue}</p>
                  <p className="text-xs text-muted-foreground">{s.user.email}</p>
                </div>
                <Badge variant={s.status === "COMPLETED" ? "HIGH" : "MEDIUM"}>
                  {s.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>Recent platform activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.auditLogs.map((log) => (
              <div key={log.id} className="text-sm border-b border-border pb-2">
                <div className="flex justify-between">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {log.user?.email || "System"} · {log.resource || "—"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
