import Portal from './Portal';
import { colors, fonts, radius, shadow, z } from '../../theme/tokens';

const dots = { success: colors.signal, error: colors.red, info: colors.blue };

export default function ToastViewport({ toasts }) {
  if (!toasts.length) return null;
  return (
    <Portal>
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 'max(16px, env(safe-area-inset-bottom))',
          zIndex: z.toast,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: '0 16px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              maxWidth: 'min(420px, 100%)',
              padding: '12px 16px',
              background: colors.ink,
              color: colors.white,
              borderRadius: radius.md,
              boxShadow: shadow.pop,
              fontFamily: fonts.body,
              fontSize: 14,
              animation: 'sn-rise 0.2s ease-out',
            }}
          >
            <span
              style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: dots[t.type] || dots.success }}
            />
            {t.message}
          </div>
        ))}
      </div>
    </Portal>
  );
}