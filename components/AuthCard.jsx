'use client';
import { useState } from 'react';

const icons = {
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',
};

function Field({ i, icon, label, ...input }) {
  return (
    <label className="field stag" style={{ '--i': i }}>
      <input placeholder=" " required {...input} />
      <span>{label}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[icon]} /></svg>
      <b />
    </label>
  );
}

export default function AuthCard({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const reg = mode === 'register';

  function switchTo(m) {
    setMsg({ type: '', text: '' });
    setMode(m);
  }

  async function submit(e, m) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: m, ...data }),
      });
      const json = await res.json();
      setMsg({ type: res.ok ? 'ok' : 'err', text: json.message });
      if (res.ok) setTimeout(() => onAuth?.({ name: data.username || data.email.split('@')[0], email: data.email }), 600);
    } catch {
      setMsg({ type: 'err', text: 'تعذّر الاتصال بالخادم، تأكد من الإنترنت وجرّب من جديد.' });
    }
    setBusy(false);
  }

  const Msg = ({ m }) =>
    mode === m && msg.text ? <p className={`msg ${msg.type}`} role="status">{msg.text}</p> : null;

  return (
    <main className="glow">
      <div className={`wrap ${reg ? 'reg' : 'login'}`}>
        <div className="curve" />

        <section className={`panel info info-l ${!reg ? 'on' : ''}`}>
          <h1 className="stag" style={{ '--i': 0 }}>أهلاً بعودتك</h1>
          <p className="stag" style={{ '--i': 1 }}>كمّل دروسك من وين وقفت، وتقدّمك بانتظارك.</p>
        </section>
        <section className={`panel info info-r ${reg ? 'on' : ''}`}>
          <h1 className="stag" style={{ '--i': 0 }}>ابدأ رحلتك</h1>
          <p className="stag" style={{ '--i': 1 }}>أنشئ حسابك مجانًا واختر كورسك الأول.</p>
        </section>

        <form className={`panel box box-r ${!reg ? 'on' : ''}`} onSubmit={(e) => submit(e, 'login')}>
          <h2 className="stag" style={{ '--i': 0 }}>تسجيل الدخول</h2>
          <Field i={1} icon="mail" label="البريد الإلكتروني" name="email" type="email" autoComplete="email" />
          <Field i={2} icon="lock" label="كلمة المرور" name="password" type="password" autoComplete="current-password" />
          <button className="btn stag" style={{ '--i': 3 }} disabled={busy}>دخول</button>
          <Msg m="login" />
          <p className="swap stag" style={{ '--i': 4 }}>
            ما عندك حساب؟ <button type="button" onClick={() => switchTo('register')}>أنشئ حساب</button>
          </p>
        </form>

        <form className={`panel box box-l ${reg ? 'on' : ''}`} onSubmit={(e) => submit(e, 'register')}>
          <h2 className="stag" style={{ '--i': 0 }}>إنشاء حساب</h2>
          <Field i={1} icon="user" label="اسم المستخدم" name="username" autoComplete="username" />
          <Field i={2} icon="mail" label="البريد الإلكتروني" name="email" type="email" autoComplete="email" />
          <Field i={3} icon="lock" label="كلمة المرور (٨ أحرف على الأقل)" name="password" type="password" autoComplete="new-password" />
          <button className="btn stag" style={{ '--i': 4 }} disabled={busy}>إنشاء الحساب</button>
          <Msg m="register" />
          <p className="swap stag" style={{ '--i': 5 }}>
            عندك حساب؟ <button type="button" onClick={() => switchTo('login')}>سجّل دخولك</button>
          </p>
        </form>
      </div>
    </main>
  );
}
