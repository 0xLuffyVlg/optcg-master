import React, { memo, useEffect, useRef } from 'react';
import SITE_LOGO from '../assets/logoBase64';

export interface AnimatedBrandLogoProps {
  onNavigateHome?: () => void;
  className?: string;
}

const BASE_TITLE = { mot: 'OPTCG-MASTER', acc: [5, 12] as [number, number] };
const ROTATING_PHRASES = [
  { mot: 'LES DECKLISTS', acc: [4, 13] as [number, number] },
  { mot: 'COTE DES CARTES', acc: [9, 15] as [number, number] },
];

const CIPHER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+/<>';
const SCRAMBLE_DURATION = 650;
const SCROLL_SPEED = 95;
const CYCLE_INTERVAL = 7000;

function isReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isUserTyping(): boolean {
  const el = document.activeElement;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable);
}

function renderScramble(
  container: HTMLElement, 
  target: { mot: string; acc: [number, number] }, 
  resolvedCount: number, 
  seed: number
) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < target.mot.length; i++) {
    const char = target.mot[i];
    const span = document.createElement('span');
    if (i < resolvedCount || char === ' ') {
      span.textContent = char;
      if (i >= target.acc[0] && i < target.acc[1]) {
        span.className = 'la-acc';
      }
    } else {
      span.textContent = CIPHER_CHARS[(seed * 7 + i * 13) % CIPHER_CHARS.length];
      span.className = 'h';
    }
    fragment.appendChild(span);
  }
  container.replaceChildren(fragment);
}

export const AnimatedBrandLogo: React.FC<AnimatedBrandLogoProps> = memo(({
  onNavigateHome,
  className = ''
}) => {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;

    const titreEl = rootEl.querySelector<HTMLElement>('.la-titre');
    const fenEl = rootEl.querySelector<HTMLElement>('.la-fen');
    const animEl = rootEl.querySelector<HTMLElement>('.la-anim');
    const fruitEl = rootEl.querySelector<HTMLElement>('.la-fruit');
    const lueurEl = rootEl.querySelector<HTMLElement>('.la-lueur');
    const bandeEl = rootEl.querySelector<HTMLElement>('.la-bande');

    if (!titreEl || !fenEl || !animEl) return;

    let phraseIndex = 0;
    let cycleCount = 0;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let initialTimerId: ReturnType<typeof setTimeout> | null = null;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();

    const schedule = (fn: () => void, delayMs: number) => {
      const id = setTimeout(() => {
        timeouts.delete(id);
        fn();
      }, delayMs);
      timeouts.add(id);
      return id;
    };

    let isVisible = true;
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      isVisible = entries[entries.length - 1]?.isIntersecting ?? false;
    });
    observer?.observe(rootEl);

    const scrambleTo = (
      target: { mot: string; acc: [number, number] },
      isCurrent: () => boolean,
      onComplete?: () => void
    ) => {
      const start = performance.now();
      let lastKey = '';

      const step = (now: number) => {
        if (!isCurrent()) return;
        const progress = Math.min(1, (now - start) / SCRAMBLE_DURATION);
        const resolvedCount = Math.floor(progress * (target.mot.length + 1));
        const seed = Math.floor(now / 45);
        const key = `${resolvedCount}:${seed}`;

        if (key !== lastKey) {
          lastKey = key;
          renderScramble(animEl, target, resolvedCount, seed);
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          onComplete?.();
        }
      };

      requestAnimationFrame(step);
    };

    const computeAvailableWidth = (): number => {
      const titleRect = titreEl.getBoundingClientRect();
      const parentRow = rootEl.closest('header, nav, [data-entete-rangee]') || rootEl.parentElement;
      let maxRight = (parentRow ?? document.body).getBoundingClientRect().right - 16;
      if (parentRow) {
        for (const child of Array.from(parentRow.children)) {
          if (child.contains(rootEl)) continue;
          const rect = child.getBoundingClientRect();
          if (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.left > titleRect.right - 1 &&
            rect.left - 12 < maxRight &&
            rect.top < titleRect.bottom &&
            rect.bottom > titleRect.top
          ) {
            maxRight = rect.left - 12;
          }
        }
      }
      return Math.max(titleRect.width, Math.floor(maxRight - titleRect.left));
    };

    const playCycle = (): boolean => {
      if (isReducedMotion() || titreEl.hasAttribute('data-joue') || !isVisible) {
        return false;
      }

      const nextTarget = ROTATING_PHRASES[phraseIndex % ROTATING_PHRASES.length];
      phraseIndex++;
      const currentCycle = ++cycleCount;
      const isCurrent = () => cycleCount === currentCycle;

      animEl.getAnimations().forEach(a => a.cancel());
      animEl.style.transform = '';

      const availableWidth = computeAvailableWidth();
      fenEl.style.width = `${availableWidth}px`;
      fenEl.removeAttribute('data-fondu');
      titreEl.setAttribute('data-joue', '');

      // Fruit bounce
      fruitEl?.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.12) rotate(-5deg)', offset: 0.3 },
        { transform: 'scale(0.97)', offset: 0.7 },
        { transform: 'scale(1)' }
      ], { duration: 900, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' });

      // Lueur pulse
      lueurEl?.animate([
        { opacity: 0 },
        { opacity: 0.95, offset: 0.35 },
        { opacity: 0 }
      ], { duration: 1200, easing: 'ease-out' });

      // Scramble into rotating phrase
      scrambleTo(nextTarget, isCurrent, () => {
        const overflow = Math.max(0, Math.ceil(animEl.scrollWidth - availableWidth * 0.88) + 2);
        const scrollDuration = overflow ? Math.round((overflow / SCROLL_SPEED) * 1000) : 0;
        if (overflow) {
          fenEl.setAttribute('data-fondu', '');
        }

        const scrollAnim = overflow ? animEl.animate([
          { transform: 'translateX(0)' },
          { transform: `translateX(-${overflow}px)` }
        ], { duration: scrollDuration, delay: 350, easing: 'cubic-bezier(0.45, 0, 0.4, 1)', fill: 'forwards' }) : null;

        const holdDuration = 350 + scrollDuration + (overflow ? 900 : 1800);

        schedule(() => {
          if (!isCurrent()) return;
          scrollAnim?.cancel();
          fenEl.removeAttribute('data-fondu');

          // Sweep light band across fruit
          bandeEl?.animate([
            { transform: 'translateX(-160%) skewX(-18deg)' },
            { transform: 'translateX(260%) skewX(-18deg)' }
          ], { duration: 750, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });

          // Scramble back to OPTCG-MASTER
          scrambleTo(BASE_TITLE, isCurrent, () => {
            titreEl.removeAttribute('data-joue');
            animEl.replaceChildren();
            fenEl.style.width = '';
          });
        }, holdDuration);
      });

      return true;
    };

    const scheduleLoop = () => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        if (!document.hidden && !isUserTyping()) {
          playCycle();
        }
        scheduleLoop();
      }, CYCLE_INTERVAL);
    };

    const handleVisibility = () => {
      if (!document.hidden) scheduleLoop();
    };

    const handlePointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') playCycle();
    };

    // First animation shortly after mount
    initialTimerId = setTimeout(() => {
      if (!document.hidden) playCycle();
      scheduleLoop();
    }, 1200);

    document.addEventListener('visibilitychange', handleVisibility);
    rootEl.addEventListener('pointerenter', handlePointerEnter);

    return () => {
      cycleCount++;
      observer?.disconnect();
      if (timerId) clearTimeout(timerId);
      if (initialTimerId) clearTimeout(initialTimerId);
      timeouts.forEach(t => clearTimeout(t));
      document.removeEventListener('visibilitychange', handleVisibility);
      rootEl.removeEventListener('pointerenter', handlePointerEnter);
    };
  }, []);

  return (
    <span
      ref={rootRef}
      onClick={onNavigateHome}
      className={`la group cursor-pointer select-none py-1 flex-shrink-0 ${className}`}
      data-logo-anime="true"
      title="OPTCG Master - Accueil"
    >
      {/* Devil Fruit / Site Logo with Glow and Reflective Light Sweep */}
      <span className="la-fruit-boite" aria-hidden="true">
        <span className="la-lueur" />
        <img
          className="la-fruit"
          src="/logo.png"
          alt="OPTCG Master"
          width={36}
          height={36}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = SITE_LOGO;
          }}
        />
        <span className="la-reflet">
          <span className="la-bande" />
        </span>
      </span>

      {/* Animated Brand Title & Subtitle */}
      <span className="la-nom">
        <span className="la-titre" data-titre="true">
          <span className="la-repos">
            OPTCG<span className="la-acc">-MASTER</span>
          </span>
          <span className="la-fen" aria-hidden="true">
            <span className="la-anim" />
          </span>
        </span>
        <small className="la-sous">ONE PIECE TCG</small>
      </span>
    </span>
  );
});
