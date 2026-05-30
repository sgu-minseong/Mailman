import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Inbox,
  Sliders,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  Search,
  AlertTriangle,
  MailCheck,
  BookOpen,
  CheckCircle2,
  Mail,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DEPARTMENTS,
  getInbox,
  nameFromEmail,
  relativeTimeKST,
  type MailItem,
} from "@/lib/getInbox";
import { MailDetailPanel } from "@/components/MailDetailPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mailman · AI 자동 배정 콘솔" },
      { name: "description", content: "대학 행정 메일을 AI가 부서로 자동 배정하는 백오피스 콘솔." },
      { property: "og:title", content: "Mailman · AI 자동 배정 콘솔" },
      { property: "og:description", content: "대학 행정 메일을 AI가 부서로 자동 배정하는 백오피스 콘솔." },
    ],
  }),
  component: Index,
});

type TabKey = "all" | "replied" | "review";

function Index() {
  const [items, setItems] = useState<MailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const [deptId, setDeptId] = useState<string>("academic_records");
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function refresh() {
    const { items, usedFallback } = await getInbox();
    setItems(items);
    setUsedFallback(usedFallback);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, []);

  const deptName = DEPARTMENTS.find((d) => d.id === deptId)?.name ?? "";

  const deptItems = useMemo(
    () =>
      items.filter(
        (it) => it.department_inbox_visible && it.assigned_department_id === deptId,
      ),
    [items, deptId],
  );

  const reviewCount = deptItems.filter((i) => i.needs_review).length;
  const repliedCount = deptItems.filter((i) => i.auto_ack_sent).length;

  const filtered = useMemo(() => {
    let list = deptItems;
    if (tab === "replied") list = list.filter((i) => i.auto_ack_sent);
    if (tab === "review") list = list.filter((i) => i.needs_review);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.subject?.toLowerCase().includes(q) ||
          i.from_email?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [deptItems, tab, search]);

  const selected = items.find((i) => i.message_id === selectedId) ?? null;

  function reassign(messageId: string, newDeptId: string) {
    const dept = DEPARTMENTS.find((d) => d.id === newDeptId);
    setItems((prev) =>
      prev.map((i) =>
        i.message_id === messageId
          ? {
              ...i,
              assigned_department_id: newDeptId,
              assigned_department_name: dept?.name,
            }
          : i,
      ),
    );
    setSelectedId(null);
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
          <div className="flex items-center gap-2.5 px-5 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Mail className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-bold">Mailman</div>
              <div className="text-[11px] text-muted-foreground">AI 자동 배정 콘솔</div>
            </div>
          </div>
          <nav className="space-y-1 px-3 pt-2">
            <NavItem icon={Inbox} label="받은편지함" active />
            <NavItem icon={Sliders} label="규칙 및 AI" />
            <NavItem icon={BarChart3} label="분석" />
          </nav>
          <div className="mt-auto px-4 py-4 text-[11px] text-muted-foreground">
            데모 모드 · 실제 메일은 발송되지 않음
          </div>
        </aside>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-card/60 px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="사이드바 토글"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </button>
            <div className="text-sm text-muted-foreground">
              Mailman · <span className="font-medium text-foreground">{deptName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">담당 부서</span>
            <Select value={deptId} onValueChange={setDeptId}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-8">
          {usedFallback && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              실시간 API 연결 실패 — 샘플 데이터로 표시 중
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{deptName} 받은 메일함</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              AI가 우리 부서로 배정한 학생 이메일과 자동 회신 상태를 확인하세요.
            </p>
          </div>

          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SummaryCard
              icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
              iconBg="bg-orange-100"
              label="확인 필요"
              value={reviewCount}
            />
            <SummaryCard
              icon={<MailCheck className="h-5 w-5 text-primary" />}
              iconBg="bg-primary/15"
              label="자동 회신 완료"
              value={repliedCount}
            />
          </div>

          {/* Tabs + search */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-muted p-1">
              <TabPill active={tab === "all"} onClick={() => setTab("all")}>
                전체
              </TabPill>
              <TabPill active={tab === "replied"} onClick={() => setTab("replied")}>
                회신 완료
              </TabPill>
              <TabPill active={tab === "review"} onClick={() => setTab("review")}>
                확인 필요
              </TabPill>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="발신자, 제목 검색..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">학생</th>
                  <th className="px-5 py-3 font-medium">제목</th>
                  <th className="px-5 py-3 font-medium">담당 부서</th>
                  <th className="px-5 py-3 font-medium">수신</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                  <th className="px-5 py-3 font-medium">자동 회신</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-sm text-muted-foreground">
                      이 조건에 해당하는 메일이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filtered.map((it) => {
                    const pct = Math.round((it.confidence ?? 0) * 100);
                    const low = (it.confidence ?? 0) < 0.7;
                    return (
                      <tr
                        key={it.message_id}
                        onClick={() => setSelectedId(it.message_id)}
                        className={cn(
                          "cursor-pointer border-b border-border transition last:border-0 hover:bg-primary/8",
                          it.needs_review && "bg-orange-50/40",
                        )}
                        style={
                          {
                            // hover color via inline since arbitrary class
                          }
                        }
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-foreground">
                            {nameFromEmail(it.from_email)}
                          </div>
                          <div className="text-xs text-muted-foreground">{it.from_email}</div>
                        </td>
                        <td className="px-5 py-4 text-foreground">{it.subject}</td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                              low
                                ? "bg-orange-100 text-orange-700"
                                : "bg-primary/15 text-foreground",
                            )}
                          >
                            <BookOpen className="h-3 w-3" />
                            {it.assigned_department_name} · {pct}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {relativeTimeKST(it.received_at_kst)}
                        </td>
                        <td className="px-5 py-4">
                          {it.assignment_status === "assigned" && (
                            <Badge
                              variant="outline"
                              className="gap-1 border-primary/40 bg-primary/8 text-foreground"
                            >
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                              자동 배정 완료
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {it.auto_ack_sent ? (
                            <Badge
                              variant="outline"
                              className="gap-1 border-primary/40 bg-primary/8 text-foreground"
                            >
                              <Mail className="h-3 w-3 text-primary" />
                              자동 회신 완료
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-dashed text-muted-foreground">
                              미발송
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            데모 모드: 실제 메일은 발송되지 않습니다 · 30초마다 자동 새로고침
          </p>
        </main>
      </div>

      <MailDetailPanel
        item={selected}
        onClose={() => setSelectedId(null)}
        onReassign={reassign}
      />
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
        active
          ? "bg-primary/15 font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4">
      <div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
      </div>
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconBg)}>
        {icon}
      </div>
    </div>
  );
}

function TabPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
