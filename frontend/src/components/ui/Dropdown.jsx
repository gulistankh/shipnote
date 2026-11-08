import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Portal from './Portal';
import { colors, fonts, radius, shadow, z } from '../../theme/tokens';

export default function Dropdown({ trigger, items = [], align = 'right', width = 220, fullWidth = false }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, ready: false });
  const [hoverIndex, setHoverIndex] = useState(-1);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const menuWidth = Math.min(width, window.innerWidth - 16);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current ? menuRef.current.offsetHeight : 0;

    let left = align === 'right' ? r.right - menuWidth : r.left;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    let top = r.bottom + 6;
    if (top + menuHeight > window.innerHeight - 8) {
      const above = r.top - menuHeight - 6;
      top = above > 8 ? above : Math.max(8, window.innerHeight - menuHeight - 8);
    }
    setPos({ top, left, ready: true });
  }, [open, align, menuWidth]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScroll = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onResize = () => setOpen(false);

    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const toggle = () => {
    setPos((p) => ({ ...p, ready: false }));
    setOpen((o) => !o);
  };

  return (
    <>      <span ref={triggerRef} onClick={toggle} style={{ display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined }}>

        {trigger}
      </span>

      {open && (
        <Portal>
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              width: menuWidth,
              maxHeight: 'calc(100dvh - 16px)',
              overflowY: 'auto',
              zIndex: z.dropdown,
              background: colors.white,
              border: `1px solid ${colors.line}`,
              borderRadius: radius.md,
              boxShadow: shadow.pop,
              padding: 6,
              visibility: pos.ready ? 'visible' : 'hidden',
              animation: pos.ready ? 'sn-fade 0.12s ease-out' : 'none',
            }}
          >
            {items.map((item, i) =>
              item.divider ? (
                <div key={`d${i}`} style={{ height: 1, background: colors.line, margin: '6px 0' }} />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(-1)}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: radius.sm,
                    background: hoverIndex === i ? colors.hover : 'transparent',
                    color: item.danger ? colors.red : colors.text,
                    fontFamily: fonts.body,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </Portal>
      )}
    </>
  );
}