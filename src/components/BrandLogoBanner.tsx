import React from 'react';

interface BrandLogoBannerProps {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
}

export const BrandLogoBanner: React.FC<BrandLogoBannerProps> = ({
  className = '',
  compact = false,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      id="brand-logo-container"
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      title="Brain Studio"
      className={`rounded-2xl overflow-hidden shadow-lg border border-[var(--app-border)] flex flex-col items-center justify-center transition-all group ${className}`}
      style={{ backgroundColor: 'var(--app-card)', textAlign: 'center', padding: compact ? '12px 16px' : '20px' }}
    >
      <img
        id="brand-logo-img"
        src="/logo.png"
        alt="Brain Studio - Conecte. Estude. Conquiste"
        referrerPolicy="no-referrer"
        className="rounded-xl object-contain shadow-sm group-hover:scale-[1.02] transition-transform duration-300"
        style={{ maxWidth: compact ? '220px' : '300px', height: 'auto' }}
      />
      <div className="mt-2 text-center flex items-center justify-center gap-1.5">
        <span className="text-[11px] font-bold tracking-widest uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          Conecte. Estude. Conquiste
        </span>
      </div>
    </div>
  );
};
