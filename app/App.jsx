'use client';
import { useEffect, useRef, useState } from 'react';
import AuthCard from './AuthCard';
import { courses, levels, levelOf } from '../lib/courses';

const KEY = 'masari-v1';
const empty = { user: null, owner: null, enrolled: [], done: {}, grades: {}, seen: false };
const total = courses.reduce((a, c) => a + c.lessons.length, 0);

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
  function submit() {
    const n = Object.keys(a).length;
    if (n < c.quiz.length) return setErr(`جاوب على كل الأسئلة أولًا (${n} من ${c.quiz.length}).`);
    const ok = c.quiz.filter((q, i) => a[i] === q[2]).length;
    const score = Math.round((ok / c.quiz.length) * 100);
    save(c.id, score);
    setRes(score);
  }
  return (
    <div className="screen"><div className="sc-in">
      <button className="back" onClick={back}>رجوع</button>
      <h2>اختبار {c.title}</h2>
      {c.quiz.map((q, i) => (
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
  'شو الكورسات؟': 'عندنا ٤ مسارات عملية: واجهات الويب، قواعد البيانات، JavaScript، وتجربة المستخدم. كل مسار ٤ دروس واختبار نهائي، وكلهم بيكمّلوا بعض لتوصل لمستوى محترف.',
  'كيف بتابع تقدمي؟': 'الحلقة بالزاوية اليمين فوق بتعدّ دروسك المنتهية وبتنقلك من مبتدئ لمتوسط لمتقدّم لمحترف. اضغط عليها وبتفتح ملفك مع كل مقرراتك.',
  'كيف الاختبارات؟': 'بعد ما تخلّص دروس الكورس بيفتح الاختبار النهائي. علامتك بتنحفظ بملفك، والنجاح من ٦٠٪، وبتقدر تعيد المحاولة لحد ما ترضى عن علامتك.',
};

function Typed({ text, onDone }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return onDone?.();
    const id = setTimeout(() => setN(n + 1), 20);
    return () => clearTimeout(id);
  }, [n]);
  return <>{text.slice(0, n)}{n < text.length && <span className="caret" />}</>;
}

function Guide({ name, onClose }) {
  const [msgs, setMsgs] = useState([{ r: 'ai', t: `أهلاً ${name}! أنا مرشدك بمساري. ما رح ياخد وقتك، شو بتحب تعرف أول؟` }]);
  const [busy, setBusy] = useState(true);
  const box = useRef(null);
  useEffect(() => { box.current?.scrollTo({ top: 99999, behavior: 'smooth' }); }, [msgs, busy]);
  const ask = (q) => { setBusy(true); setMsgs((m) => [...m, { r: 'me', t: q }, { r: 'ai', t: topics[q] }]); };
  return (
    <div className="gd" role="dialog" aria-label="مرشد مساري">
      <div className="gd-in">
        <div className="gd-h"><i className="orb" /><b>مرشد مساري</b><button className="back" style={{ marginInlineStart: 'auto' }} onClick={onClose}>تخطي</button></div>
        <div className="gd-b" ref={box}>
          {msgs.map((m, i) => (
            <p key={i} className={`m ${m.r}`}>{m.r === 'ai' ? <Typed text={m.t} onDone={() => setBusy(false)} /> : m.t}</p>
          ))}
        </div>
        <div className="gd-f">
          {!busy && Object.keys(topics).map((q) => <button key={q} className="cp" onClick={() => ask(q)}>{q}</button>)}
          {!busy && <button className="cp go" onClick={onClose}>ابدأ رحلتي</button>}
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
  const rail = useRef(null);
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem(KEY)); if (v) setS({ ...empty, ...v }); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }, [s, ready]);

  if (!ready) return null;
  if (!s.user) return <AuthCard onAuth={(user) => setS((p) => (p.owner === user.email ? { ...p, user } : { ...empty, owner: user.email, user }))} />;

  const doneN = Object.values(s.done).reduce((a, d) => a + d.length, 0);
  const pct = Math.round((doneN / total) * 100);
  const lvl = levelOf(pct);
  const enroll = (id) => setS((p) => (p.enrolled.includes(id) ? p : { ...p, enrolled: [...p.enrolled, id] }));
  const finish = (id) => setS((p) => { const d = p.done[id] || []; return { ...p, done: { ...p.done, [id]: [...d, d.length] } }; });
  const save = (id, score) => setS((p) => ({ ...p, grades: { ...p.grades, [id]: [...(p.grades[id] || []), score] } }));
  const go = (i) => rail.current?.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  const onScroll = (e) => setIdx(Math.round(Math.abs(e.currentTarget.scrollLeft) / e.currentTarget.clientWidth));
  const closeGuide = () => { setGuide(false); setS((p) => ({ ...p, seen: true })); };
  const openCourse = (id) => { setDrawer(false); setOpen(id); };
  const prog = (c) => Math.round(((s.done[c.id] || []).length / c.lessons.length) * 100);

  return (
    <div className="app" style={{ '--h': courses[idx].h }} onPointerMove={(e) => { e.currentTarget.style.setProperty('--mx', e.clientX + 'px'); e.currentTarget.style.setProperty('--my', e.clientY + 'px'); }}>
      <header className="bar">
        <button className="corner" onClick={() => setDrawer(true)} aria-label="ملفي ومقرراتي">
          <Ring pct={pct} /><span><b>{lvl}</b><small>{pct}% نحو الاحتراف</small></span>
        </button>
        <div className="lg"><strong className="logo">مساري</strong><button className="ask" onClick={() => setGuide(true)}>✦ اسأل المرشد</button></div>
      </header>

      <div className="rail" ref={rail} onScroll={onScroll}>
        {courses.map((c, i) => (
          <article className={`slide ${i === idx ? 'act' : ''}`} key={c.id} style={{ '--h': c.h }}>
            <i className="tag" aria-hidden="true">{c.tag}</i>
            <div className="sl-body">
              <h2>{c.title}</h2>
              <div className="chips"><span>{c.teacher}</span><span>{c.lessons.length} دروس</span><span>اختبار نهائي</span></div>
              <p>{c.blurb}</p>
              {s.enrolled.includes(c.id) && <div className="bar2"><i style={{ width: prog(c) + '%' }} /></div>}
              <button className="btn go" onClick={() => setOpen(c.id)}>{s.enrolled.includes(c.id) ? 'كمّل الكورس' : 'اعرف أكثر وسجّل'}</button>
            </div>
          </article>
        ))}
      </div>
      <footer className="foot">
        <button className="nv" aria-label="السابق" onClick={() => go(Math.max(idx - 1, 0))}>→</button>
        {courses.map((c, i) => <button key={c.id} className="dot" aria-label={c.title} aria-current={i === idx ? 'true' : undefined} onClick={() => go(i)} />)}
        <button className="nv" aria-label="التالي" onClick={() => go(Math.min(idx + 1, courses.length - 1))}>←</button>
      </footer>

      <div className={`scrim ${drawer ? 'on' : ''}`} onClick={() => setDrawer(false)} />
      <aside className={`drawer ${drawer ? 'on' : ''}`} aria-label="ملفي ومقرراتي">
        <button className="back" onClick={() => setDrawer(false)}>إغلاق</button>
        <div className="who"><div className="av2">{s.user.name[0]}</div><div><b>{s.user.name}</b><p className="mute" dir="ltr">{s.user.email}</p></div></div>
        <h3>مستواك: {lvl} ({pct}%)</h3>
        <div className="track"><i style={{ width: pct + '%' }} />{levels.map(([t, n]) => <span key={n} style={{ insetInlineStart: t + '%' }}>{n}</span>)}</div>
        <h3>مقرراتي</h3>
        {s.enrolled.length === 0 && <p className="mute">ما سجّلت بأي كورس بعد، اختر كورسًا من الشاشة الرئيسية.</p>}
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
      {(!s.seen || guide) && <Guide name={s.user.name} onClose={closeGuide} />}
    </div>
  );
}
