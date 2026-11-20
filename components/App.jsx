'use client';
import { useEffect, useRef, useState } from 'react';
import AuthCard from './AuthCard';
import { courses, specs, specById, levels, levelOf, quizFor } from '../lib/courses';

const KEY = 'masari-v1';
const empty = { user: null, owner: null, enrolled: [], done: {}, grades: {}, seen: false, spec: null };

function Ring({ pct }) {
  return (
    <svg width="42" height="42" viewBox="0 0 36 36" aria-hidden="true">
      <circle className="rg bg" cx="18" cy="18" r="15" pathLength="100" />
      <circle className="rg fg" cx="18" cy="18" r="15" pathLength="100" strokeDasharray={`${pct} 100`} transform="rotate(-90 18 18)" />
    </svg>
  );
}

function Exam({ c, save, back }) {
  const [a, setA] = useState({});
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const quiz = c.quiz || quizFor(c);
  function submit() {
    const n = Object.keys(a).length;
    if (n < quiz.length) return setErr(`جاوب على كل الأسئلة أولًا (${n} من ${quiz.length}).`);
    const ok = quiz.filter((q, i) => a[i] === q[2]).length;
    const score = Math.round((ok / quiz.length) * 100);
    save(c.id, score);
    setRes(score);
  }
  return (
    <div className="screen"><div className="sc-in">
      <button className="back" onClick={back}>رجوع</button>
      <h2>اختبار {c.title}</h2>
      {!c.quiz && <p className="mute">اختبار تجريبي مولّد من محاور المقرر، والمدرّس يضيف أسئلته الحقيقية لاحقًا.</p>}
      {quiz.map((q, i) => (
        <fieldset className="q" key={i} disabled={res !== null}>
          <legend>{q[0]}</legend>
          {q[1].map((o, j) => (
            <label key={j}><input type="radio" name={`q${i}`} checked={a[i] === j} onChange={() => setA({ ...a, [i]: j })} /><span dir="auto">{o}</span></label>
          ))}
        </fieldset>
      ))}
      {res === null ? (
        <><p className="msg err" role="status">{err}</p><button className="btn" onClick={submit}>تسليم الإجابات</button></>
      ) : (
        <p className="result">علامتك {res}%، {res >= 60 ? 'نجحت وانحفظت علامتك في ملفك.' : 'ما وصلت لحد النجاح (60%)، علامتك انحفظت، راجع الدروس وأعد المحاولة.'}</p>
      )}
    </div></div>
  );
}

function Course({ c, s, enroll, finish, save, close }) {
  const [exam, setExam] = useState(false);
  const d = s.done[c.id] || [];
  const en = s.enrolled.includes(c.id);
  const grades = s.grades[c.id] || [];
  if (exam) return <Exam c={c} save={save} back={() => setExam(false)} />;
  return (
    <div className="screen"><div className="sc-in">
      <button className="back" onClick={close}>رجوع</button>
      <h2>{c.title}</h2>
      <p className="mute">{c.teacher}</p>
      <p>{c.blurb}</p>
      {!en && <button className="btn" onClick={() => enroll(c.id)}>سجّل بالكورس</button>}
      <ol className="lessons">
        {c.lessons.map((l, i) => {
          const ok = d.includes(i), cur = en && i === d.length;
          return <li key={l} className={ok ? 'ok' : cur ? 'cur' : ''}><span>{l}</span>
            {cur && <button className="mini" onClick={() => finish(c.id)}>أنهيت الدرس</button>}{ok && <em>تم</em>}</li>;
        })}
      </ol>
      {en && d.length === c.lessons.length && <button className="btn" onClick={() => setExam(true)}>{grades.length ? 'أعد الاختبار' : 'ابدأ الاختبار النهائي'}</button>}
      {grades.length > 0 && <p className="result">أفضل علامة: {Math.max(...grades)}%</p>}
    </div></div>
  );
}

const topics = {
  'شو الكورسات؟': `عندنا ${courses.length} مقررًا بـ${specs.length} اختصاصات، من التقنية للهندسة والصحة واللغات والتصميم والقانون. اختر اختصاصك وبتصير المنصة كلها على مواده.`,
  'كيف بتابع تقدمي؟': 'الحلقة بالزاوية اليمين فوق بتعدّ دروسك المنتهية بمواد اختصاصك وبتنقلك من مبتدئ لمحترف. اضغط عليها وبتفتح ملفك مع مقرراتك.',
  'كيف الاختبارات؟': 'بعد ما تخلّص دروس المقرر بيفتح الاختبار النهائي. علامتك بتنحفظ بملفك، والنجاح من ٦٠٪، وبتقدر تعيد المحاولة لحد ما ترضى عن علامتك.',
};

function ripple(e) {
  const r = e.currentTarget, b = r.getBoundingClientRect(), i = document.createElement('i');
  i.className = 'rp'; i.style.left = e.clientX - b.left + 'px'; i.style.top = e.clientY - b.top + 'px';
  r.appendChild(i); setTimeout(() => i.remove(), 800);
}
function tilt(e) {
  const el = e.currentTarget, b = el.getBoundingClientRect();
  el.style.setProperty('--ry', ((e.clientX - b.left) / b.width - 0.5) * 10 + 'deg');
  el.style.setProperty('--rx', -((e.clientY - b.top) / b.height - 0.5) * 10 + 'deg');
}
function untilt(e) { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); }

function Logo({ big }) {
  return (
    <span className={`logo ${big ? 'big' : ''}`}>
      <svg viewBox="0 0 40 28" aria-hidden="true"><circle cx="14" cy="14" r="10" /><circle cx="26" cy="14" r="10" /></svg>
      <span><b>معًا</b><small>لنبني مهارات</small></span>
    </span>
  );
}

function Art({ sp, label }) {
  return (
    <span className="art" style={{ backgroundImage: `url(/img/${sp.id}.jpg)` }} onClick={ripple}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={sp.icon} /></svg>
      {label && <em>{label}</em>}
    </span>
  );
}

function Intro({ onDone }) {
  return (
    <div className="intro">
      <Logo big />
      <h1>{['معًا', 'لنبني', 'مستقبلًا', 'أفضل'].map((w, i) => <span key={w} style={{ animationDelay: `${0.4 + i * 0.45}s` }}>{w}</span>)}</h1>
      <p>اختر اختصاصك وابدأ أول خطوة نحو مهارة بتفرق معك.</p>
      <button className="btn go" onClick={onDone}>يلا نبدأ</button>
    </div>
  );
}

function Typed({ text, onDone }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return onDone?.();
    const id = setTimeout(() => setN(n + 1), 20);
    return () => clearTimeout(id);
  }, [n]);
  return <>{text.slice(0, n)}{n < text.length && <span className="caret" />}</>;
}

function Guide({ name, spec, onSpec, onClose }) {
  const [msgs, setMsgs] = useState([{ r: 'ai', t: spec ? `أهلًا من جديد ${name}! شو بتحب تعرف؟` : `أهلًا ${name}! أنا مرشدك بمنصة معًا. اختر اختصاصك وأنا برتّب لك كل المقررات على مواده.` }]);
  const [busy, setBusy] = useState(true);
  const [picked, setPicked] = useState(!!spec);
  const box = useRef(null);
  useEffect(() => { box.current?.scrollTo({ top: 99999, behavior: 'smooth' }); }, [msgs, busy]);
  const say = (q, a) => { setBusy(true); setMsgs((m) => [...m, { r: 'me', t: q }, { r: 'ai', t: a }]); };
  const pick = (sp) => {
    onSpec(sp.id); setPicked(true);
    say(sp.name, `ممتاز! حضّرت لك ${courses.filter((c) => c.spec === sp.id).length} مقررات بـ${sp.name}، والصفحة كلها صارت على مواد اختصاصك. شو بتحب تعرف كمان؟`);
  };
  return (
    <div className="gd" role="dialog" aria-label="مرشد معًا">
      <div className="gd-in">
        <div className="gd-h"><i className="orb" /><b>مرشد معًا</b><button className="back" style={{ marginInlineStart: 'auto' }} onClick={onClose}>تخطي</button></div>
        <div className="gd-b" ref={box}>
          {msgs.map((m, i) => <p key={i} className={`m ${m.r}`}>{m.r === 'ai' ? <Typed text={m.t} onDone={() => setBusy(false)} /> : m.t}</p>)}
        </div>
        <div className="gd-f">
          {!busy && !picked && specs.map((sp) => <button key={sp.id} className="cp" onClick={() => pick(sp)}>{sp.name}</button>)}
          {!busy && picked && Object.keys(topics).map((q) => <button key={q} className="cp" onClick={() => say(q, topics[q])}>{q}</button>)}
          {!busy && picked && <button className="cp go" onClick={onClose}>ابدأ رحلتي</button>}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [s, setS] = useState(empty);
  const [ready, setReady] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [open, setOpen] = useState(null);
  const [idx, setIdx] = useState(0);
  const [guide, setGuide] = useState(false);
  const [intro, setIntro] = useState(true);
  const [q, setQ] = useState('');
  const rail = useRef(null);

  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem(KEY)); if (v) setS({ ...empty, ...v }); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }, [s, ready]);
  useEffect(() => { setIdx(0); rail.current?.scrollTo({ left: 0 }); }, [s.spec]);

  if (!ready) return null;
  if (!s.user) return <AuthCard onAuth={(user) => setS((p) => (p.owner === user.email ? { ...p, user } : { ...empty, owner: user.email, user }))} />;

  const mine = s.spec ? courses.filter((c) => c.spec === s.spec) : courses;
  const slides = s.spec ? mine : specs.map((sp) => courses.find((c) => c.spec === sp.id));
  const list = mine.filter((c) => c.title.includes(q.trim()));
  const total = mine.reduce((a, c) => a + c.lessons.length, 0);
  const doneN = mine.reduce((a, c) => a + (s.done[c.id] || []).length, 0);
  const pct = Math.round((doneN / total) * 100);
  const lvl = levelOf(pct);
  const hue = specById[slides[Math.min(idx, slides.length - 1)].spec].h;
  const enroll = (id) => setS((p) => (p.enrolled.includes(id) ? p : { ...p, enrolled: [...p.enrolled, id] }));
  const finish = (id) => setS((p) => { const d = p.done[id] || []; return { ...p, done: { ...p.done, [id]: [...d, d.length] } }; });
  const save = (id, score) => setS((p) => ({ ...p, grades: { ...p.grades, [id]: [...(p.grades[id] || []), score] } }));
  const pickSpec = (id) => setS((p) => ({ ...p, spec: id }));
  const go = (i) => rail.current?.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  const onScroll = (e) => setIdx(Math.round(Math.abs(e.currentTarget.scrollLeft) / e.currentTarget.clientWidth));
  const closeGuide = () => { setGuide(false); setS((p) => ({ ...p, seen: true })); };
  const openCourse = (id) => { setDrawer(false); setOpen(id); };
  const prog = (c) => Math.round(((s.done[c.id] || []).length / c.lessons.length) * 100);

  return (
    <div className="app" style={{ '--h': hue }} onPointerMove={(e) => { e.currentTarget.style.setProperty('--mx', e.clientX + 'px'); e.currentTarget.style.setProperty('--my', e.clientY + 'px'); }}>
      <header className="bar">
        <button className="corner" onClick={() => setDrawer(true)} aria-label="ملفي ومقرراتي">
          <Ring pct={pct} /><span><b>{lvl}</b><small>{pct}% نحو الاحتراف</small></span>
        </button>
        <div className="lg"><Logo /><button className="ask" onClick={() => setGuide(true)}>✦ اسأل المرشد</button></div>
      </header>

      <div className="rail" ref={rail} onScroll={onScroll}>
        {slides.map((c, i) => {
          const sp = specById[c.spec];
          return (
            <article className={`slide ${i === idx ? 'act' : ''}`} key={c.id} style={{ '--h': sp.h }}>
              <i className="tag" aria-hidden="true">{c.tag || sp.tag}</i>
              <div className="sl-body">
                <h2>{c.title}</h2>
                <div className="chips"><span>{sp.name}</span><span>{c.lessons.length} دروس</span><span>اختبار نهائي</span></div>
                <p>{c.blurb}</p>
                {s.enrolled.includes(c.id) && <div className="bar2"><i style={{ width: prog(c) + '%' }} /></div>}
                <button className="btn go" onClick={() => setOpen(c.id)}>{s.enrolled.includes(c.id) ? 'كمّل المقرر' : 'اعرف أكثر وسجّل'}</button>
              </div>
            </article>
          );
        })}
      </div>
      <footer className="foot">
        <button className="nv" aria-label="السابق" onClick={() => go(Math.max(idx - 1, 0))}>→</button>
        {slides.map((c, i) => <button key={c.id} className="dot" aria-label={c.title} aria-current={i === idx ? 'true' : undefined} onClick={() => go(i)} />)}
        <button className="nv" aria-label="التالي" onClick={() => go(Math.min(idx + 1, slides.length - 1))}>←</button>
      </footer>

      <section className="sec">
        <h2>اختصاصك</h2>
        <p className="mute">اختر اختصاصك وبتصير الصفحة كلها على مواده. اضغط عليه مرة ثانية لعرض الكل.</p>
        <div className="specs">
          {specs.map((sp) => (
            <button key={sp.id} className={`spec ${s.spec === sp.id ? 'sel' : ''}`} style={{ '--h': sp.h }} onClick={() => pickSpec(s.spec === sp.id ? null : sp.id)}>
              <Art sp={sp} label={sp.tag} />
              <b>{sp.name}</b><small>{courses.filter((c) => c.spec === sp.id).length} مقررات</small>
            </button>
          ))}
        </div>
      </section>

      <section className="sec" id="catalog">
        <div className="sh">
          <h2>{s.spec ? specById[s.spec].name : 'كل المقررات'} <small>({list.length})</small></h2>
          <input className="srch" placeholder="ابحث عن مقرر" aria-label="بحث عن مقرر" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="grid">
          {list.map((c) => {
            const sp = specById[c.spec], en = s.enrolled.includes(c.id);
            return (
              <article className="card" key={c.id} style={{ '--h': sp.h }} onPointerMove={tilt} onPointerLeave={untilt}>
                <Art sp={sp} label={sp.tag} />
                <div className="cb">
                  <small className="spn">{sp.name}</small>
                  <h3>{c.title}</h3>
                  <p>{c.blurb}</p>
                  <div className="chips"><span>{c.lessons.length} دروس</span><span>اختبار نهائي</span></div>
                  {en && <div className="bar2"><i style={{ width: prog(c) + '%' }} /></div>}
                  <button className="btn go" onClick={() => setOpen(c.id)}>{en ? 'كمّل المقرر' : 'التفاصيل والتسجيل'}</button>
                </div>
              </article>
            );
          })}
        </div>
        {list.length === 0 && <p className="mute">ما في مقرر بهالاسم.</p>}
      </section>
      <footer className="end"><Logo /><p>معًا لنبني مستقبلًا أفضل</p></footer>

      <div className={`scrim ${drawer ? 'on' : ''}`} onClick={() => setDrawer(false)} />
      <aside className={`drawer ${drawer ? 'on' : ''}`} aria-label="ملفي ومقرراتي">
        <button className="back" onClick={() => setDrawer(false)}>إغلاق</button>
        <div className="who"><div className="av2">{s.user.name[0]}</div><div><b>{s.user.name}</b><p className="mute" dir="ltr">{s.user.email}</p></div></div>
        <h3>مستواك: {lvl} ({pct}%)</h3>
        <div className="track"><i style={{ width: pct + '%' }} />{levels.map(([t, n]) => <span key={n} style={{ insetInlineStart: t + '%' }}>{n}</span>)}</div>
        <h3>مقرراتي</h3>
        {s.enrolled.length === 0 && <p className="mute">ما سجّلت بأي مقرر بعد، اختر مقررًا من الصفحة الرئيسية.</p>}
        {s.enrolled.map((id) => {
          const c = courses.find((x) => x.id === id), g = s.grades[id] || [];
          return (
            <button className="lms" key={id} onClick={() => openCourse(id)}>
              <b>{c.title}</b>
              <small>{g.length ? `أفضل علامة ${Math.max(...g)}%` : prog(c) === 100 ? 'جاهز للاختبار النهائي' : `${(s.done[id] || []).length} من ${c.lessons.length} دروس`}</small>
              <div className="bar2"><i style={{ width: prog(c) + '%' }} /></div>
            </button>
          );
        })}
        <button className="swap-out" onClick={() => { setDrawer(false); setS({ ...s, user: null }); }}>تسجيل الخروج</button>
      </aside>

      {open && <Course c={courses.find((x) => x.id === open)} s={s} enroll={enroll} finish={finish} save={save} close={() => setOpen(null)} />}
      {!s.seen && intro && <Intro onDone={() => setIntro(false)} />}
      {((!s.seen && !intro) || guide) && <Guide name={s.user.name} spec={s.spec} onSpec={pickSpec} onClose={closeGuide} />}
    </div>
  );
}
