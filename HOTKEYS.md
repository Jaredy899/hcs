# Keyboard Shortcuts

This application supports several keyboard shortcuts to help you navigate more efficiently:

## Search Navigation

- **`/`** - Focus the search input
- **`Enter`** - When search has exactly one result, select that client
- **`Escape`** - Clear search, close current modal/client, or hide sticky notes

## Client Management

- **`Ctrl+Shift+N`** - Add new consumer (when on main list)

## Sticky Notes

- **`Ctrl+Shift+S`** - Toggle sticky notes visibility
- **`Ctrl+Shift+K`** - Create new sticky note (shows sticky notes if hidden)

## Help & Navigation

- **`?`** - Show keyboard shortcuts help modal
- **`Escape`** - Close any open modal, go back to previous view, or hide sticky notes

## Browser-Friendly Design

The hotkey system has been designed to avoid conflicts with common browser shortcuts and AutoHotkey remapping:

- **Uses `Ctrl+Shift` combinations** to avoid "New Tab" (Ctrl+N) and other browser conflicts
- **Compatible with AutoHotkey Alt remapping** since we don't use Alt keys
- **Escape key** provides consistent "back" navigation through the app hierarchy

## Implementation Details

The hotkey system is implemented using

- `useGlobalHotkeys` custom hook for managing keyboard event listeners
- Global event listeners that respect input focus states
- Cross-platform support with browser-friendly key combinations

### Features

- **Smart Context Awareness**: Simple hotkeys (/, ?) are disabled when typing in inputs, but modifier-based hotkeys (Ctrl+Shift+N, Ctrl+Shift+S) still work
- **Modal Hierarchy**: Escape key respects modal stack (help → add client → client details → sticky notes → main list)
- **Simple Search**: Press `/` to quickly focus and select the search input
- **Visual Feedback**: Help modal shows all available shortcuts
- **Accessibility**: Keyboard-only navigation support
- **Sticky Notes Integration**: Full keyboard control for note management
- **Input-Safe Hotkeys**: Ctrl+Shift shortcuts work even when typing in search or form fields

### Hotkey Priority Order (Escape)

1. Close help modal (if open)
2. Close add client form (if open)  
3. Close client details (if open)
4. Hide sticky notes (if visible)
5. Return to main list

### Adding New Hotkeys

To add new hotkeys, update the `DEFAULT_HOTKEYS` array in `src/hooks/useGlobalHotkeys.ts` and add the corresponding action handler.
