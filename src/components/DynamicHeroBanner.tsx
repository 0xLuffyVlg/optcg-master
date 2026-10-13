import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Flame, Sparkles } from 'lucide-react';

export type BannerTheme = 'fire' | 'cyan' | 'purple' | 'emerald';

export interface DynamicBadge {
  id: string;
  label: string;
  count: number;
  totalCount?: number;
  sublabel?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  accentColor?: string;
}

interface DynamicHeroBannerProps {
  // Picture sources
  webp1x: string;
  webp2x: string;
  png1x: string;
  png2x: string;
  alt: string;
  
  // Theme & Lighting
  theme?: BannerTheme;
  interactiveSpotlight?: boolean;
  showEmbers?: boolean;
  
  // Interactive HUD Badges (like 17 330 & 2 885)
  badges?: DynamicBadge[];
  badgeTitle?: string;
  
  // Optional custom children overlaid on banner
  children?: React.ReactNode;
  
  className?: string;
}

/**
 * Animated counter that smoothly interpolates numbers with an easing curve
 */
export const AnimatedCounter: React.FC<{ value: number; duration?: number; className?: string }> = ({
  value,
  duration = 800,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = value;
    if (startVal === endVal) return;

    setIsFlashing(true);
    const flashTimeout = setTimeout(() => setIsFlashing(false), 500);

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * ease);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
        prevValueRef.current = endVal;
      }
    };

    requestAnimationFrame(animate);

    return () => {
      clearTimeout(flashTimeout);
      prevValueRef.current = endVal;
    };
  }, [value, duration]);

  const formatted = useMemo(() => {
    return displayValue.toLocaleString('fr-FR');
  }, [displayValue]);

  return (
    <span className={`inline-block transition-all duration-300 ${isFlashing ? 'scale-105 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]' : ''} ${className}`}>
      {formatted}
    </span>
  );
};

export const DynamicHeroBanner: React.FC<DynamicHeroBannerProps> = ({
  webp1x,
  webp2x,
  png1x,
  png2x,
  alt,
  theme = 'fire',
  interactiveSpotlight = true,
  showEmbers = true,
  badges,
  badgeTitle,
  children,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; active: boolean }>({ x: 50, y: 50, active: false });
  const [isIntersecting, setIsIntersecting] = useState(true);

  // Theme-specific styles & colors
  const themeConfig = useMemo(() => {
    switch (theme) {
      case 'cyan':
        return {
          borderClass: 'animate-cyan-border',
          ambientClass: 'bg-[radial-gradient(ellipse_at_35%_65%,rgba(6,182,212,0.45)_0%,transparent_60%),radial-gradient(ellipse_at_75%_45%,rgba(14,165,233,0.35)_0%,transparent_55%)]',
          secondaryClass: 'bg-[radial-gradient(ellipse_at_50%_80%,rgba(59,130,246,0.35)_0%,transparent_50%)]',
          spotlightColor: 'rgba(6,182,212,0.35)',
          emberPalette: [
            { r: 255, g: 255, b: 255 }, // White hot
            { r: 103, g: 232, b: 249 }, // Cyan 300
            { r: 6, g: 182, b: 212 },   // Cyan 500
            { r: 59, g: 130, b: 246 }   // Blue 500
          ],
          badgeActiveBg: 'from-cyan-950/80 via-cyan-900/60 to-blue-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.45)]',
          badgeInactiveBg: 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-900/80',
          accentGlow: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]'
        };
      case 'purple':
        return {
          borderClass: 'animate-purple-border',
          ambientClass: 'bg-[radial-gradient(ellipse_at_30%_60%,rgba(168,85,247,0.45)_0%,transparent_60%),radial-gradient(ellipse_at_70%_40%,rgba(236,72,153,0.35)_0%,transparent_55%)]',
          secondaryClass: 'bg-[radial-gradient(ellipse_at_55%_75%,rgba(217,70,239,0.3)_0%,transparent_50%)]',
          spotlightColor: 'rgba(168,85,247,0.35)',
          emberPalette: [
            { r: 255, g: 255, b: 255 },
            { r: 240, g: 171, b: 252 },
            { r: 168, g: 85, b: 247 },
            { r: 236, g: 72, b: 153 }
          ],
          badgeActiveBg: 'from-purple-950/80 via-fuchsia-900/60 to-purple-950/80 border-purple-400 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.45)]',
          badgeInactiveBg: 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-purple-500/50 hover:bg-slate-900/80',
          accentGlow: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]'
        };
      case 'emerald':
        return {
          borderClass: 'animate-emerald-border',
          ambientClass: 'bg-[radial-gradient(ellipse_at_25%_65%,rgba(16,185,129,0.45)_0%,transparent_60%),radial-gradient(ellipse_at_80%_45%,rgba(245,158,11,0.35)_0%,transparent_55%)]',
          secondaryClass: 'bg-[radial-gradient(ellipse_at_50%_75%,rgba(52,211,153,0.3)_0%,transparent_50%)]',
          spotlightColor: 'rgba(16,185,129,0.35)',
          emberPalette: [
            { r: 255, g: 255, b: 255 },
            { r: 167, g: 243, b: 208 },
            { r: 16, g: 185, b: 129 },
            { r: 245, g: 158, b: 11 }
          ],
          badgeActiveBg: 'from-emerald-950/80 via-emerald-900/60 to-amber-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.45)]',
          badgeInactiveBg: 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-900/80',
          accentGlow: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
        };
      case 'fire':
      default:
        return {
          borderClass: 'animate-fire-border',
          ambientClass: 'bg-[radial-gradient(ellipse_at_25%_70%,rgba(239,68,68,0.5)_0%,transparent_60%),radial-gradient(ellipse_at_75%_55%,rgba(245,158,11,0.45)_0%,transparent_55%)]',
          secondaryClass: 'bg-[radial-gradient(ellipse_at_50%_80%,rgba(251,191,36,0.35)_0%,transparent_50%),radial-gradient(ellipse_at_85%_75%,rgba(220,38,38,0.35)_0%,transparent_45%)]',
          spotlightColor: 'rgba(251,191,36,0.4)',
          emberPalette: [
            { r: 255, g: 255, b: 255 }, // White hot center
            { r: 254, g: 240, b: 138 }, // Yellow 200
            { r: 251, g: 146, b: 60 },  // Orange 400
            { r: 239, g: 68, b: 68 },   // Red 500
            { r: 185, g: 28, b: 28 }    // Deep red
          ],
          badgeActiveBg: 'from-amber-950/90 via-orange-950/80 to-red-950/90 border-amber-400 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.55),inset_0_0_15px_rgba(239,68,68,0.35)]',
          badgeInactiveBg: 'bg-slate-900/75 border-slate-700/70 text-slate-300 hover:border-amber-500/60 hover:bg-slate-900/90',
          accentGlow: 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]'
        };
    }
  }, [theme]);

  // Observer to pause canvas rendering when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Canvas ember particles simulation
  useEffect(() => {
    if (!showEmbers || !isIntersecting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1024);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 250);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle definition
    interface Particle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      maxAlpha: number;
      flickerSpeed: number;
      color: { r: number; g: number; b: number };
      phase: number;
    }

    const particleCount = width < 640 ? 25 : 45;
    const particles: Particle[] = [];
    const palette = themeConfig.emberPalette;

    for (let i = 0; i < particleCount; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 1.2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.8 + 0.4),
        alpha: Math.random() * 0.5 + 0.2,
        maxAlpha: Math.random() * 0.5 + 0.5,
        flickerSpeed: Math.random() * 0.05 + 0.02,
        color,
        phase: Math.random() * Math.PI * 2
      });
    }

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Physics: rising with gentle wave sway
        p.y += p.vy;
        p.x += p.vx + Math.sin(time + p.phase) * 0.35;

        // Flicker alpha
        p.alpha = 0.3 + (Math.sin(time * 3 + p.phase) * 0.5 + 0.5) * p.maxAlpha * (p.y / height);

        // Respawn when top reached
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.vy = -(Math.random() * 0.8 + 0.4);
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw glowing ember
        const rad = p.size;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 3);
        grad.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.min(1, p.alpha * 1.5)})`);
        grad.addColorStop(0.4, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`);
        grad.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [showEmbers, isIntersecting, themeConfig]);

  // Mouse move handler for interactive torch / flare spotlight
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveSpotlight || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setMousePos(prev => ({ ...prev, active: false }));
  };

  return (
    <div className={`relative w-full space-y-2.5 ${className}`}>
      {/* ─── 1. The Living Hero Banner Container ─── */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`group relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black border ${themeConfig.borderClass} transition-shadow duration-500`}
        style={{ perspective: '1000px' }}
      >
        {/* ─── Base Image ─── */}
        <picture className="w-full block select-none">
          <source srcSet={`${webp1x} 1024w, ${webp2x} 2048w`} sizes="(max-width: 1024px) 100vw, 1280px" type="image/webp" />
          <img
            src={png2x}
            srcSet={`${png1x} 1024w, ${png2x} 2048w`}
            sizes="(max-width: 1024px) 100vw, 1280px"
            alt={alt}
            className="w-full h-auto object-contain rounded-2xl block select-none transform transition-transform duration-700 ease-out group-hover:scale-[1.008]"
            loading="eager"
            fetchPriority="high"
          />
        </picture>

        {/* ─── Realistic Flame Lighting Layer 1 (Primary Breathing Flicker) ─── */}
        <div
          className={`pointer-events-none absolute inset-0 mix-blend-color-dodge transition-opacity duration-300 animate-flame-1 ${themeConfig.ambientClass}`}
        />

        {/* ─── Realistic Flame Lighting Layer 2 (Secondary Dancing Flame Highlights) ─── */}
        <div
          className={`pointer-events-none absolute inset-0 mix-blend-screen opacity-70 animate-flame-2 ${themeConfig.secondaryClass}`}
        />

        {/* ─── Heat Wave Shimmer Sweep ─── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-amber-400/15 to-transparent mix-blend-color-dodge animate-heat-shimmer" />
        </div>

        {/* ─── Interactive Mouse Torchlight / Flame Flare ─── */}
        {interactiveSpotlight && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300 mix-blend-color-dodge"
            style={{
              opacity: mousePos.active ? 1 : 0,
              background: `radial-gradient(circle 240px at ${mousePos.x}% ${mousePos.y}%, ${themeConfig.spotlightColor}, transparent 75%)`
            }}
          />
        )}

        {/* ─── Canvas Particle System (Embers & Sparks) ─── */}
        {showEmbers && (
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 w-full h-full mix-blend-screen opacity-90"
          />
        )}

        {/* ─── Optional In-Banner Overlay Elements ─── */}
        {children && (
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-3 sm:p-5 pointer-events-none">
            <div className="pointer-events-auto">{children}</div>
          </div>
        )}
      </div>

      {/* ─── 2. Evolving HUD Badges & Live Counters ("des vrais jeux de lumière") ─── */}
      {badges && badges.length > 0 && (
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-1">
          {badgeTitle && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{badgeTitle}</span>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {badges.map(badge => {
              const active = Boolean(badge.isActive);
              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={badge.onClick}
                  className={`relative flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 text-left overflow-hidden group/btn ${
                    active
                      ? `bg-gradient-to-r ${themeConfig.badgeActiveBg} scale-[1.02]`
                      : `${themeConfig.badgeInactiveBg} opacity-85 hover:opacity-100`
                  }`}
                >
                  {/* Laser light sweep across active badge */}
                  {active && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-overlay animate-hud-beam" />
                    </div>
                  )}

                  {/* Icon with glowing flame aura */}
                  <div className="flex items-center gap-2">
                    <span className={`transition-transform duration-300 group-hover/btn:scale-110 ${active ? themeConfig.accentGlow : 'text-slate-400'}`}>
                      {badge.icon || <Flame className="w-4 h-4" />}
                    </span>
                    <div>
                      <div className="text-[11px] sm:text-xs font-bold leading-tight flex items-center gap-1.5">
                        <span>{badge.label}</span>
                        {active && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Actif
                          </span>
                        )}
                      </div>
                      {badge.sublabel && (
                        <div className="text-[9px] sm:text-[10px] text-slate-400 leading-tight">
                          {badge.sublabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Evolving Animated Counter */}
                  <div className="text-right pl-2">
                    <div className="text-sm sm:text-base font-black tracking-tight flex items-baseline justify-end gap-1">
                      <AnimatedCounter
                        value={badge.count}
                        className={active ? 'text-amber-200 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-white'}
                      />
                      {badge.totalCount !== undefined && badge.totalCount !== badge.count && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          / {badge.totalCount.toLocaleString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default DynamicHeroBanner;
