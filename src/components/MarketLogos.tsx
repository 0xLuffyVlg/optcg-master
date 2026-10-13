import React from 'react';
import cardmarketLogoImg from '../assets/cardmarket-logo.png';
import tcgplayerLogoImg from '../assets/tcgplayer-logo.png';

export const cardmarketLogoUrl = cardmarketLogoImg;
export const tcgplayerLogoUrl = tcgplayerLogoImg;

export interface MarketLogoProps {
  className?: string;
  size?: number;
}

export const CardmarketLogo: React.FC<MarketLogoProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <img
    src={cardmarketLogoImg}
    alt="Cardmarket"
    className={`${className} object-contain rounded-sm flex-shrink-0`}
    loading="lazy"
  />
);

export const TCGplayerLogo: React.FC<MarketLogoProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <img
    src={tcgplayerLogoImg}
    alt="TCGplayer"
    className={`${className} object-contain rounded-sm flex-shrink-0`}
    loading="lazy"
  />
);

export const CardtraderLogo: React.FC<MarketLogoProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" className={`${className} object-contain flex-shrink-0 rounded-sm`} fill="none">
    <rect width="24" height="24" rx="5" fill="#0284c7" />
    <path d="M6 7C5.45 7 5 7.45 5 8V16C5 16.55 5.45 17 6 17H12C12.55 17 13 16.55 13 16V8C13 7.45 12.55 7 12 7H6Z" fill="#ffffff" />
    <path d="M12 9H18C18.55 9 19 9.45 19 10V18C19 18.55 18.55 19 18 19H12C11.45 19 11 18.55 11 18V10C11 9.45 11.45 9 12 9Z" fill="#38bdf8" />
  </svg>
);
