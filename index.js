import CLIENT from "./client.txt";

export default { fetch: (req, env) => env.DB.get(env.DB.idFromName("main")).fetch(req) };

class E extends Error { constructor(m, s = 400) { super(m); this.status = s; } }
const enc = new TextEncoder();
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const rnd = (n = 16) => hex(crypto.getRandomValues(new Uint8Array(n)));
const nid = () => rnd(6);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const digits = (s) => String(s || "").replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^\d+]/g, "");
const J = (d, s = 200, h = {}) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex", ...h } });
const str = (v, n = 2000) => String(v ?? "").trim().slice(0, n);

// الحقول المسموح بها لكل مجموعة بيانات (s نص، n رقم، a مصفوفة)
const S = {
  groups: { name: "s", description: "s", cover: "s", price: "n", grade: "s", status: "s" },
  courses: { name: "s", description: "s", cover: "s", price: "n", groupId: "s", teacher: "s", status: "s" },
  videos: { courseId: "s", title: "s", description: "s", url: "s", thumb: "s", order: "n", duration: "s", status: "s" },
  assignments: { courseId: "s", title: "s", questions: "a" },
  payments: { name: "s", details: "s", status: "s", targets: "a" },
  messages: { kind: "s", studentId: "s", groupId: "s", title: "s", text: "s" },
  questions: { reply: "s" },
};
const REQ = { groups: ["name"], courses: ["name", "groupId"], videos: ["title", "url", "courseId"], assignments: ["courseId"], payments: ["name", "details"], messages: ["text"] };
const KIDS = {
  groups: [["courses", "groupId"], ["enrollments", "targetId"], ["messages", "groupId"]],
  courses: [["videos", "courseId"], ["assignments", "courseId"], ["results", "courseId"], ["progress", "courseId"], ["questions", "courseId"], ["enrollments", "targetId"]],
  students: [["enrollments", "studentId"], ["results", "studentId"], ["progress", "studentId"], ["questions", "studentId"], ["messages", "studentId"], ["sessions", "uid"]],
};
const SETKEYS = ["name", "logo", "title", "description", "primary", "buttonColor", "bg", "text", "heroImage", "cover", "footer", "contact", "seoTitle", "seoDescription", "ogImage"];
const DEF = { name: "المنصة التعليمية", title: "تعلّم بسهولة في أي وقت ومن أي مكان", description: "منصة تعليمية متكاملة: كورسات وفيديوهات وواجبات ومتابعة لتقدمك.", primary: "#1e6fd9", buttonColor: "#1e6fd9", bg: "#f5f7fb", text: "#1b2433" };

const CSS = `:root{--p:#1e6fd9;--b:#1e6fd9;--bg:#f5f7fb;--t:#1b2433;--c:#fff}*{box-sizing:border-box}body{margin:0;font-family:Tahoma,"Segoe UI",system-ui,sans-serif;background:var(--bg);color:var(--t);line-height:1.7}a{color:var(--p);text-decoration:none}img{max-width:100%}
header{background:var(--c);box-shadow:0 1px 6px #0001;position:sticky;top:0;z-index:5}.bar{display:flex;align-items:center;gap:10px;padding:8px 14px;flex-wrap:wrap;max-width:1100px;margin:auto}.brand{display:flex;align-items:center;gap:8px;font-weight:700;font-size:1.1rem;color:var(--t)}.brand img{width:36px;height:36px;border-radius:8px;object-fit:cover}
nav{display:flex;gap:2px;flex-wrap:wrap;margin-inline-start:auto}nav a,nav button{padding:6px 10px;border-radius:8px;color:var(--t);background:none;border:0;font:inherit;cursor:pointer}nav a:hover,nav button:hover{background:#0001}
.wrap{max-width:1100px;margin:auto;padding:14px}.hero{background:linear-gradient(#0005,#0007),var(--p);background-size:cover;background-position:center;color:#fff;border-radius:16px;padding:42px 18px;text-align:center}.hero h1{margin:.2em 0;font-size:clamp(1.5rem,5vw,2.4rem)}.hero p{max-width:620px;margin:8px auto 18px;opacity:.95}.hero .logo{width:84px;height:84px;border-radius:18px;object-fit:cover;background:#fff}
.btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.btn{display:inline-block;border:0;background:var(--b);color:#fff;padding:10px 16px;border-radius:10px;font:inherit;cursor:pointer}.btn.s{background:#fff;color:var(--p)}.btn.d{background:#d93025}.btn.g{background:#188038}.btn.o{background:none;color:var(--p);border:1px solid var(--p)}.btn.sm{padding:4px 10px;font-size:.85rem}
h2{margin:22px 0 10px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}.card{background:var(--c);border-radius:14px;overflow:hidden;box-shadow:0 1px 6px #0001;display:flex;flex-direction:column;color:var(--t)}.card .im{aspect-ratio:16/9;width:100%;object-fit:cover;background:var(--p);opacity:.9}.cb{padding:10px 12px;display:flex;flex-direction:column;gap:4px;flex:1}.muted{color:#6b7587;margin:0}.pr{font-weight:700;color:var(--p)}
.box{background:var(--c);border-radius:14px;padding:14px;box-shadow:0 1px 6px #0001;margin:10px 0}input,select,textarea{width:100%;padding:10px;border:1px solid #cfd6e4;border-radius:10px;font:inherit;background:#fff;color:#111;margin:3px 0 10px}input[type=color]{height:42px;padding:2px}label{font-size:.9rem;font-weight:700}
.err{background:#fde8e6;color:#a50e0e;padding:10px;border-radius:10px;margin:8px 0}.okm{background:#e6f4ea;color:#137333;padding:10px;border-radius:10px;margin:8px 0}.vid{width:100%;aspect-ratio:16/9;border:0;border-radius:12px;background:#000}
.bar2{height:8px;background:#e3e8f2;border-radius:9px;overflow:hidden}.bar2 i{display:block;height:100%;background:var(--p)}.tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px}.tabs button{white-space:nowrap}.tbl{overflow-x:auto}table{border-collapse:collapse;width:100%;background:#fff;border-radius:10px}th,td{padding:8px;border-bottom:1px solid #e3e8f2;text-align:right;font-size:.9rem;vertical-align:top}
.opt{display:block;width:100%;text-align:right;background:#fff;border:2px solid #cfd6e4;border-radius:10px;padding:10px;margin:5px 0;font:inherit;cursor:pointer;color:#111}.opt.sel{border-color:var(--p)}.opt.ok{background:#d7f5df;border-color:#188038}.opt.bad{background:#fddcd9;border-color:#d93025}.qi{max-height:220px;border-radius:8px}
.vl button{display:flex;gap:8px;width:100%;text-align:right;border:0;background:#fff;padding:9px;border-bottom:1px solid #e3e8f2;font:inherit;cursor:pointer;color:var(--t)}.vl button.on{background:#e8f0fe}footer{text-align:center;color:#6b7587;padding:24px 10px}.g1{border:1px solid #dadce0;border-radius:10px;padding:12px;background:#fff}.g1 .u{color:#188038;font-size:.85rem}.g1 .t{color:#1a0dab;font-size:1.15rem}`;

export class Database {
  constructor(ctx, env) {
    this.env = env; this.tries = {};
    this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS docs(col TEXT,id TEXT,data TEXT,PRIMARY KEY(col,id))");
  }
  list(c) { return [...this.sql.exec("SELECT data FROM docs WHERE col=?", c)].map((r) => JSON.parse(r.data)); }
  get(c, i) { const r = [...this.sql.exec("SELECT data FROM docs WHERE col=? AND id=?", c, String(i))][0]; return r ? JSON.parse(r.data) : null; }
  put(c, o) { this.sql.exec("INSERT OR REPLACE INTO docs VALUES(?,?,?)", c, o.id, JSON.stringify(o)); return o; }
  rm(c, i) { this.sql.exec("DELETE FROM docs WHERE col=? AND id=?", c, String(i)); }
  del(c, id) { // حذف فعلي مع كل التوابع
    for (const [k, f] of KIDS[c] || []) for (const d of this.list(k)) if (d[f] === id) this.del(k, d.id);
    this.rm(c, id);
  }
  settings() { return { ...DEF, ...(this.get("config", "settings") || {}) }; }

  async hash(p, salt) {
    const k = await crypto.subtle.importKey("raw", enc.encode(p), "PBKDF2", false, ["deriveBits"]);
    return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" }, k, 256));
  }
  async mkpass(p) { const salt = rnd(); return { salt, hash: await this.hash(p, salt) }; }
  async chk(p, o) { return !!o && (await this.hash(String(p), o.salt)) === o.hash; }
  limit(req, key) {
    const k = (req.headers.get("cf-connecting-ip") || "x") + key, now = Date.now(), t = (this.tries[k] || []).filter((x) => now - x < 600000);
    if (t.length >= 10) throw new E("محاولات كثيرة، حاول بعد عدة دقائق", 429);
    t.push(now); this.tries[k] = t;
  }
  cookie(req, n) { const m = (req.headers.get("cookie") || "").match(new RegExp("(?:^|; )" + n + "=([a-f0-9]+)")); return m && m[1]; }
  async auth(req, role) {
    const t = this.cookie(req, role === "admin" ? "as" : "ss"); if (!t) return null;
    const s = this.get("sessions", t); if (!s || s.exp < Date.now() || s.role !== role) { if (s) this.rm("sessions", t); return null; }
    return s;
  }
  session(role, uid) {
    const id = rnd(32), days = role === "admin" ? 7 : 30;
    this.put("sessions", { id, role, uid, exp: Date.now() + days * 864e5 });
    return `${role === "admin" ? "as" : "ss"}=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${days * 86400}`;
  }
  clear(role) { return `${role === "admin" ? "as" : "ss"}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`; }
  safe(s) { return s && { id: s.id, code: s.code, name: s.name, phone: s.phone, grade: s.grade, extra: s.extra, createdAt: s.createdAt }; }
  pick(col, b) {
    const o = {};
    for (const [k, t] of Object.entries(S[col])) {
      if (!(k in b)) continue;
      if (t === "s") o[k] = str(b[k], k === "text" || k === "reply" || k === "description" || k === "details" ? 4000 : 600);
      else if (t === "n") o[k] = Math.max(0, Number(b[k]) || 0);
      else o[k] = Array.isArray(b[k]) ? b[k].slice(0, 300).map((x) => (x && typeof x === "object" ? x : str(x, 80))) : [];
    }
    if (col === "assignments" && o.questions)
      o.questions = o.questions.filter((q) => q && str(q.q) && Array.isArray(q.opts) && q.opts.length >= 2).map((q) => {
        const opts = q.opts.slice(0, 8).map((x) => str(x, 600));
        return { id: str(q.id, 20) || nid(), q: str(q.q, 1000), opts, correct: Math.min(opts.length - 1, Math.max(0, Number(q.correct) || 0)) };
      });
    for (const k of ["status"]) if (k in o && !["published", "draft", "active", "inactive"].includes(o[k])) o[k] = col === "payments" ? "active" : "published";
    if (o.kind && !["private", "group", "public"].includes(o.kind)) o.kind = "public";
    return o;
  }
  access(sid, c) { return this.list("enrollments").some((e) => e.studentId === sid && e.status === "approved" && (e.targetId === c.id || e.targetId === c.groupId)); }
  pct(sid, c) {
    const vs = this.list("videos").filter((v) => v.courseId === c.id && v.status !== "draft"), hasA = this.list("assignments").some((a) => a.courseId === c.id);
    const pr = this.get("progress", sid + ":" + c.id) || { watched: [] }, tot = vs.length + (hasA ? 1 : 0);
    if (!tot) return 0;
    return Math.round(((vs.filter((v) => pr.watched.includes(v.id)).length + (hasA && this.get("results", sid + ":" + c.id) ? 1 : 0)) / tot) * 100);
  }

  async fetch(req) {
    const u = new URL(req.url), p = u.pathname;
    try { return p.startsWith("/api/") ? await this.api(req, u, p) : await this.page(req, u, p); }
    catch (e) { if (!e.status) console.error(e); return J({ error: e.status ? e.message : "خطأ في الخادم" }, e.status || 500); }
  }

  async api(req, u, p) {
    const m = req.method, seg = p.slice(5).split("/").filter(Boolean);
    let b = {};
    if (m !== "GET" && m !== "DELETE") { try { b = await req.json(); } catch { throw new E("بيانات غير صالحة"); } if (!b || typeof b !== "object") throw new E("بيانات غير صالحة"); }
    const key = m + " " + seg.map((x, i) => (i && /^[a-z0-9]{6,}$/.test(x) && !["status", "setup", "login", "logout", "settings", "stats", "credentials", "submit"].includes(x) ? ":id" : x)).join("/");
    const sid = seg[1] || "";
    const needS = async () => { const s = await this.auth(req, "student"); if (!s) throw new E("يجب تسجيل الدخول أولًا", 401); const st = this.get("students", s.uid); if (!st) throw new E("الحساب غير موجود", 401); return st; };

    if (seg[0] === "admin") return this.admin(req, key, seg, b);

    switch (key) {
      case "GET settings": { const s = this.settings(); return J(s); }
      case "GET public": return J({ groups: this.list("groups").filter((x) => x.status !== "draft").sort((a, b) => b.createdAt - a.createdAt), courses: this.list("courses").filter((x) => x.status !== "draft").sort((a, b) => b.createdAt - a.createdAt) });
      case "GET me": { const s = await this.auth(req, "student"); return J({ student: s ? this.safe(this.get("students", s.uid)) : null }); }
      case "POST register": {
        this.limit(req, "reg");
        const name = str(b.name, 80), phone = digits(b.phone), pw = String(b.password || "");
        if (name.length < 2) throw new E("اكتب اسمك الكامل");
        if (!/^\+?\d{8,15}$/.test(phone)) throw new E("رقم الهاتف غير صحيح");
        if (pw.length < 6) throw new E("كلمة المرور 6 أحرف على الأقل");
        const all = this.list("students");
        if (all.some((x) => x.phone === phone)) throw new E("هذا الرقم مسجل بالفعل، سجّل الدخول");
        let code; do code = String(100000 + Math.floor(Math.random() * 900000)); while (all.some((x) => x.code === code));
        const st = this.put("students", { id: nid(), code, name, phone, grade: str(b.grade, 60), extra: "", ...(await this.mkpass(pw)), createdAt: Date.now() });
        return J({ student: this.safe(st) }, 200, { "set-cookie": this.session("student", st.id) });
      }
      case "POST login": {
        this.limit(req, "login");
        const st = this.list("students").find((x) => x.phone === digits(b.phone));
        if (!(await this.chk(b.password, st))) throw new E("رقم الهاتف أو كلمة المرور غير صحيحة", 401);
        return J({ student: this.safe(st) }, 200, { "set-cookie": this.session("student", st.id) });
      }
      case "POST logout": { const t = this.cookie(req, "ss"); if (t) this.rm("sessions", t); return J({ ok: 1 }, 200, { "set-cookie": this.clear("student") }); }
      case "GET course/:id": {
        const c = this.get("courses", sid), st = await this.auth(req, "student"), ad = await this.auth(req, "admin");
        if (!c || (c.status === "draft" && !ad)) throw new E("الكورس غير موجود", 404);
        const g = this.get("groups", c.groupId), acc = !!ad || (st && this.access(st.uid, c));
        const out = { course: c, group: g && { id: g.id, name: g.name }, access: acc, enrollment: this.enrStatus(st, c), videoCount: this.list("videos").filter((v) => v.courseId === c.id && v.status !== "draft").length };
        if (acc) {
          out.videos = this.list("videos").filter((v) => v.courseId === c.id && (ad || v.status !== "draft")).sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
          const a = this.list("assignments").find((x) => x.courseId === c.id);
          out.assignment = a && { id: a.id, title: a.title, questions: a.questions.map(({ id, q, opts }) => ({ id, q, opts })) };
          if (st) { out.progress = this.get("progress", st.uid + ":" + c.id) || { watched: [] }; out.result = this.get("results", st.uid + ":" + c.id); }
        }
        return J(out);
      }
      case "GET group/:id": {
        const g = this.get("groups", sid), st = await this.auth(req, "student"), ad = await this.auth(req, "admin");
        if (!g || (g.status === "draft" && !ad)) throw new E("المجموعة غير موجودة", 404);
        return J({ group: g, courses: this.list("courses").filter((c) => c.groupId === g.id && c.status !== "draft"), enrollment: this.enrStatus(st, { id: g.id }), access: !!st && this.access(st.uid, { id: g.id, groupId: g.id }) });
      }
      case "GET payments": {
        await needS();
        const t = u.searchParams.get("target") || "", c = this.get("courses", t), ids = [t, c && c.groupId];
        return J(this.list("payments").filter((x) => x.status !== "inactive" && (!x.targets.length || x.targets.some((i) => ids.includes(i)))).map(({ id, name, details }) => ({ id, name, details })));
      }
      case "POST enroll": {
        const st = await needS(); this.limit(req, "enr");
        const t = this.get("courses", b.targetId) ? ["course", this.get("courses", b.targetId)] : this.get("groups", b.targetId) ? ["group", this.get("groups", b.targetId)] : null;
        if (!t || t[1].status === "draft") throw new E("العنصر غير موجود", 404);
        const name = str(b.name, 80), phone = digits(b.phone);
        if (name.length < 2 || !/^\+?\d{8,15}$/.test(phone)) throw new E("اكتب الاسم ورقم الهاتف بشكل صحيح");
        const pm = this.get("payments", b.methodId); if (!pm || pm.status === "inactive") throw new E("اختر طريقة دفع صحيحة");
        const ex = this.list("enrollments").filter((e) => e.studentId === st.id && e.targetId === t[1].id);
        if (ex.some((e) => e.status !== "rejected")) throw new E("لديك طلب اشتراك قائم بالفعل لهذا العنصر");
        ex.forEach((e) => this.rm("enrollments", e.id));
        this.put("enrollments", { id: nid(), studentId: st.id, studentCode: st.code, studentName: name, phone, phone2: digits(b.phone2), targetType: t[0], targetId: t[1].id, targetName: t[1].name, methodName: pm.name, receipt: str(b.receipt, 800), status: "pending", createdAt: Date.now() });
        return J({ ok: 1, message: "تم إرسال طلبك بنجاح، سيتم مراجعة طلبك." });
      }
      case "GET my": {
        const st = await needS(), en = this.list("enrollments").filter((e) => e.studentId === st.id), items = [];
        for (const e of en.filter((x) => x.status === "approved")) {
          if (e.targetType === "course") { const c = this.get("courses", e.targetId); if (c) items.push({ type: "course", id: c.id, name: c.name, cover: c.cover, pct: this.pct(st.id, c) }); }
          else { const g = this.get("groups", e.targetId); if (!g) continue; const cs = this.list("courses").filter((c) => c.groupId === g.id && c.status !== "draft"); items.push({ type: "group", id: g.id, name: g.name, cover: g.cover, pct: cs.length ? Math.round(cs.reduce((a, c) => a + this.pct(st.id, c), 0) / cs.length) : 0 }); }
        }
        const results = this.list("results").filter((r) => r.studentId === st.id).map((r) => ({ course: (this.get("courses", r.courseId) || {}).name, score: r.score, total: r.total, at: r.at }));
        return J({ student: this.safe(st), items, requests: en.filter((x) => x.status !== "approved").map(({ id, targetName, status, createdAt }) => ({ id, targetName, status, createdAt })), results });
      }
      case "POST progress": {
        const st = await needS(), c = this.get("courses", b.courseId), v = this.get("videos", b.videoId);
        if (!c || !v || v.courseId !== c.id || !this.access(st.id, c)) throw new E("غير مصرح", 403);
        const k = st.id + ":" + c.id, pr = this.get("progress", k) || { id: k, studentId: st.id, courseId: c.id, watched: [] };
        if (!pr.watched.includes(v.id)) pr.watched.push(v.id); pr.last = v.id;
        this.put("progress", pr); return J({ progress: pr, pct: this.pct(st.id, c) });
      }
      case "POST assignment/:id/submit": {
        const st = await needS(), c = this.get("courses", sid);
        if (!c || !this.access(st.id, c)) throw new E("غير مصرح", 403);
        const a = this.list("assignments").find((x) => x.courseId === c.id); if (!a || !a.questions.length) throw new E("لا يوجد واجب", 404);
        const ans = b.answers || {}; let score = 0;
        const details = a.questions.map((q) => { const ch = Number.isInteger(ans[q.id]) ? ans[q.id] : -1; if (ch === q.correct) score++; return { id: q.id, chosen: ch, correct: q.correct }; });
        const r = this.put("results", { id: st.id + ":" + c.id, studentId: st.id, courseId: c.id, score, total: a.questions.length, details, at: Date.now() });
        return J({ result: r });
      }
      case "POST ask": {
        const st = await needS(), c = this.get("courses", b.courseId), t = str(b.text, 2000);
        if (!c || !this.access(st.id, c)) throw new E("غير مصرح", 403); if (t.length < 3) throw new E("اكتب سؤالك");
        this.put("questions", { id: nid(), courseId: c.id, courseName: c.name, studentId: st.id, studentName: st.name, text: t, reply: "", createdAt: Date.now() });
        return J({ ok: 1 });
      }
      case "GET inbox": {
        const st = await needS(), gs = new Set(this.list("enrollments").filter((e) => e.studentId === st.id && e.status === "approved").flatMap((e) => { const c = this.get("courses", e.targetId); return [e.targetId, c && c.groupId]; }));
        return J({
          messages: this.list("messages").filter((x) => x.kind === "public" || (x.kind === "private" && x.studentId === st.id) || (x.kind === "group" && gs.has(x.groupId))).sort((a, b) => b.createdAt - a.createdAt),
          questions: this.list("questions").filter((q) => q.studentId === st.id).sort((a, b) => b.createdAt - a.createdAt),
        });
      }
    }
    throw new E("غير موجود", 404);
  }
  enrStatus(st, c) {
    if (!st) return null;
    const l = this.list("enrollments").filter((e) => e.studentId === st.uid && (e.targetId === c.id || e.targetId === c.groupId)).sort((a, b) => b.createdAt - a.createdAt);
    return l[0] ? l[0].status : null;
  }

  async admin(req, key, seg, b) {
    const m = req.method, col = seg[1], id = seg[2];
    if (key === "GET admin/status") return J({ configured: !!this.get("config", "admin"), admin: !!(await this.auth(req, "admin")) });
    if (key === "POST admin/setup") {
      if (this.get("config", "admin")) throw new E("تم الإعداد مسبقًا", 403);
      if (!this.env.SETUP_KEY || b.setupKey !== this.env.SETUP_KEY) throw new E("مفتاح الإعداد غير صحيح (SETUP_KEY)", 403);
      if (str(b.username, 40).length < 3 || String(b.password || "").length < 8) throw new E("اسم الدخول 3 أحرف+ وكلمة المرور 8 أحرف+");
      this.put("config", { id: "admin", user: str(b.username, 40), ...(await this.mkpass(String(b.password))) });
      return J({ ok: 1 }, 200, { "set-cookie": this.session("admin", "admin") });
    }
    if (key === "POST admin/login") {
      this.limit(req, "adm"); const a = this.get("config", "admin");
      if (!a || b.username !== a.user || !(await this.chk(b.password, a))) throw new E("بيانات الدخول غير صحيحة", 401);
      return J({ ok: 1 }, 200, { "set-cookie": this.session("admin", "admin") });
    }
    if (key === "POST admin/logout") { const t = this.cookie(req, "as"); if (t) this.rm("sessions", t); return J({ ok: 1 }, 200, { "set-cookie": this.clear("admin") }); }
    if (!(await this.auth(req, "admin"))) throw new E("غير مصرح", 401);

    if (key === "POST admin/credentials") {
      const a = this.get("config", "admin"); this.limit(req, "cred");
      if (!(await this.chk(b.current, a))) throw new E("كلمة المرور الحالية غير صحيحة", 403);
      const user = str(b.username, 40) || a.user, pw = b.password ? String(b.password) : null;
      if (user.length < 3 || (pw && pw.length < 8)) throw new E("اسم الدخول 3 أحرف+ وكلمة المرور 8 أحرف+");
      this.put("config", { id: "admin", user, ...(pw ? await this.mkpass(pw) : { salt: a.salt, hash: a.hash }) });
      return J({ ok: 1 });
    }
    if (key === "GET admin/settings") return J(this.settings());
    if (key === "POST admin/settings") {
      const cur = this.get("config", "settings") || { id: "settings" };
      for (const k of SETKEYS) if (k in b) cur[k] = str(b[k], k === "description" || k === "seoDescription" || k === "footer" ? 600 : 400);
      this.put("config", cur); return J(this.settings());
    }
    if (key === "GET admin/stats") {
      const en = this.list("enrollments"), rs = this.list("results");
      return J({
        students: this.list("students").length, groups: this.list("groups").length, courses: this.list("courses").length, videos: this.list("videos").length,
        pending: en.filter((x) => x.status === "pending").length, approved: en.filter((x) => x.status === "approved").length, questions: this.list("questions").filter((q) => !q.reply).length,
        perCourse: this.list("courses").map((c) => { const r = rs.filter((x) => x.courseId === c.id && x.total); return { name: c.name, subs: en.filter((x) => x.targetId === c.id && x.status === "approved").length, avg: r.length ? Math.round(r.reduce((a, x) => a + (x.score / x.total) * 100, 0) / r.length) : null }; }),
      });
    }
    const cols = ["groups", "courses", "videos", "assignments", "payments", "messages", "questions", "enrollments", "students"];
    if (!cols.includes(col)) throw new E("غير موجود", 404);
    if (m === "GET") return J(this.list(col).map((x) => (col === "students" ? this.safe(x) : x)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    if (m === "DELETE") { if (!id || !this.get(col, id)) throw new E("غير موجود", 404); this.del(col, id); return J({ ok: 1 }); }
    // POST: إنشاء/تعديل
    const old = b.id ? this.get(col, b.id) : null;
    if (col === "enrollments") {
      if (!old || !["approved", "rejected", "pending"].includes(b.status)) throw new E("طلب غير صالح");
      return J(this.put(col, { ...old, status: b.status, reviewedAt: Date.now() }));
    }
    if (col === "students") {
      if (!old) throw new E("غير موجود", 404);
      const phone = b.phone ? digits(b.phone) : old.phone;
      if (this.list("students").some((x) => x.id !== old.id && x.phone === phone)) throw new E("الرقم مستخدم لطالب آخر");
      const n = { ...old, name: str(b.name, 80) || old.name, phone, grade: str(b.grade, 60), extra: str(b.extra, 1000), code: str(b.code, 20) || old.code };
      if (b.password) { if (String(b.password).length < 6) throw new E("كلمة المرور 6 أحرف+"); Object.assign(n, await this.mkpass(String(b.password))); }
      return J(this.safe(this.put(col, n)));
    }
    if (col === "questions" && !old) throw new E("غير موجود", 404);
    const data = this.pick(col, b), o = { ...(old || { id: nid(), createdAt: Date.now(), status: col === "payments" ? "active" : "published", order: 0 }), ...data };
    for (const k of REQ[col] || []) if (!o[k] || (Array.isArray(o[k]) && !o[k].length && k !== "targets")) throw new E("أكمل الحقول المطلوبة");
    if (o.groupId && col === "courses" && !this.get("groups", o.groupId)) throw new E("المجموعة غير موجودة");
    if (o.courseId && !this.get("courses", o.courseId)) throw new E("الكورس غير موجود");
    if (col === "videos" && !/^https?:\/\//i.test(o.url)) throw new E("رابط الفيديو يجب أن يبدأ بـ https://");
    if (col === "assignments" && !old && this.list("assignments").some((a) => a.courseId === o.courseId)) throw new E("هذا الكورس لديه واجب بالفعل، عدّله");
    if (col === "assignments") { o.title = o.title || "واجب"; o.questions = o.questions || []; }
    if (col === "payments") o.targets = (o.targets || []).filter((x) => typeof x === "string");
    return J(this.put(col, o));
  }

  async page(req, u, p) {
    if (req.method !== "GET" && req.method !== "HEAD") throw new E("غير مسموح", 405);
    const S0 = this.settings(), origin = u.origin;
    if (p === "/app.js") return new Response(CLIENT, { headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "no-cache" } });
    const pubG = () => this.list("groups").filter((x) => x.status !== "draft"), pubC = () => this.list("courses").filter((x) => x.status !== "draft");
    if (p === "/robots.txt") return new Response(`User-agent: *\nAllow: /\nDisallow: /control\nDisallow: /my\nDisallow: /login\nDisallow: /register\nDisallow: /inbox\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
    if (p === "/sitemap.xml") {
      const urls = ["/", "/courses", "/groups", ...pubG().map((g) => "/group/" + g.id), ...pubC().map((c) => "/course/" + c.id)];
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((x) => `<url><loc>${esc(origin + x)}</loc></url>`).join("")}</urlset>`, { headers: { "content-type": "application/xml; charset=utf-8" } });
    }
    const name = S0.name, link = (h, t) => `<a href="${esc(h)}">${esc(t)}</a>`;
    let m = { title: S0.seoTitle || `${name} - ${S0.title}`, desc: S0.seoDescription || S0.description, robots: "index,follow", image: S0.ogImage || S0.heroImage || S0.logo || "", status: 200, ld: [], body: "" };
    const org = { "@context": "https://schema.org", "@type": "EducationalOrganization", name, url: origin, ...(S0.logo ? { logo: S0.logo } : {}) };
    const crumbs = (items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([n, h], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: origin + h })) });
    let m2;
    if (p === "/") { m.ld = [org, { "@context": "https://schema.org", "@type": "WebSite", name, url: origin }]; m.body = `<h1>${esc(S0.title)}</h1><p>${esc(S0.description)}</p><h2>المجموعات</h2><ul>${pubG().map((g) => `<li>${link("/group/" + g.id, g.name)}</li>`).join("")}</ul><h2>الكورسات</h2><ul>${pubC().map((c) => `<li>${link("/course/" + c.id, c.name)}</li>`).join("")}</ul>`; }
    else if (p === "/courses") { m.title = `الكورسات - ${name}`; m.desc = `تصفح كل الكورسات المتاحة على ${name}`; m.ld = [crumbs([[name, "/"], ["الكورسات", "/courses"]])]; m.body = `<h1>الكورسات</h1><ul>${pubC().map((c) => `<li>${link("/course/" + c.id, c.name)}</li>`).join("")}</ul>`; }
    else if (p === "/groups") { m.title = `المجموعات - ${name}`; m.desc = `تصفح كل المجموعات الدراسية على ${name}`; m.ld = [crumbs([[name, "/"], ["المجموعات", "/groups"]])]; m.body = `<h1>المجموعات</h1><ul>${pubG().map((g) => `<li>${link("/group/" + g.id, g.name)}</li>`).join("")}</ul>`; }
    else if ((m2 = p.match(/^\/course\/([a-z0-9]+)$/))) {
      const c = this.get("courses", m2[1]);
      if (!c || c.status === "draft") m = { ...m, status: 404, robots: "noindex,nofollow", title: `غير موجود - ${name}`, body: "<h1>الكورس غير موجود</h1>" };
      else { const g = this.get("groups", c.groupId); m.title = `${c.name} - ${name}`; m.desc = (c.description || `كورس ${c.name} على ${name}`).slice(0, 160); m.image = c.cover || m.image;
        m.ld = [{ "@context": "https://schema.org", "@type": "Course", name: c.name, description: m.desc, provider: { "@type": "Organization", name, url: origin }, ...(c.cover ? { image: c.cover } : {}), ...(c.teacher ? { instructor: { "@type": "Person", name: c.teacher } } : {}) }, crumbs([[name, "/"], ["الكورسات", "/courses"], [c.name, p]])];
        m.body = `<h1>${esc(c.name)}</h1><p>${esc(c.description)}</p>${g ? `<p>المجموعة: ${link("/group/" + g.id, g.name)}</p>` : ""}`; }
    } else if ((m2 = p.match(/^\/group\/([a-z0-9]+)$/))) {
      const g = this.get("groups", m2[1]);
      if (!g || g.status === "draft") m = { ...m, status: 404, robots: "noindex,nofollow", title: `غير موجود - ${name}`, body: "<h1>المجموعة غير موجودة</h1>" };
      else { m.title = `${g.name} - ${name}`; m.desc = (g.description || `مجموعة ${g.name} على ${name}`).slice(0, 160); m.image = g.cover || m.image;
        m.ld = [crumbs([[name, "/"], ["المجموعات", "/groups"], [g.name, p]])];
        m.body = `<h1>${esc(g.name)}</h1><p>${esc(g.description)}</p><ul>${pubC().filter((c) => c.groupId === g.id).map((c) => `<li>${link("/course/" + c.id, c.name)}</li>`).join("")}</ul>`; }
    } else if (["/login", "/register", "/my", "/inbox", "/control"].includes(p)) m = { ...m, robots: "noindex,nofollow", title: `${name}`, body: "" };
    else m = { ...m, status: 404, robots: "noindex,nofollow", title: `الصفحة غير موجودة - ${name}`, body: "<h1>الصفحة غير موجودة</h1>" };

    const can = origin + (p === "/" ? "/" : p), img = m.image ? `<meta property="og:image" content="${esc(m.image)}"><meta name="twitter:image" content="${esc(m.image)}">` : "";
    const css = `:root{--p:${/^#[0-9a-f]{6}$/i.test(S0.primary) ? S0.primary : DEF.primary};--b:${/^#[0-9a-f]{6}$/i.test(S0.buttonColor) ? S0.buttonColor : DEF.buttonColor};--bg:${/^#[0-9a-f]{6}$/i.test(S0.bg) ? S0.bg : DEF.bg};--t:${/^#[0-9a-f]{6}$/i.test(S0.text) ? S0.text : DEF.text}}`;
    const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(m.title)}</title><meta name="description" content="${esc(m.desc)}"><meta name="robots" content="${m.robots}"><link rel="canonical" href="${esc(can)}"><meta property="og:type" content="website"><meta property="og:locale" content="ar_AR"><meta property="og:site_name" content="${esc(name)}"><meta property="og:title" content="${esc(m.title)}"><meta property="og:description" content="${esc(m.desc)}"><meta property="og:url" content="${esc(can)}"><meta name="twitter:card" content="${m.image ? "summary_large_image" : "summary"}"><meta name="twitter:title" content="${esc(m.title)}"><meta name="twitter:description" content="${esc(m.desc)}">${img}${S0.logo ? `<link rel="icon" href="${esc(S0.logo)}">` : ""}${m.ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, "\\u003c")}</script>`).join("")}<style>${CSS}${css}</style></head><body><div id="app"><main class="wrap">${m.body}</main></div><noscript>يلزم تفعيل JavaScript لاستخدام المنصة.</noscript><script src="/app.js" defer></script></body></html>`;
    return new Response(html, { status: m.status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache", ...(m.robots.startsWith("noindex") ? { "x-robots-tag": "noindex, nofollow" } : {}) } });
  }
}
