// ============================================================
// pages/auth/Signup.jsx   (route: /signup)
// Name + email + password. Creates a real Free account through the API
// and goes straight to onboarding. "?plan=pro" only shows a small note
// (the real upgrade happens later in Billing with Stripe).
// Server errors (email already used, weak input) appear on the form.
// ============================================================
import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { colors, radius } from '../../theme/tokens';

export default function Signup() {
  const { user, loading: authLoading, signup } = useAuth();
  const [params] = useSearchParams();
  const wantsPro = params.get('plan') === 'pro';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Waiting for the first "who is logged in" answer, or already logged in
  if (authLoading) return null;
  if (user) return <Navigate to="/app" replace />;

  // --- Validate, then create the account ---
  async function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (name.trim().length < 2) next.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') setErrors({ email: err.message });
      else if (err.fields && Object.keys(err.fields).length) setErrors(err.fields);
      else setErrors({ form: err.message });
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever. No card needed."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" style={{ color: colors.text, fontWeight: 600 }}>Log in</Link>
        </>
      }
    >
      {/* --- Note shown when the visitor clicked "Go Pro" --- */}
      {wantsPro && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            padding: '12px 14px',
            borderRadius: radius.md,
            background: colors.signalSoft,
            fontSize: 14,
          }}
        >
          <Badge tone="dark" dot={false}>PRO</Badge>
          <span>Great choice. Set up your account first, then upgrade from Billing.</span>
        </div>
      )}

      {/* --- Signup form --- */}
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
          label="Name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Work email"
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>Create account</Button>
      </form>
    </AuthLayout>
  );
}