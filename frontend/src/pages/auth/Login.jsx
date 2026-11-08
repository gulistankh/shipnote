// ============================================================
// pages/auth/Login.jsx   (route: /login)
// Email + password form, plus three one-click demo accounts
// (Free, Pro, Admin). Talks to the real API through AuthContext.
// Server errors (wrong password, rate limit...) are shown on the form.
// After login, <Navigate> sends the user on (onboarding or /app).
// ============================================================
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { colors, radius } from '../../theme/tokens';

export default function Login() {
  const { user, loading: authLoading, login, loginDemo } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');

  // Waiting for the first "who is logged in" answer, or already logged in
  if (authLoading) return null;
  if (user) return <Navigate to="/app" replace />;

  // --- Validate, then log in ---
  async function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const hasFields = err.fields && Object.keys(err.fields).length > 0;
      setErrors(hasFields ? err.fields : { form: err.message });
      setLoading(false);
    }
  }

  // --- Demo buttons ---
  async function handleDemo(kind) {
    setDemoLoading(kind);
    try {
      await loginDemo(kind);
    } catch (err) {
      toast(err.message, 'error');
      setDemoLoading('');
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your updates."
      footer={
        <>
          New to Shipnote?{' '}
          <Link to="/signup" style={{ color: colors.text, fontWeight: 600 }}>Create an account</Link>
        </>
      }
    >
      {/* --- Login form --- */}
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {errors.form && (
          <div
            role="alert"
            style={{
              padding: '12px 14px',
              borderRadius: radius.md,
              background: colors.redSoft,
              border: `1px solid ${colors.redLine}`,
              color: colors.red,
              fontSize: 14,
            }}
          >
            {errors.form}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@startup.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>Log in</Button>
      </form>

      {/* --- Divider --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: colors.faint, fontSize: 13 }}>
        <span style={{ flex: 1, height: 1, background: colors.line }} />
        or try a demo
        <span style={{ flex: 1, height: 1, background: colors.line }} />
      </div>

      {/* --- Demo accounts --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="secondary" fullWidth loading={demoLoading === 'free'} disabled={Boolean(demoLoading)} onClick={() => handleDemo('free')}>
          Demo: Free plan user
        </Button>
        <Button variant="secondary" fullWidth loading={demoLoading === 'pro'} disabled={Boolean(demoLoading)} onClick={() => handleDemo('pro')}>
          Demo: Pro plan user
        </Button>
        <Button variant="secondary" fullWidth loading={demoLoading === 'admin'} disabled={Boolean(demoLoading)} onClick={() => handleDemo('admin')}>
          Demo: Admin
        </Button>
      </div>
    </AuthLayout>
  );
}