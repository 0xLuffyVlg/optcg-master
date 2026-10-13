import React, { createContext, useContext, useState, useEffect } from 'react';
import { Card, Deck, DeckItem } from '../types';
import { getCardByCode } from '../data/dataProvider';
import { parseDecklistString, validateDeck } from '../utils/cardUtils';
import { isCardUnlimited } from '../data/banlistData';

interface DeckContextType {
  currentDeck: Deck;
  savedDecks: Deck[];
  setDeckName: (name: string) => void;
  setLeader: (card: Card | null) => void;
  addCard: (card: Card, count?: number) => void;
  removeCard: (cardCode: string, count?: number) => void;
  setCardCount: (cardCode: string, count: number) => void;
  setCardArtwork: (cardCode: string, artworkName: string) => void;
  clearDeck: () => void;
  loadDeck: (deck: Deck) => void;
  importDecklist: (input: string, deckName?: string) => boolean;
  saveCurrentDeck: () => void;
  deleteSavedDeck: (id: string) => void;
  duplicateSavedDeck: (id: string) => void;
  validation: ReturnType<typeof validateDeck>;
}

const LOCAL_STORAGE_KEY = 'optcg_saved_decks_v1';
const ACTIVE_DECK_KEY = 'optcg_active_deck_v1';

const initialDeck: Deck = {
  id: 'current-deck',
  name: 'Nouveau Deck One Piece',
  leader: null,
  cards: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDeck, setCurrentDeck] = useState<Deck>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_DECK_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialDeck;
  });

  const [savedDecks, setSavedDecks] = useState<Deck[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Save active deck to local storage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_DECK_KEY, JSON.stringify(currentDeck));
    } catch (e) {}
  }, [currentDeck]);

  // Save deck list to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedDecks));
    } catch (e) {}
  }, [savedDecks]);

  const setDeckName = (name: string) => {
    setCurrentDeck(prev => ({ ...prev, name, updatedAt: new Date().toISOString() }));
  };

  const setLeader = (card: Card | null) => {
    setCurrentDeck(prev => {
      // If leader changes, we keep cards or validate
      return {
        ...prev,
        leader: card,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const addCard = (card: Card, count = 1) => {
    if (card.category === 'Leader') {
      setLeader(card);
      return;
    }

    setCurrentDeck(prev => {
      const existingIdx = prev.cards.findIndex(item => item.card.card_code === card.card_code);
      let newCards = [...prev.cards];
      const maxAllowed = isCardUnlimited(card.card_code) ? 50 : 4;

      if (existingIdx >= 0) {
        const currentCount = newCards[existingIdx].count;
        const newCount = Math.min(maxAllowed, currentCount + count);
        newCards[existingIdx] = {
          ...newCards[existingIdx],
          count: newCount
        };
      } else {
        newCards.push({
          card,
          count: Math.min(maxAllowed, count),
          selectedArtwork: card._defaultImagePath
        });
      }

      return {
        ...prev,
        cards: newCards,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const removeCard = (cardCode: string, count = 1) => {
    setCurrentDeck(prev => {
      const existingIdx = prev.cards.findIndex(item => item.card.card_code === cardCode);
      if (existingIdx === -1) return prev;

      let newCards = [...prev.cards];
      const currentCount = newCards[existingIdx].count;
      
      if (currentCount <= count) {
        newCards.splice(existingIdx, 1);
      } else {
        newCards[existingIdx] = {
          ...newCards[existingIdx],
          count: currentCount - count
        };
      }

      return {
        ...prev,
        cards: newCards,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const setCardCount = (cardCode: string, count: number) => {
    setCurrentDeck(prev => {
      let newCards = [...prev.cards];
      const existingIdx = newCards.findIndex(item => item.card.card_code === cardCode);
      const maxAllowed = isCardUnlimited(cardCode) ? 50 : 4;

      if (count <= 0) {
        if (existingIdx >= 0) newCards.splice(existingIdx, 1);
      } else {
        const safeCount = Math.min(maxAllowed, count);
        if (existingIdx >= 0) {
          newCards[existingIdx] = { ...newCards[existingIdx], count: safeCount };
        } else {
          const card = getCardByCode(cardCode);
          if (card && card.category !== 'Leader') {
            newCards.push({ card, count: safeCount, selectedArtwork: card._defaultImagePath });
          }
        }
      }

      return {
        ...prev,
        cards: newCards,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const setCardArtwork = (cardCode: string, artworkName: string) => {
    setCurrentDeck(prev => {
      if (prev.leader && prev.leader.card_code === cardCode) {
        return {
          ...prev,
          leader: { ...prev.leader, _defaultImagePath: artworkName }
        };
      }

      const newCards = prev.cards.map(item => {
        if (item.card.card_code === cardCode) {
          return { ...item, selectedArtwork: artworkName };
        }
        return item;
      });

      return { ...prev, cards: newCards };
    });
  };

  const clearDeck = () => {
    setCurrentDeck({
      id: 'current-deck',
      name: 'Nouveau Deck One Piece',
      leader: null,
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const loadDeck = (deck: Deck) => {
    setCurrentDeck({ ...deck, id: 'current-deck' });
  };

  const importDecklist = (input: string, deckName?: string): boolean => {
    try {
      const parsed = parseDecklistString(input);
      if (!parsed.items || parsed.items.length === 0) return false;

      let leader: Card | null = null;
      const deckItems: DeckItem[] = [];

      for (const item of parsed.items) {
        const card = getCardByCode(item.cardCode);
        if (!card) continue;

        if (card.category === 'Leader' && !leader) {
          leader = card;
        } else {
          deckItems.push({
            card,
            count: Math.min(4, item.count),
            selectedArtwork: card._defaultImagePath
          });
        }
      }

      // If leader was not first item or flagged, check if first card was leader
      if (!leader && deckItems.length > 0 && deckItems[0].card.category === 'Leader') {
        leader = deckItems[0].card;
        deckItems.shift();
      }

      setCurrentDeck({
        id: 'current-deck',
        name: deckName || (leader ? `Deck ${leader.name}` : 'Deck Importé'),
        leader,
        cards: deckItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const saveCurrentDeck = () => {
    const id = currentDeck.id === 'current-deck' ? `deck_${Date.now()}` : currentDeck.id;
    const toSave: Deck = {
      ...currentDeck,
      id,
      updatedAt: new Date().toISOString()
    };

    setSavedDecks(prev => {
      const idx = prev.findIndex(d => d.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = toSave;
        return updated;
      }
      return [toSave, ...prev];
    });
  };

  const deleteSavedDeck = (id: string) => {
    setSavedDecks(prev => prev.filter(d => d.id !== id));
  };

  const duplicateSavedDeck = (id: string) => {
    const deck = savedDecks.find(d => d.id === id);
    if (!deck) return;
    const duplicated: Deck = {
      ...deck,
      id: `deck_${Date.now()}`,
      name: `${deck.name} (Copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSavedDecks(prev => [duplicated, ...prev]);
  };

  const validation = validateDeck(currentDeck);

  return (
    <DeckContext.Provider
      value={{
        currentDeck,
        savedDecks,
        setDeckName,
        setLeader,
        addCard,
        removeCard,
        setCardCount,
        setCardArtwork,
        clearDeck,
        loadDeck,
        importDecklist,
        saveCurrentDeck,
        deleteSavedDeck,
        duplicateSavedDeck,
        validation
      }}
    >
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => {
  const context = useContext(DeckContext);
  if (!context) throw new Error('useDeck must be used within a DeckProvider');
  return context;
};
