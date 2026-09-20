import type { PoolDiscipline } from '@/types/db';

export const PLATFORM_NAME = 'CueLeague';
export const PLATFORM_TAGLINE = 'The Global Pool Sports Platform';
export const PLATFORM_DESCRIPTION = 'Discover clubs, players, fixtures, live scores, rankings, and head-to-head statistics from the world of competitive pool.';

export const POOL_DISCIPLINE_SLUGS = {
  eightBall: '8-ball',
  nineBall: '9-ball',
  tenBall: '10-ball',
  blackball: 'blackball',
  straightPool: 'straight-pool',
} as const;

export const DISCIPLINE_LABELS: Record<string, string> = {
  '8-ball': '8-Ball',
  '9-ball': '9-Ball',
  '10-ball': '10-Ball',
  'blackball': 'Blackball',
  'straight-pool': 'Straight Pool',
};

export function getDisciplineLabel(slug: string | null | undefined): string {
  if (!slug) return 'Pool';
  return DISCIPLINE_LABELS[slug] ?? slug;
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function timeUntil(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 0) return 'Started';
  if (hours < 1) return 'Starting soon';
  if (hours < 24) return `In ${hours}h`;
  return `In ${days}d`;
}

export function winPercentage(wins: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

export function getDisciplineIcon(discipline: PoolDiscipline | null | undefined): string {
  if (!discipline?.icon_emoji) return '🎱';
  return discipline.icon_emoji;
}
