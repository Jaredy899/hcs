import React, { createContext, useContext, useState, ReactNode } from 'react';

type FocusedSection = 'todo' | 'notes' | null;

interface SectionFocusContextType {
  focusedSection: FocusedSection;
  setFocusedSection: (section: FocusedSection) => void;
  selectedTodoId: string | null;
  setSelectedTodoId: (id: string | null) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
}

const SectionFocusContext = createContext<SectionFocusContextType | null>(null);

interface SectionFocusProviderProps {
  children: ReactNode;
}

export function SectionFocusProvider({ children }: SectionFocusProviderProps) {
  const [focusedSection, setFocusedSection] = useState<FocusedSection>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const handleSetFocusedSection = (section: FocusedSection) => {
    setFocusedSection(section);
    // Clear selections when switching sections
    if (section !== 'todo') {
      setSelectedTodoId(null);
    }
    if (section !== 'notes') {
      setSelectedNoteId(null);
    }
  };

  return (
    <SectionFocusContext.Provider
      value={{
        focusedSection,
        setFocusedSection: handleSetFocusedSection,
        selectedTodoId,
        setSelectedTodoId,
        selectedNoteId,
        setSelectedNoteId,
      }}
    >
      {children}
    </SectionFocusContext.Provider>
  );
}

export function useSectionFocus() {
  const context = useContext(SectionFocusContext);
  if (!context) {
    throw new Error('useSectionFocus must be used within a SectionFocusProvider');
  }
  return context;
}
