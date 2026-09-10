import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "bg-color": [
        {
          bg: [
            "background",
            "foreground",
            "popover",
            "popover-foreground",
            "primary",
            "primary-foreground",
            "secondary",
            "secondary-foreground",
            "muted",
            "muted-foreground",
            "accent",
            "accent-foreground",
            "destructive",
            "destructive-foreground",
            "card",
            "card-foreground",
            "border",
            "input",
            "ring",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatRelativeTime = (value: Date | string): string => {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return typeof value === 'string' ? value : '';

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return 'justo ahora';

  const rtf = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' });

  if (diffMin < 60) return rtf.format(-diffMin, 'minute');
  
  const diffHrs = Math.round(diffMin / 60);
  if (diffHrs < 24) return rtf.format(-diffHrs, 'hour');

  const diffDays = Math.round(diffHrs / 24);
  if (diffDays < 7) return rtf.format(-diffDays, 'day');

  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};