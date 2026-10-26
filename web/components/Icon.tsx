'use client';

import { useSettings } from '@/design/runtime';
import { lucideIcons } from './lucide-icons';

export type IconName = keyof typeof lucideIcons;

export function Icon({ name, label, size, slot }: { name: IconName; label?: string; size?: number; slot?: string }) {
  const s = useSettings('icon');
  const px = size ?? Number(s.Size ?? 20);
  return (
    <svg
      viewBox="0 0 24 24"
      data-component="icon"
      slot={slot}
      width={px}
      height={px}
      className="shrink-0 fill-none stroke-current"
      strokeWidth={Number(s['Stroke width'] ?? 2)}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {lucideIcons[name]}
    </svg>
  );
}
