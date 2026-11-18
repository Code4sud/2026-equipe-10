import type { ReactNode } from 'react';

const Svg = ({ size = 22, children }: { size?: number; children: ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const Star = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--c-accent)" aria-hidden="true">
    <path d="M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8z" />
  </svg>
);

export const IconRapport = ({ size }: { size?: number }) => (
  <Svg size={size}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></Svg>
);
export const IconMetiers = ({ size }: { size?: number }) => (
  <Svg size={size}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Svg>
);
export const IconChat = ({ size }: { size?: number }) => (
  <Svg size={size}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></Svg>
);
export const IconCentre = ({ size }: { size?: number }) => (
  <Svg size={size}><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" /></Svg>
);
export const IconUpload = ({ size = 40 }: { size?: number }) => (
  <Svg size={size}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M12 17v-6M9.5 13.5L12 11l2.5 2.5" /></Svg>
);
export const IconCheck = ({ size = 20 }: { size?: number }) => (
  <Svg size={size}><path d="M20 6L9 17l-5-5" /></Svg>
);
export const IconMic = ({ size = 20 }: { size?: number }) => (
  <Svg size={size}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></Svg>
);
export const IconSend = ({ size = 20 }: { size?: number }) => (
  <Svg size={size}><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" /></Svg>
);
export const IconReset = ({ size = 18 }: { size?: number }) => (
  <Svg size={size}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Svg>
);
export const IconBack = ({ size = 18 }: { size?: number }) => (
  <Svg size={size}><path d="M15 6l-6 6 6 6" /></Svg>
);
