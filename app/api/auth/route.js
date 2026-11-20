import { NextResponse } from 'next/server';

// نسخة تجريبية: تتحقق من المدخلات فقط.
// لاحقًا اربطها بقاعدة بيانات (Prisma / MongoDB) وشفّر كلمة المرور بـ bcrypt وأنشئ جلسة.
export async function POST(req) {
  const { mode, username, email, password } = await req.json();
  const bad = (message) => NextResponse.json({ message }, { status: 400 });

  if (mode === 'register' && !(username || '').trim()) return bad('اكتب اسم المستخدم.');
  if (!/^\S+@\S+\.\S+$/.test(email || '')) return bad('البريد غير صحيح، مثال: name@mail.com');
  if ((password || '').length < 8) return bad('كلمة المرور لازم تكون ٨ أحرف على الأقل.');

  return NextResponse.json({
    message: mode === 'register' ? 'تم إنشاء الحساب (تجريبي).' : 'تم تسجيل الدخول (تجريبي).',
  });
}
