import { CircleDot } from 'lucide-react';
import { PLATFORM_NAME } from '@/lib/constants';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'light';
}

export function Logo({ size = 'md', showText = true, variant = 'default' }: LogoProps) {
  const iconSizes = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-12 w-12' };
  const textSizes = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' };
  const textColor = variant === 'light' ? 'text-white' : 'text-foreground';
  const subColor = variant === 'light' ? 'text-white/60' : 'text-muted-foreground';

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex items-center justify-center">
        <div className={`${iconSizes[size]} rounded-xl bg-primary flex items-center justify-center shadow-sm`}>
          <CircleDot className="h-1/2 w-1/2 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="absolute -top-0.5 -right-0.5 text-[10px]">🎱</span>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${textSizes[size]} font-heading font-extrabold ${textColor} tracking-tight`}>
            {PLATFORM_NAME}
          </span>
          <span className={`text-[10px] font-medium ${subColor} tracking-wide uppercase`}>
            Pool Sports
          </span>
        </div>
      )}
    </div>
  );
}
