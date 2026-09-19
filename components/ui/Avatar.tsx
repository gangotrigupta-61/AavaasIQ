import { cn, getInitials } from '@/lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  src?: string;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export function Avatar({ name, size = 'md', src, className }: AvatarProps) {
  const initials = getInitials(name);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover shrink-0',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <span
      aria-label={name}
      role="img"
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white bg-primary-600 shrink-0 select-none',
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </span>
  );
}
