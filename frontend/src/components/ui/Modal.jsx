import { useEffect } from 'react';
import Portal from './Portal';
import { colors, radius, shadow, z } from '../../theme/tokens';

export default function Modal({ open, onClose, title, children, footer, width = 480 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Portal>
      <div
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          height: '100dvh',
          zIndex: z.modal,
          background: 'rgba(14,17,22,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding:
            'max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))',
          animation: 'sn-fade 0.15s ease-out',
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          style={{
            width: '100%',
            maxWidth: width,
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: colors.white,
            borderRadius: radius.lg,
            boxShadow: shadow.modal,
            overflow: 'hidden',
            animation: 'sn-rise 0.2s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '18px 20px',
              borderBottom: `1px solid ${colors.line}`,
            }}
          >
            <h2 style={{ fontSize: 20 }}>{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                border: 'none',
                background: 'transparent',
                borderRadius: radius.sm,
                fontSize: 22,
                lineHeight: 1,
                color: colors.muted,
              }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>{children}</div>

          {footer && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                gap: 10,
                padding: '14px 20px',
                borderTop: `1px solid ${colors.line}`,
                background: colors.paper,
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}