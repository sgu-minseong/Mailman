import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, Sparkles, Mail, Send, BookOpen, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS, nameFromEmail, relativeTimeKST, type MailItem } from "@/lib/getInbox";
import { cn } from "@/lib/utils";

type Props = {
  item: MailItem | null;
  onClose: () => void;
  onReassign: (messageId: string, newDeptId: string) => void;
};

export function MailDetailPanel({ item, onClose, onReassign }: Props) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (item) {
      setShowReply(false);
      setReplyText(`${nameFromEmail(item.from_email)}님께,\n\n`);
    }
  }, [item?.message_id]);

  if (!item) return null;

  const name = nameFromEmail(item.from_email);
  const confidencePct = Math.round((item.confidence ?? 0) * 100);
  const lowConfidence = (item.confidence ?? 0) < 0.7;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-[640px] overflow-y-auto border-l border-border bg-card shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card/95 px-7 py-5 backdrop-blur">
          <div className="min-w-0 flex-1">
            {item.needs_review && (
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                <AlertTriangle className="h-3.5 w-3.5" /> 확인 필요
              </div>
            )}
            <h2 className="text-xl font-semibold leading-snug text-foreground">
              {item.subject}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {name} · {item.from_email} · {relativeTimeKST(item.received_at_kst)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 border-primary/30 bg-primary/10 text-primary-foreground/90",
                  lowConfidence && "border-orange-300 bg-orange-50 text-orange-700",
                )}
              >
                <BookOpen className="h-3 w-3" />
                <span className="text-foreground">
                  {item.assigned_department_name ?? item.department_name} · {confidencePct}%
                </span>
              </Badge>
              {item.assignment_status === "assigned" && (
                <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/10 text-foreground">
                  <CheckCircle2 className="h-3 w-3 text-primary" /> 자동 배정 완료
                </Badge>
              )}
              {item.auto_ack_sent && (
                <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/10 text-foreground">
                  <Mail className="h-3 w-3 text-primary" /> 자동 회신 완료
                </Badge>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition hover:bg-primary/25"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 px-7 py-6">
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> 이메일 요약
            </h3>
            <div className="rounded-xl bg-primary/8 px-4 py-3 text-sm leading-relaxed text-foreground/90" style={{ background: "color-mix(in oklab, var(--primary) 10%, transparent)" }}>
              {item.mail_summary || item.body.slice(0, 200)}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-foreground">이메일 본문</h3>
            <div className="whitespace-pre-wrap rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground/90">
              {item.body}
            </div>
          </section>

          <section>
            <h3 className="mb-2 flex items-center justify-between text-sm font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-primary" /> 학생에게 전송된 자동 회신
              </span>
              {item.auto_ack_sent && (
                <span className="text-xs font-normal text-muted-foreground">
                  {relativeTimeKST(item.received_at_kst)}
                </span>
              )}
            </h3>
            {item.auto_ack_sent ? (
              <div className="whitespace-pre-wrap rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground/90">
                {item.auto_ack_body}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                자동 회신 없음
              </div>
            )}
          </section>

          <section className="space-y-4 border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground">처리</h3>

            <Button
              size="lg"
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setShowReply((v) => !v)}
            >
              <Send className="h-4 w-4" /> 직접 답장 쓰기
            </Button>

            {item.student_reply_sent ? (
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-foreground">
                학생 답장 완료
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground">
                <Badge variant="outline" className="mr-2 border-dashed text-muted-foreground">
                  답장 전송 예정
                </Badge>
                부서 답장 기능 준비 중
              </p>
            )}

            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">다른 부서로 옮기기:</label>
              <Select
                onValueChange={(val) => {
                  onReassign(item.message_id, val);
                  const dept = DEPARTMENTS.find((d) => d.id === val);
                  toast.success(`${dept?.name}(으)로 재배정되었습니다 (UI 데모)`);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="부서 선택" />
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

            {showReply && (
              <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowReply(false)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    취소
                  </button>
                  <Button
                    disabled={!replyText.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      toast.info("데모 모드: 실제 메일은 발송되지 않습니다");
                      setShowReply(false);
                    }}
                  >
                    답장 보내기
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}