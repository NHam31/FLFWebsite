import { useMemo, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, FileText, Mail, RefreshCw, ShieldCheck, Users } from "lucide-react";

type Tab = "candidates" | "messages" | "subscribers";

function fileUrl(ref?: string | null) {
  if (!ref?.startsWith("private://")) return null;
  return `/api/private-files/${encodeURIComponent(ref.replace("private://", ""))}`;
}

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    toast.info("لا توجد بيانات للتصدير");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/admin/login",
  });
  const [tab, setTab] = useState<Tab>("candidates");
  const [search, setSearch] = useState("");
  const isAdmin = user?.role === "admin";

  const stats = trpc.admin.stats.useQuery(undefined, {
    retry: false,
    enabled: isAdmin,
  });
  const candidates = trpc.admin.listCandidates.useQuery(undefined, {
    retry: false,
    enabled: isAdmin,
  });
  const messages = trpc.admin.listContactMessages.useQuery(undefined, {
    retry: false,
    enabled: isAdmin,
  });
  const subscribers = trpc.admin.listNewsletterSubscribers.useQuery(undefined, {
    retry: false,
    enabled: isAdmin,
  });
  const utils = trpc.useUtils();

  const updateStatus = trpc.admin.updateCandidateStatus.useMutation({
    onSuccess: async () => {
      toast.success("تم تحديث حالة المترشح بنجاح");
      await utils.admin.listCandidates.invalidate();
      await utils.admin.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "فشل تحديث حالة المترشح"),
  });

  const filteredCandidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = candidates.data ?? [];
    if (!q) return list;
    return list.filter((candidate) =>
      `${candidate.firstName} ${candidate.lastName} ${candidate.email} ${candidate.phoneNumber}`
        .toLowerCase()
        .includes(q),
    );
  }, [candidates.data, search]);

  if (isLoading) {
    return <div 
     dir = "rtl"
     lang="ar"
     className="min-h-screen flex items-center justify-center">جاري تحميل...  </div>;
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div 
      dir = "rtl"
      lang="ar"
      className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="mb-2 text-xl font-bold">الوصول مرفوض</h1>
          <p className="mb-6 text-slate-600">هذه الصفحة مخصصة للمديرين فقط.</p>
          <Link to="/">
            <Button>العودة إلى الصفحة الرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  const accessError = stats.error ?? candidates.error ?? messages.error ?? subscribers.error;

  if (accessError?.data?.code === "UNAUTHORIZED" || accessError?.data?.code === "FORBIDDEN") {
    return (
      <div 
      dir = "rtl"
      lang="ar"
      className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="mb-2 text-xl font-bold">الوصول مرفوض</h1>
          <p className="mb-6 text-slate-600">
            قم بتسجيل الدخول باستخدام حساب إدارة داخلي للوصول إلى لوحة الإدارة.
          </p>
          <Link to="/admin/login">
            <Button>تسجيل الدخول</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
    dir="rtl"
    lang="ar"
    className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">لوحة الإدارة</p>
            <h1 className="text-2xl font-bold text-slate-900">إدارة الترشيحات والمحتوى</h1>
            <p className="mt-1 text-sm text-slate-500">
              تم تسجيل الدخول باسم : {user.name || user.email || user.unionId}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="ml-2 h-4 w-4" /> تحديث
            </Button>
            <Link to="/">
              <Button variant="outline">الموقع</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <Users className="mb-3 h-5 w-5 text-[#4A9B8E]" />
            <p className="text-sm text-slate-500">المترشحون</p>
            <p className="text-3xl font-bold">{stats.data?.candidates ?? 0}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <ShieldCheck className="mb-3 h-5 w-5 text-[#4A9B8E]" />
            <p className="text-sm text-slate-500">المترشحون المقبولون</p>
            <p className="text-3xl font-bold">{stats.data?.acceptedCandidates ?? 0}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <Mail className="mb-3 h-5 w-5 text-[#4A9B8E]" />
            <p className="text-sm text-slate-500">رسائل التواصل</p>
            <p className="text-3xl font-bold">{stats.data?.messages ?? 0}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <FileText className="mb-3 h-5 w-5 text-[#4A9B8E]" />
            <p className="text-sm text-slate-500">الدورات</p>
            <p className="text-3xl font-bold">{stats.data?.editions ?? 0}</p>
          </div>
        </section>

        <nav className="flex flex-wrap gap-2 rounded-2xl border bg-white p-3 shadow-sm">
          <Button
            variant={tab === "candidates" ? "default" : "outline"}
            onClick={() => setTab("candidates")}
          >
            المترشحون
          </Button>
          <Button
            variant={tab === "messages" ? "default" : "outline"}
            onClick={() => setTab("messages")}
          >
            رسائل التواصل
          </Button>
          <Button
            variant={tab === "subscribers" ? "default" : "outline"}
            onClick={() => setTab("subscribers")}
          >
            المشتركين في النشرة
          </Button>
        </nav>

        {tab === "candidates" && (
          <section className="overflow-hidden rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Input
                placeholder="بحث بالاسم, البريد الإلكتروني أو الهاتف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="md:max-w-sm"
              />
              <Button
                variant="outline"
                onClick={() =>
                  downloadCsv(
                    "candidats.csv",
                    filteredCandidates as unknown as Record<string, unknown>[],
                  )
                }
              >
                <Download className="ml-2 h-4 w-4" /> csv تصدير المترشحين 
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-3 text-right">المترشح</th>
                    <th className="p-3 text-right">البريد الإلكتروني</th>
                    <th className="p-3 text-right">الهاتف</th>
                    <th className="p-3 text-right">الوضعية الدراسية</th>
                    <th className="p-3 text-right">البريد الإلكتروني مؤكد</th>
                    <th className="p-3 text-right">الوثائق</th>
                    <th className="p-3 text-right">القرار</th>
                    <th className="p-3 text-right">لإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => {
                    const attestation = fileUrl(candidate.attestationUrl);
                    const idCard = fileUrl(candidate.idCardUrl);
                    return (
                      <tr
                        key={candidate.id}
                        className="border-b last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="p-3 font-medium">
                          {candidate.firstName} {candidate.lastName}
                        </td>
                        <td className="p-3">{candidate.email}</td>
                        <td className="p-3">{candidate.phoneNumber}</td>
                        <td className="p-3">{candidate.studyStatus}</td>
                        <td className="p-3">{candidate.emailConfirmed ? "نعم" : "لا"}</td>
                        <td className="space-x-2 space-x-reverse p-3">
                          {attestation ? (
                            <a
                              className="text-[#4A9B8E] underline"
                              href={attestation}
                              target="_blank"
                              rel="noreferrer"
                            >شهادة التسجيل
                            </a>
                          ) : (
                            <span className="text-slate-400">لا توجد شهادة</span>
                          )}
                          <span> | </span>
                          {idCard ? (
                            <a
                              className="text-[#4A9B8E] underline"
                              href={idCard}
                              target="_blank"
                              rel="noreferrer"
                            >
                              بطاقة التعريف
                            </a>
                          ) : (
                            <span className="text-slate-400">لا توجد بطاقة</span>
                          )}
                        </td>
                        <td className="p-3">{candidate.applicationStatus ?? "pending"}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatus.mutate({
                                  candidateId: candidate.id,
                                  status: "pending",
                                })
                              }
                            >
                             قيد المعالجة
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                updateStatus.mutate({
                                  candidateId: candidate.id,
                                  status: "accepted",
                                })
                              }
                            >
                              قبول
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateStatus.mutate({
                                  candidateId: candidate.id,
                                  status: "rejected",
                                })
                              }
                            >
                              رفض
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "messages" && (
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  downloadCsv(
                    "messages-contact.csv",
                    (messages.data ?? []) as unknown as Record<string, unknown>[],
                  )
                }
              >
                <Download className="ml-2 h-4 w-4" /> csv تصدير المترشحين 
              </Button>
            </div>
            <div className="space-y-3">
              {(messages.data ?? []).map((message) => (
                <article key={message.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="font-semibold">{message.subject}</h3>
                    <p className="text-sm text-slate-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {message.name} - {message.email} {message.phone ? `- ${message.phone}` : ""}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-slate-800">{message.message}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === "subscribers" && (
          <section className="overflow-x-auto rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  downloadCsv(
                    "newsletter.csv",
                    (subscribers.data ?? []) as unknown as Record<string, unknown>[],
                  )
                }
              >
                <Download className="ml-2 h-4 w-4" />csv تصدير المترشحين 
              </Button>
            </div>
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-right">الاسم</th>
                  <th className="p-3 text-right">البريد الإلكتروني</th>
                  <th className="p-3 text-right">مشترك</th>
                  <th className="p-3 text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {(subscribers.data ?? []).map((subscriber) => (
                  <tr key={subscriber.id} className="border-b last:border-b-0">
                    <td className="p-3">{subscriber.name || "-"}</td>
                    <td className="p-3">{subscriber.email}</td>
                    <td className="p-3">{subscriber.isSubscribed ? "نعم" : "لا"}</td>
                    <td className="p-3">{new Date(subscriber.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}
