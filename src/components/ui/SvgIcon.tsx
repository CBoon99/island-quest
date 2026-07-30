import type { ReactNode } from 'react';

type Props = {
  name:
    | 'home'
    | 'play'
    | 'trophy'
    | 'gift'
    | 'profile'
    | 'star'
    | 'flame'
    | 'shield'
    | 'clock'
    | 'half'
    | 'double'
    | 'guide'
    | 'retry'
    | 'check'
    | 'wobble'
    | 'pause'
    | 'sound'
    | 'parent'
    | 'lock'
    | 'wave'
    | 'leaf'
    | 'map'
    | 'ruins';
  size?: number;
  className?: string;
  title?: string;
};

/** Simple path icons — no emoji chrome */
export function SvgIcon({ name, size = 24, className, title }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    role: title ? 'img' : 'presentation',
    'aria-hidden': title ? undefined : true,
    'aria-label': title,
  };

  const paths: Record<Props['name'], ReactNode> = {
    home: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z" />,
    play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
    trophy: (
      <>
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
        <path d="M7 6H5a3 3 0 0 0 3 3M17 6h2a3 3 0 0 1-3 3" />
      </>
    ),
    gift: (
      <>
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13M3 12h18M12 8c-2 0-3.5-1.5-3.5-3S11 3 12 5c1-2 3.5-2 3.5 0S14 8 12 8z" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c1.5-4 4-6 8-6s6.5 2 8 6" />
      </>
    ),
    star: <path d="M12 3l2.5 6.5H21l-5 4.2 1.8 6.3L12 16.5 6.2 20l1.8-6.3-5-4.2h6.5L12 3z" />,
    flame: <path d="M12 3c2 4-2 5-1 8 3-1 5 1 5 4a6 6 0 1 1-12 0c0-3 2-5 4-7 0 2 1 3 2 3 0-2 1-5 2-8z" />,
    shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    half: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18" />
        <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" opacity="0.25" />
      </>
    ),
    double: <path d="M8 7h5l-1 5h4l-7 9 1-6H7l1-8z" fill="currentColor" stroke="none" />,
    guide: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
      </>
    ),
    retry: <path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5" />,
    check: <path d="M5 12l5 5L20 7" />,
    wobble: <path d="M8 8c2 2 2 4 0 6M16 8c-2 2-2 4 0 6M12 4v2M12 18v2" />,
    pause: (
      <>
        <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
        <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
      </>
    ),
    sound: (
      <>
        <path d="M4 10v4h4l5 4V6l-5 4H4z" />
        <path d="M16 9a4 4 0 0 1 0 6" />
      </>
    ),
    parent: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c1-4 3.5-6 7-6s6 2 7 6" />
        <path d="M17 4l1 2 2 .5-1.5 1.5.5 2L17 9l-2 1 .5-2L14 6.5 16 6l1-2z" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </>
    ),
    wave: <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />,
    leaf: <path d="M5 19c8 0 12-8 14-14-6 2-14 6-14 14zM5 19c3-3 6-5 9-7" />,
    map: (
      <>
        <path d="M9 4l6 2 5-2v16l-5 2-6-2-5 2V6l5-2z" />
        <path d="M9 4v16M15 6v16" />
      </>
    ),
    ruins: (
      <>
        <path d="M4 20h16M6 20V10l6-5 6 5v10" />
        <path d="M10 20v-6h4v6" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}
