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
    } else {
      window.dispatchEvent(new CustomEvent('replay_3d_splash'));
    }
  };

  return (
    <div
      id="brand-logo-container"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title="Brain Studio - Clique para ver animação 3D da logo ✨"
      className={`rounded-2xl overflow-hidden shadow-lg border border-indigo-950/60 flex flex-col items-center justify-center transition-all cursor-pointer group hover:border-emerald-500/50 ${className}`}
      style={{ backgroundColor: '#050512', textAlign: 'center', padding: compact ? '12px 16px' : '20px' }}
    >
      <img
        id="brand-logo-img"
        src="/logo.png"
        alt="Brain Studio - Conecte. Estude. Conquiste"
        referrerPolicy="no-referrer"
        className="rounded-xl object-contain shadow-sm group-hover:scale-[1.03] transition-transform duration-300"
        style={{ maxWidth: compact ? '220px' : '300px', height: 'auto' }}
      />
      <div className="mt-2 text-center flex items-center justify-center gap-1.5">
        <span className="text-[11px] font-bold tracking-widest uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          Conecte. Estude. Conquiste
        </span>
        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
          3D ✨
        </span>
      </div>
    </div>
  );
};
