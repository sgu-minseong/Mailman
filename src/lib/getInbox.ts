export type MailItem = {
  message_id: string;
  from_email: string;
  subject: string;
  body: string;
  received_at_kst: string;
  core_action: "auto_reply" | "route_to_department" | string;
  confidence: number;
  department_id?: string;
  department_name?: string;
  assigned_department_id?: string;
  assigned_department_name?: string;
  assignment_status?: string;
  department_inbox_visible?: boolean;
  mail_summary?: string;
  assignment_reason?: string;
  auto_ack_sent?: boolean;
  auto_ack_body?: string;
  no_actual_email_sent?: boolean;
  department_delivery_ready?: boolean;
  student_reply_sent?: boolean;
  student_reply_body?: string;
  needs_review?: boolean;
};

export const FALLBACK_ITEMS: MailItem[] = [
  {
    message_id: "fallback-001",
    from_email: "student.yuna@example.edu",
    subject: "Transcript request for graduate school",
    body: "Hello, I need an official transcript sent to a graduate program. Could you let me know the procedure and processing time?",
    received_at_kst: "2026-05-30 17:20:00 KST",
    core_action: "route_to_department",
    confidence: 0.9,
    department_id: "academic_records",
    department_name: "학적과",
    assigned_department_id: "academic_records",
    assigned_department_name: "학적과",
    assignment_status: "assigned",
    department_inbox_visible: true,
    mail_summary: "대학원 제출용 공식 성적표 발급 절차 및 소요 시간 문의.",
    assignment_reason: "성적표 발급은 학적 업무이므로 학적과로 배정.",
    auto_ack_sent: true,
    auto_ack_body:
      "안녕하세요, 학적과입니다.\n\n문의 주신 내용 잘 받았습니다. 수강·성적·졸업 관련 문의는 접수되었으며, 담당자가 확인 후 1영업일 이내로 답변드리겠습니다.\n\n감사합니다.\n— 학적과",
    no_actual_email_sent: true,
    department_delivery_ready: true,
    student_reply_sent: false,
    student_reply_body: "",
    needs_review: false,
  },
  {
    message_id: "fallback-002",
    from_email: "minjun.park@example.edu",
    subject: "등록금 분납 신청 문의",
    body: "안녕하세요. 이번 학기 등록금 분납을 신청하고 싶은데 절차와 마감일이 궁금합니다. 감사합니다.",
    received_at_kst: "2026-05-30 16:05:00 KST",
    core_action: "route_to_department",
    confidence: 0.94,
    department_id: "finance_team",
    department_name: "재무팀",
    assigned_department_id: "finance_team",
    assigned_department_name: "재무팀",
    assignment_status: "assigned",
    department_inbox_visible: true,
    mail_summary: "이번 학기 등록금 분납 신청 절차 및 마감일 문의.",
    assignment_reason: "등록금 관련 문의는 재무팀 소관.",
    auto_ack_sent: true,
    auto_ack_body:
      "안녕하세요, 재무팀입니다.\n\n문의하신 등록금 관련 사항은 접수되었으며 담당자가 확인 후 안내드리겠습니다.\n\n감사합니다.\n— 재무팀",
    no_actual_email_sent: true,
    department_delivery_ready: true,
    student_reply_sent: false,
    student_reply_body: "",
    needs_review: false,
  },
  {
    message_id: "fallback-003",
    from_email: "applicant.lee@example.edu",
    subject: "2027학년도 수시 모집 일정 문의",
    body: "2027학년도 수시 모집 원서 접수 일정과 제출 서류를 확인하고 싶습니다.",
    received_at_kst: "2026-05-30 14:42:00 KST",
    core_action: "route_to_department",
    confidence: 0.62,
    department_id: "admissions",
    department_name: "입학처",
    assigned_department_id: "admissions",
    assigned_department_name: "입학처",
    assignment_status: "assigned",
    department_inbox_visible: true,
    mail_summary: "2027학년도 수시 모집 일정 및 제출 서류 문의.",
    assignment_reason: "수시 모집 일정 안내는 입학처 담당.",
    auto_ack_sent: false,
    auto_ack_body: "",
    no_actual_email_sent: true,
    department_delivery_ready: true,
    student_reply_sent: false,
    student_reply_body: "",
    needs_review: true,
  },
  {
    message_id: "fallback-004",
    from_email: "exchange.kim@example.edu",
    subject: "Exchange program application timeline",
    body: "Hi, I'm interested in the fall exchange program. Could you share the application timeline and required documents?",
    received_at_kst: "2026-05-30 11:18:00 KST",
    core_action: "route_to_department",
    confidence: 0.88,
    department_id: "international_team",
    department_name: "국제팀",
    assigned_department_id: "international_team",
    assigned_department_name: "국제팀",
    assignment_status: "assigned",
    department_inbox_visible: true,
    mail_summary: "가을학기 교환학생 프로그램 신청 일정 및 서류 문의.",
    assignment_reason: "교환학생 관련 문의는 국제팀 소관.",
    auto_ack_sent: true,
    auto_ack_body:
      "Hello,\n\nThank you for contacting the International Team. We have received your inquiry and will respond within one business day.\n\nBest regards,\n— International Team",
    no_actual_email_sent: true,
    department_delivery_ready: true,
    student_reply_sent: false,
    student_reply_body: "",
    needs_review: false,
  },
];

export async function getInbox(): Promise<{ items: MailItem[]; usedFallback: boolean }> {
  try {
    const res = await fetch("https://zat8040.app.n8n.cloud/webhook/mailman-inbox", {
      method: "GET",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const items = Array.isArray(json?.items) ? (json.items as MailItem[]) : [];
    if (items.length === 0) {
      return { items: FALLBACK_ITEMS, usedFallback: true };
    }
    return { items, usedFallback: false };
  } catch (err) {
    console.error("getInbox failed:", err);
    return { items: FALLBACK_ITEMS, usedFallback: true };
  }
}

export const DEPARTMENTS = [
  { id: "academic_records", name: "학적과" },
  { id: "admissions", name: "입학처" },
  { id: "finance_team", name: "재무팀" },
  { id: "international_team", name: "국제팀" },
] as const;

export function nameFromEmail(email: string): string {
  if (!email) return "학생";
  const local = email.split("@")[0] ?? "";
  if (!local) return "학생";
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function relativeTimeKST(kst: string): string {
  // Parse "YYYY-MM-DD HH:mm:ss KST"
  const m = kst?.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (!m) return kst ?? "";
  const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+09:00`;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return kst;
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 60) return "방금 전";
  const min = Math.round(diffSec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}일 전`;
  return kst.slice(0, 10);
}