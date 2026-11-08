export const colors = {
  ink: '#0E1116',
  inkSoft: '#1B2029',
  inkLine: 'rgba(255,255,255,0.12)',
  paper: '#F6F7F9',
  white: '#FFFFFF',
  line: '#E4E7EC',
  lineStrong: '#D0D5DD',
  hover: '#EEF0F3',
  text: '#101828',
  muted: '#667085',
  faint: '#98A2B3',
  signal: '#C6F432',
  signalDark: '#B4E01C',
  signalSoft: '#F3FBD0',
  green: '#12B76A',
  greenSoft: '#E7F8EF',
  greenText: '#067647',
  blue: '#2E90FA',
  blueSoft: '#EAF2FF',
  blueText: '#175CD3',
  amber: '#F79009',
  amberSoft: '#FEF3E0',
  amberText: '#B54708',
  red: '#D92D20',
  redSoft: '#FEECEB',
  redLine: '#FDC9C5',
};

export const fonts = {
  heading: "'Bricolage Grotesque', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

export const shadow = {
  pop: '0 12px 32px rgba(14,17,22,0.14)',
  modal: '0 24px 64px rgba(14,17,22,0.28)',
  card: '0 1px 2px rgba(16,24,40,0.05)',
};

export const z = { dropdown: 1150, modal: 1100, toast: 1200 };

export const breakpoints = { sm: 640, md: 900, lg: 1200 };

export const categories = {
  new: { label: 'New', bg: colors.greenSoft, fg: colors.greenText, dot: colors.green },
  improved: { label: 'Improved', bg: colors.blueSoft, fg: colors.blueText, dot: colors.blue },
  fixed: { label: 'Fixed', bg: colors.amberSoft, fg: colors.amberText, dot: colors.amber },
};