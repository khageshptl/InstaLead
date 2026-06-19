import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [searchCount, leadCount, reportCount, recentSearches] = await Promise.all([
    prisma.search.count({ where: { userId: session.user.id } }),
    prisma.savedLead.count({ where: { userId: session.user.id } }),
    prisma.report.count({ where: { userId: session.user.id } }),
    prisma.search.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { contacts: true } } },
    }),
  ]);

  const subscription = session.user.organizationId
    ? await prisma.subscription.findUnique({
        where: { organizationId: session.user.organizationId },
      })
    : null;

  const stats = [
    { label: "Total Searches", value: searchCount, icon: Search },
    { label: "Saved Leads", value: leadCount, icon: Users },
    { label: "Reports", value: reportCount, icon: FileText },
    {
      label: "Searches Remaining",
      value: subscription
        ? subscription.searchesLimit - subscription.searchesUsed
        : "—",
      icon: TrendingUp,
    },
  ];

  const statusColor: Record<string, "HIGH" | "MEDIUM" | "LOW" | "default"> = {
    COMPLETED: "HIGH",
    PROCESSING: "MEDIUM",
    QUEUED: "MEDIUM",
    FAILED: "LOW",
    PENDING: "default",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.user.name || "there"}
          </p>
        </div>
        <Button asChild>
          <Link href="/search">New Search</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Searches</CardTitle>
          <CardDescription>Your latest intelligence gathering activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSearches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No searches yet.</p>
              <Button className="mt-4" asChild>
                <Link href="/search">Start your first search</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSearches.map((search) => (
                <Link
                  key={search.id}
                  href={`/search/${search.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium">{search.inputValue}</p>
                    <p className="text-sm text-muted-foreground">
                      {search.inputType.replace(/_/g, " ")} · {formatDate(search.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {search._count.contacts} contacts
                    </span>
                    <Badge variant={statusColor[search.status] || "default"}>
                      {search.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
