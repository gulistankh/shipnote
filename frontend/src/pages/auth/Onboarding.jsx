// ============================================================
// pages/auth/Onboarding.jsx   (route: /onboarding)
// Three steps after signup:
//   1) Product name
//   2) Public page name (slug): checked locally for format AND on the
//      server for "reserved / already taken" while you type
//   3) Accent colour (6 presets for everyone, custom hex for Pro only)
// A live preview of the public page sits next to the form.
// On finish it creates the product through the API and goes to /app.
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import { accentPresets } from '../../data/mockData';
import { slugify, validateSlug } from '../../utils/slug';
import { colors, fonts, radius } from '../../theme/tokens';

const stepTitles = ['Name your product', 'Choose your page address', 'Pick an accent colour'];
const hexPattern = /^#[0-9a-fA-F]{6}$/;

// --- Live preview of the public page ---
function Preview({ name, slug, accent, showBadge }) {
  return (
    <div style={{ background: colors.white, border: `1px solid ${colors.line}`, borderRadius: radius.lg, overflow: 'hidden' }}>
      <div style={{ height: 6, background: accent }} />
      <div style={{ padding: 20 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.faint, overflowWrap: 'anywhere' }}>
          shipnote.app/p/{slug || 'your-page'}
        </div>
        <h3 style={{ fontSize: 24, marginTop: 10 }}>What's new in {name || 'your product'}</h3>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${colors.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge category="new" />
            <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.faint }}>Today</span>
          </div>
          <div style={{ fontWeight: 600, marginTop: 8 }}>Your first update goes here</div>
          <div style={{ color: colors.muted, fontSize: 14, marginTop: 2 }}>Short, clear notes your customers will read.</div>
          <span
            style={{
              display: 'inline-block',
              marginTop: 14,
              padding: '8px 14px',
              borderRadius: radius.sm,
              background: accent,
              color: colors.white,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Subscribe
          </span>
        </div>

        {showBadge && <div style={{ marginTop: 18, fontSize: 12, color: colors.faint }}>Made with Shipnote</div>}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 899px)');
  const isPro = user?.plan === 'pro';

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [accent, setAccent] = useState(accentPresets[0].value);
  const [customHex, setCustomHex] = useState('#0E1116');
  const [saving, setSaving] = useState(false);

  // Result of the server's page-name check: idle | checking | ok | taken
  const [remote, setRemote] = useState({ state: 'idle', message: '' });

  // --- Local format check (instant) ---
  const slugError = validateSlug(slug);

  // --- Server check (reserved or already taken), after a short pause in typing ---
  useEffect(() => {
    setRemote({ state: 'idle', message: '' });
    if (!slug || validateSlug(slug)) return undefined;

    setRemote({ state: 'checking', message: '' });
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await api(`/products/slug-check?slug=${encodeURIComponent(slug)}`);
        if (cancelled) return;
        setRemote(
          result.available
            ? { state: 'ok', message: '' }
            : { state: 'taken', message: result.reason || 'That name is already taken.' }
        );
      } catch {
        // If the check fails, the server checks again when we finish
        if (!cancelled) setRemote({ state: 'idle', message: '' });
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug]);

  // --- Per-step validity (controls the Continue button) ---
  const nameValid = name.trim().length >= 2;
  const slugUsable = !slugError && remote.state !== 'taken' && remote.state !== 'checking';
  const canContinue = step === 0 ? nameValid : step === 1 ? slugUsable : true;

  // --- Typing the product name suggests a page address (until the user edits it) ---
  function handleName(value) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  // --- Custom colour (Pro only) ---
  function handleHex(value) {
    setCustomHex(value);
    if (hexPattern.test(value)) setAccent(value);
  }

  // --- Finish: create the product on the server, then go to the dashboard ---
  async function finish() {
    setSaving(true);
    try {
      await completeOnboarding({ name: name.trim(), slug, accent });
      toast('Your page is ready');
      navigate('/app', { replace: true });
    } catch (err) {
      setSaving(false);
      if (err.code === 'SLUG_TAKEN') {
        setRemote({ state: 'taken', message: err.message });
        setStep(1);
      } else if (err.code === 'ALREADY_ONBOARDED') {
        navigate('/app', { replace: true });
      } else {
        toast(err.message, 'error');
      }
    }
  }

  // --- Message shown under the page name field ---
  const slugMessage = slug && slugError ? slugError : remote.state === 'taken' ? remote.message : '';

  return (
    <div style={{ minHeight: '100dvh', background: colors.paper }}>
      {/* --- Top bar --- */}
      <header
        style={{
          padding: 'calc(16px + env(safe-area-inset-top)) 20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1040,
          margin: '0 auto',
        }}
      >
        <Logo />
        <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.muted }}>Step {step + 1} of 3</span>
      </header>

      <main
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          padding: isMobile ? '8px 20px 48px' : '24px 20px 64px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 28 : 48,
          alignItems: 'start',
        }}
      >
        {/* --- Left: progress + current step --- */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? colors.ink : colors.line }} />
            ))}
          </div>

          <div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 38px)' }}>{stepTitles[step]}</h1>
            <p style={{ color: colors.muted, marginTop: 8 }}>
              {step === 0 && 'This is the product your customers will see updates for.'}
              {step === 1 && 'Anyone can open this link, no login needed. You can change it later.'}
              {step === 2 && 'Your public page uses this colour for buttons and highlights.'}
            </p>
          </div>

          {/* Step 1: product name */}
          {step === 0 && (
            <Input
              label="Product name"
              placeholder="e.g. Acme Analytics"
              value={name}
              onChange={(e) => handleName(e.target.value)}
              autoFocus
            />
          )}

          {/* Step 2: page address */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Input
                label="Page name"
                placeholder="my-product"
                value={slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(e.target.value.toLowerCase());
                }}
                error={slugMessage}
                hint={`Your page: shipnote.app/p/${slug || 'your-page'}`}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              {remote.state === 'checking' && <span style={{ fontSize: 14, color: colors.muted }}>Checking…</span>}
              {remote.state === 'ok' && (
                <span style={{ fontSize: 14, color: colors.greenText, fontWeight: 500 }}>✓ This name is available</span>
              )}
            </div>
          )}

          {/* Step 3: accent colour */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {accentPresets.map((c) => {
                  const active = accent.toLowerCase() === c.value.toLowerCase();
                  return (
                    <button
                      key={c.value}
                      type="button"
                      aria-label={c.name}
                      aria-pressed={active}
                      onClick={() => setAccent(c.value)}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: c.value,
                        border: `3px solid ${colors.white}`,
                        boxShadow: active ? `0 0 0 2px ${colors.ink}` : `0 0 0 1px ${colors.line}`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Custom colour: Pro only */}
              <div
                style={{
                  padding: 16,
                  borderRadius: radius.md,
                  border: `1px solid ${colors.line}`,
                  background: colors.white,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 14 }}>Custom colour</strong>
                  {!isPro && <Badge tone="dark" dot={false}>PRO</Badge>}
                </div>
                {isPro ? (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="color"
                      aria-label="Pick a colour"
                      value={hexPattern.test(customHex) ? customHex : '#0E1116'}
                      onChange={(e) => handleHex(e.target.value)}
                      style={{ width: 46, height: 46, border: 'none', background: 'none', padding: 0 }}
                    />
                    <Input
                      aria-label="Hex colour"
                      value={customHex}
                      onChange={(e) => handleHex(e.target.value)}
                      wrapperStyle={{ flex: 1 }}
                      style={{ fontFamily: fonts.mono }}
                    />
                  </div>
                ) : (
                  <p style={{ color: colors.muted, fontSize: 14 }}>
                    Any brand colour is a Pro feature. You can upgrade later from Billing.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {step > 0 && (
              <Button variant="secondary" size="lg" disabled={saving} onClick={() => setStep(step - 1)}>Back</Button>
            )}
            {step < 2 ? (
              <Button size="lg" disabled={!canContinue} onClick={() => setStep(step + 1)} style={{ flex: isMobile ? 1 : undefined }}>
                Continue
              </Button>
            ) : (
              <Button variant="signal" size="lg" loading={saving} onClick={finish} style={{ flex: isMobile ? 1 : undefined }}>
                Create my page
              </Button>
            )}
          </div>
        </section>

        {/* --- Right: live preview --- */}
        <section aria-label="Preview" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.muted }}>LIVE PREVIEW</span>
          <Preview name={name.trim()} slug={slug} accent={accent} showBadge={!isPro} />
        </section>
      </main>
    </div>
  );
}