import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  FlipHorizontal, 
  Flashlight, 
  Check, 
  Camera,
  Loader2,
  Sparkles,
  Images
} from 'lucide-react';
import { Card, CardVariant } from '../types';
import { allCards, getCardByCode, getVariantsByCode } from '../data/dataProvider';
import { getCardImageUrl } from '../utils/cardUtils';
import { useCollection } from '../context/CollectionContext';
import { formatEur } from '../services/cardmarketPriceService';

interface CardScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCard: (card: Card) => void;
}

// Gentle audio chime on successful card recognition (like Cardonaut / Apple Pay)
function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, ctx.currentTime); // G5
    osc.frequency.exponentialRampToValueAtTime(1174, ctx.currentTime + 0.12); // D6

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {}
}

function normalizeAlphaNum(s?: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Intelligent Card & Variant Recognition Resolver
 * Handles optical typos (e.g. OP05-078 misread for OP15-078 Mamaragan),
 * cross-checks card name against printed code, and automatically pre-selects
 * Alternate Art / Parallel variants when detected.
 */
export function resolveCardRecognition(
  rawCode?: string,
  rawName?: string,
  isParallel?: boolean
): { card: Card; chosenVariant: CardVariant | null } | null {
  const cleanCode = (rawCode || '').trim().toUpperCase().replace(/[^A-Z0-9-]/gi, '');
  const normName = normalizeAlphaNum(rawName);

  let candidateByCode = cleanCode ? getCardByCode(cleanCode) : null;
  if (!candidateByCode && cleanCode) {
    const noHyphen = cleanCode.replace(/[^A-Z0-9]/gi, '');
    candidateByCode = allCards.find(c => c.card_code.replace(/[^A-Z0-9]/gi, '').toUpperCase() === noHyphen) || null;
  }

  let finalCard: Card | null = null;

  // 1. If code matched a card, verify compatibility with the detected name
  if (candidateByCode) {
    const codeCardNormName = normalizeAlphaNum(candidateByCode.name);
    if (!normName || codeCardNormName === normName || codeCardNormName.includes(normName) || normName.includes(codeCardNormName)) {
      finalCard = candidateByCode;
    }
  }

  // 2. Discrepancy (e.g. Mamaragan misread as OP05-078 instead of OP15-078) or code not found:
  // Search by card name across allCards
  if (!finalCard && normName && normName.length >= 3) {
    const exactNameMatches = allCards.filter(c => normalizeAlphaNum(c.name) === normName);
    const fuzzyNameMatches = exactNameMatches.length > 0
      ? exactNameMatches
      : allCards.filter(c => {
          const cNorm = normalizeAlphaNum(c.name);
          return cNorm.includes(normName) || normName.includes(cNorm);
        });

    if (fuzzyNameMatches.length === 1) {
      // Unique name in the entire game (e.g. Mamaragan -> OP15-078)
      finalCard = fuzzyNameMatches[0];
    } else if (fuzzyNameMatches.length > 1) {
      // Multiple cards share this character name (e.g. Nami, Luffy, Zoro)
      // Extract 3-digit card number suffix if present (e.g. '078' in 'OP05-078')
      const numMatch = cleanCode.match(/\d{3}$/);
      if (numMatch) {
        const num = numMatch[0];
        const numCandidate = fuzzyNameMatches.find(c => c.card_code.endsWith(num));
        if (numCandidate) {
          finalCard = numCandidate;
        }
      }
      // If still not resolved, check set prefix match
      if (!finalCard) {
        const setMatch = cleanCode.match(/^[A-Z0-9]+/);
        if (setMatch) {
          const setCandidate = fuzzyNameMatches.find(c => c.set_code === setMatch[0]);
          if (setCandidate) finalCard = setCandidate;
        }
      }
      // Fallback to first matching candidate
      if (!finalCard) {
        finalCard = fuzzyNameMatches[0];
      }
    }
  }

  // 3. Fallback to candidateByCode if name resolution produced nothing
  if (!finalCard && candidateByCode) {
    finalCard = candidateByCode;
  }

  if (!finalCard) return null;

  // Variant matching
  const variants = getVariantsByCode(finalCard.card_code);
  let chosenVariant: CardVariant | null = variants[0] || null;

  if (isParallel && variants.length > 1) {
    const altVariant = variants.find(v => {
      const lbl = (v.variant_label || '').toLowerCase();
      const img = (v.image_path || '').toLowerCase();
      return (
        lbl.includes('alternate') ||
        lbl.includes('parallel') ||
        lbl.includes('manga') ||
        lbl.includes('sp') ||
        lbl.includes('special') ||
        img.includes('_p') ||
        img.includes('_sp') ||
        img.includes('manga')
      );
    });
    if (altVariant) {
      chosenVariant = altVariant;
    }
  }

  return { card: finalCard, chosenVariant };
}

export const CardScannerModal: React.FC<CardScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectCard
}) => {
  const { addCardToCollection, getCardCountInCollection, getTotalCardCopies } = useCollection();

  // Camera & Stream states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchActive, setTorchActive] = useState<boolean>(false);
  const [hasTorchSupport, setHasTorchSupport] = useState<boolean>(false);

  // Scanner state
  const [detectedCard, setDetectedCard] = useState<Card | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<CardVariant | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const isScanningRef = useRef<boolean>(false);

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setTorchActive(false);
    setHasTorchSupport(false);
  };

  // Start Camera Stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("La caméra n'est pas supportée par ce navigateur.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;

      // Check flash / torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        if (capabilities.torch) {
          setHasTorchSupport(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera primary error:', err);
      // Fallback simple camera
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
          setCameraActive(true);
        }
      } catch (fbErr: any) {
        setCameraError("Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur.");
      }
    }
  };

  // Toggle Torch
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchActive;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }]
      });
      setTorchActive(nextTorch);
    } catch (e) {
      console.warn('Torch toggle error:', e);
    }
  };

  // Switch camera front/back
  const toggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Reset for next scan
  const handleScanNext = () => {
    setDetectedCard(null);
    setSelectedVariant(null);
    setRecentlyAdded(null);
  };

  // Modal lifecycle
  useEffect(() => {
    if (isOpen) {
      setDetectedCard(null);
      setSelectedVariant(null);
      setRecentlyAdded(null);
      startCamera('environment');
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Center 2.5:3.5 crop onto 600x840 canvas for crisp code & artwork OCR
  const captureFrameBase64 = (): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    if (!vW || !vH) return null;

    const targetAspect = 2.5 / 3.5;
    let cropW = vW;
    let cropH = vH;
    let cropX = 0;
    let cropY = 0;

    if (vW / vH > targetAspect) {
      cropW = vH * targetAspect;
      cropX = (vW - cropW) / 2;
    } else {
      cropH = vW / targetAspect;
      cropY = (vH - cropH) / 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 840;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, 600, 840);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Process an image (live frame, manual shutter, or gallery upload)
  const processCardImage = async (base64: string): Promise<boolean> => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/scan-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result) {
          const rawCode = data.result.cardCode ? String(data.result.cardCode).trim().toUpperCase() : '';
          const rawName = data.result.cardName ? String(data.result.cardName).trim() : '';
          const isParallel = Boolean(data.result.isParallel);

          const match = resolveCardRecognition(rawCode, rawName, isParallel);
          if (match) {
            setDetectedCard(match.card);
            setSelectedVariant(match.chosenVariant);
            playSuccessChime();
            try {
              navigator?.vibrate?.(80);
            } catch (e) {}
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Vision analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
    return false;
  };

  // CONTINUOUS LIVE AI SCANNER (100% Automatic AI in background - Zero buttons needed)
  useEffect(() => {
    if (!isOpen || !cameraActive || detectedCard) return;

    const intervalId = setInterval(async () => {
      if (
        isScanningRef.current ||
        !videoRef.current ||
        videoRef.current.readyState < 2 ||
        detectedCard
      ) {
        return;
      }

      isScanningRef.current = true;
      try {
        const base64 = captureFrameBase64();
        if (base64) {
          await processCardImage(base64);
        }
      } catch (e) {
        // Non-blocking loop
      } finally {
        isScanningRef.current = false;
      }
    }, 1100);

    return () => clearInterval(intervalId);
  }, [isOpen, cameraActive, detectedCard]);

  // Instant Manual Shutter Capture
  const handleManualCapture = async () => {
    if (isScanningRef.current || isAnalyzing || detectedCard) return;
    isScanningRef.current = true;
    try {
      const base64 = captureFrameBase64();
      if (base64) {
        await processCardImage(base64);
      }
    } finally {
      isScanningRef.current = false;
    }
  };

  // Photo Gallery Import
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isAnalyzing) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        isScanningRef.current = true;
        try {
          await processCardImage(base64);
        } finally {
          isScanningRef.current = false;
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Detected card variants and price
  const detectedVariants = useMemo(() => {
    if (!detectedCard) return [];
    return getVariantsByCode(detectedCard.card_code);
  }, [detectedCard]);

  const activeVariant = selectedVariant || detectedVariants[0] || null;
  const activePrice = activeVariant?.market_price || activeVariant?.cardmarket_trend || 0.50;
  const isAltSelected = activeVariant && activeVariant.image_path !== detectedCard?._defaultImagePath;
  const currentVariantCopies = (detectedCard && activeVariant?.image_path)
    ? getCardCountInCollection(detectedCard.card_code, activeVariant.image_path)
    : (detectedCard ? getCardCountInCollection(detectedCard.card_code) : 0);
  const totalCopies = detectedCard ? getTotalCardCopies(detectedCard.card_code) : 0;

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[150] bg-black overflow-hidden flex flex-col w-screen h-screen select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-black"
      >
        
        {/* TOP BAR: Close button + Torch + Flip + Gallery Import */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/70 to-transparent">
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg active:scale-90 transition-transform cursor-pointer"
            title="Fermer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Action icons: Gallery Import + Flashlight + Flip Camera */}
          <div className="flex items-center space-x-2">
            {/* Gallery photo import button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 rounded-full bg-black/60 hover:bg-black text-amber-400 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg active:scale-90 transition-transform cursor-pointer"
              title="Importer une photo depuis la galerie"
            >
              <Images className="w-5 h-5" />
            </button>

            {hasTorchSupport && cameraActive && (
              <button
                onClick={toggleTorch}
                className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg active:scale-90 transition-transform cursor-pointer ${
                  torchActive 
                    ? 'bg-amber-400 text-black border-amber-300' 
                    : 'bg-black/60 text-white border-white/10'
                }`}
                title="Lampe torche"
              >
                <Flashlight className="w-5 h-5" />
              </button>
            )}

            {cameraActive && (
              <button
                onClick={toggleCamera}
                className="w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg active:scale-90 transition-transform cursor-pointer"
                title="Retourner la caméra"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* FULLSCREEN CAMERA VIEW */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          
          {/* Live Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Loading message */}
          {!cameraActive && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-black z-10">
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-slate-300 tracking-wider">
                Démarrage de la caméra...
              </span>
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
              <p className="text-sm text-slate-200 max-w-xs">{cameraError}</p>
            </div>
          )}

          {/* PURE MINIMAL CARD TARGETING FRAME WITH SPINNING HUD SEARCH INDICATOR */}
          {!detectedCard && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4 z-20">
              <div className={`relative w-[84vw] max-w-[340px] aspect-[2.5/3.5] border-2 rounded-3xl flex flex-col justify-between p-3 transition-all duration-300 ${
                isAnalyzing 
                  ? 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.45),0_0_0_9999px_rgba(0,0,0,0.55)]' 
                  : 'border-white/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.50)]'
              }`}>
                {/* Thin Corner Brackets with dynamic glow */}
                <div className={`absolute -top-1.5 -left-1.5 w-7 h-7 border-t-4 border-l-4 rounded-tl-xl transition-colors duration-300 ${isAnalyzing ? 'border-amber-400 shadow-[0_0_10px_#f59e0b]' : 'border-white'}`} />
                <div className={`absolute -top-1.5 -right-1.5 w-7 h-7 border-t-4 border-r-4 rounded-tr-xl transition-colors duration-300 ${isAnalyzing ? 'border-amber-400 shadow-[0_0_10px_#f59e0b]' : 'border-white'}`} />
                <div className={`absolute -bottom-1.5 -left-1.5 w-7 h-7 border-b-4 border-l-4 rounded-bl-xl transition-colors duration-300 ${isAnalyzing ? 'border-amber-400 shadow-[0_0_10px_#f59e0b]' : 'border-white'}`} />
                <div className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 border-b-4 border-r-4 rounded-br-xl transition-colors duration-300 ${isAnalyzing ? 'border-amber-400 shadow-[0_0_10px_#f59e0b]' : 'border-white'}`} />

                {/* Animated Horizontal Laser Beam when analyzing */}
                {isAnalyzing && (
                  <div className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_18px_#f59e0b] rounded-full animate-pulse top-1/2 -translate-y-1/2" />
                )}

                {/* SPINNING HUD LOADER ("LE TRUC QUI TOURNE") IN CENTER WHEN SEARCHING */}
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="relative flex items-center justify-center">
                      {/* Outer soft pulse ring */}
                      <div className="w-16 h-16 rounded-full border border-amber-400/25 animate-ping absolute" />
                      {/* Outer dashed spinning ring */}
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-400/40 animate-spin absolute [animation-duration:3s]" />
                      {/* Inner fast spinning dual-color arc */}
                      <div className="w-10 h-10 rounded-full border-3 border-amber-400/20 border-t-amber-400 border-r-amber-400 animate-spin" />
                      {/* Center glowing radar dot */}
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] absolute" />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Floating Status Pill */}
              <div className={`mt-4 px-4 py-2 rounded-full backdrop-blur-md border text-xs font-bold transition-all duration-300 flex items-center space-x-2 ${
                isAnalyzing
                  ? 'bg-amber-950/80 border-amber-400/60 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                  : 'bg-black/60 border-white/10 text-white/90 drop-shadow-md'
              }`}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400 flex-shrink-0" />
                    <span className="tracking-wide">Recherche & Analyse IA en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />
                    <span>Placez la carte dans le cadre</span>
                  </>
                )}
              </div>

              {/* Instant Manual Shutter Capture Trigger */}
              <div className="mt-3 pointer-events-auto flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleManualCapture}
                  disabled={isAnalyzing || !cameraActive}
                  className="group relative flex items-center justify-center p-1 active:scale-90 transition-transform cursor-pointer disabled:opacity-40"
                  title="Scanner immédiatement"
                >
                  <div className="w-15 h-15 rounded-full border-2 border-white/80 group-hover:border-amber-400 flex items-center justify-center transition-colors shadow-2xl">
                    <div className={`w-12 h-12 rounded-full transition-all ${
                      isAnalyzing 
                        ? 'bg-amber-400/60 animate-ping' 
                        : 'bg-white group-hover:bg-amber-400 shadow-inner'
                    }`} />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input for Gallery Photo Selection */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleGalleryUpload}
            className="hidden"
          />

        </div>

        {/* NATIVE BOTTOM SHEET UPON RECOGNITION (Sliding from bottom) */}
        {detectedCard && (
          <div className="absolute inset-x-0 bottom-0 z-40 p-4 sm:p-6 bg-[#0F172A] border-t border-slate-700 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-250 space-y-4 max-h-[85vh] overflow-y-auto">
            
            {/* Grab Handle */}
            <div className="w-12 h-1 rounded-full bg-slate-700 mx-auto" />

            {/* Header: Status + Cardmarket Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <span>Carte Reconnue</span>
                  {isAltSelected && (
                    <span className="px-1.5 py-0.2 text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full font-black">
                      ALT ART ✨
                    </span>
                  )}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {isAltSelected ? 'Cote Alt Art' : 'Cote Cardmarket'}
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-400">
                  {formatEur(activePrice)}
                </span>
              </div>
            </div>

            {/* Card Visual & Metadata Row */}
            <div className="flex items-center space-x-4 bg-[#0B0F17] p-3 rounded-2xl border border-slate-800">
              <div 
                onClick={() => onSelectCard(detectedCard)}
                className="w-16 h-22 sm:w-20 sm:h-28 rounded-xl overflow-hidden border border-slate-700 shadow-xl flex-shrink-0 bg-slate-900 cursor-pointer hover:scale-105 transition-transform relative"
                title="Agrandir la carte"
              >
                <img
                  src={getCardImageUrl(detectedCard, activeVariant?.image_path)}
                  alt={detectedCard.name}
                  className="w-full h-full object-cover"
                />
                {isAltSelected && (
                  <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-black text-[8px] font-black text-center py-0.5 uppercase tracking-wider backdrop-blur-sm">
                    Alt Art ✨
                  </div>
                )}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono font-black text-amber-400 text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                    {detectedCard.card_code}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {detectedCard.rarity}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {detectedCard.category}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  {detectedCard.name}
                </h3>

                <p className="text-xs text-slate-300">
                  Dans votre collection : <strong className="text-amber-400 font-black">{currentVariantCopies} ex.</strong>
                  {detectedVariants.length > 1 && (
                    <span className="text-slate-400 text-[11px] ml-1">({totalCopies} au total)</span>
                  )}
                </p>
              </div>
            </div>

            {/* VARIANT SELECTOR (When card has Base, Alt Art, Manga, SP) */}
            {detectedVariants.length > 1 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold px-1 text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Variantes & Raretés ({detectedVariants.length})</span>
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-medium">Touchez pour choisir l'art</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {detectedVariants.map((v, idx) => {
                    const isSelected = activeVariant?.image_path === v.image_path || (!selectedVariant && idx === 0);
                    const vPrice = v.market_price || v.cardmarket_trend || 0;
                    const isAlt = (v.variant_label || '').toLowerCase().includes('alternate') ||
                                  (v.variant_label || '').toLowerCase().includes('parallel') ||
                                  (v.image_path || '').includes('_p');
                    const isManga = (v.variant_label || '').toLowerCase().includes('manga') || (v.image_path || '').includes('manga');
                    const isSP = (v.variant_label || '').toLowerCase().includes('sp') || (v.image_path || '').includes('_sp');

                    return (
                      <button
                        key={v.image_path || idx}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`flex-shrink-0 flex items-center gap-2.5 p-2 rounded-2xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                            : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Mini thumbnail */}
                        <div className="w-7 h-10 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700 shadow relative">
                          <img
                            src={getCardImageUrl(detectedCard, v.image_path)}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {(isAlt || isManga || isSP) && (
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-bl-sm" />
                          )}
                        </div>

                        {/* Label & Price */}
                        <div className="flex flex-col min-w-[85px] max-w-[140px] pr-1">
                          <span className="text-[11px] font-black truncate leading-tight">
                            {v.variant_label || 'Base'}
                          </span>
                          <span className="text-xs font-black text-emerald-400 mt-0.5">
                            {formatEur(vPrice)}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center flex-shrink-0 shadow">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons: Add to Collection + Scan Next */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleScanNext}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-slate-400" />
                <span>Scanner suivante</span>
              </button>

              <button
                onClick={() => {
                  addCardToCollection(detectedCard.card_code, 1, activeVariant?.image_path);
                  const feedbackKey = activeVariant?.image_path || detectedCard.card_code;
                  setRecentlyAdded(feedbackKey);
                  setTimeout(() => setRecentlyAdded(null), 2000);
                }}
                className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                  recentlyAdded
                    ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                    : 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20'
                }`}
              >
                {recentlyAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Ajouté !</span>
                  </>
                ) : (
                  <span>+1 À Ma Collection</span>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>,
    document.body
  );
};
