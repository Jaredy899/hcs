import { createContext, useContext, useState, ReactNode } from 'react';

type FocusedSection = 'todo' | 'notes' | null;

interface SectionFocusContextType {
  focusedSection: FocusedSection;
  setFocusedSection: (section: FocusedSection) => void;
}

const SectionFocusContext = createContext<SectionFocusContextType | null>(null);

interface SectionFocusProviderProps {
  children: ReactNode;
}

export function SectionFocusProvider({ children }: SectionFocusProviderProps) {
  const [focusedSection, setFocusedSection] = useState<FocusedSection>(null);

  return (
    <SectionFocusContext.Provider value={{ focusedSection, setFocusedSection }}>
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
