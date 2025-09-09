# Keyboard Shortcuts

This application supports several keyboard shortcuts to help you navigate more efficiently:

## Search Navigation

- **`/`** - Focus the search input
- **`Enter`** - When search has exactly one result, select that client
- **`Escape`** - Clear search, close current modal/client, or hide sticky notes

## Client Management

- **`Ctrl+N` (Mac) / `Alt+N` (Windows/Linux)** - Add new consumer (when on main list)

## Client Details Hotkeys

- **`Ctrl+H` (Mac) / `Alt+H` (Windows/Linux)** - Toggle hotkey hints visibility in client details modal (off by default)
- **`Ctrl+T` (Mac) / `Alt+T` (Windows/Linux)** - Set last contact to today
- **`Ctrl+F` (Mac) / `Alt+F` (Windows/Linux)** - Set last face-to-face to today
- **`Ctrl+1` (Mac) / `Alt+1` (Windows/Linux)** - Toggle first contact status
- **`Ctrl+2` (Mac) / `Alt+2` (Windows/Linux)** - Toggle second contact status
- **`Ctrl+N` (Mac) / `Alt+N` (Windows/Linux)** - Focus add todo input
- **`Ctrl+M` (Mac) / `Alt+M` (Windows/Linux)** - Focus add note textarea
- **`Ctrl+C` (Mac) / `Alt+C` (Windows/Linux)** - Focus contact section
- **`Ctrl+S` (Mac) / `Alt+S` (Windows/Linux)** - Focus status section
- **`Ctrl+O` (Mac) / `Alt+O` (Windows/Linux)** - Focus todo section
- **`Ctrl+N` (Mac) / `Alt+N` (Windows/Linux)** - Focus notes section
- **`Ctrl+A` (Mac) / `Alt+A` (Windows/Linux)** - Archive client
- **`Ctrl+B` (Mac) / `Alt+B` (Windows/Linux)** - Go back to client list
- **`Escape`** - Cancel editing or close modal

## Sticky Notes

- **`Ctrl+S` (Mac) / `Alt+S` (Windows/Linux)** - Toggle sticky notes visibility
- **`Ctrl+K` (Mac) / `Alt+K` (Windows/Linux)** - Create new sticky note (shows sticky notes if hidden)

## View Controls

- **`Ctrl+C` (Mac) / `Alt+C` (Windows/Linux)** - Toggle compact view

## Help & Navigation

- **`Ctrl+?` (Mac) / `Alt+?` (Windows/Linux)** - Show keyboard shortcuts help modal
- **`Escape`** - Close any open modal, go back to previous view, or hide sticky notes

## Browser-Friendly Design

The hotkey system has been designed to avoid conflicts with common browser shortcuts and AutoHotkey remapping:

- **Cross-platform modifier keys**: Uses `Ctrl` on Mac and `Alt` on Windows/Linux to avoid conflicts
- **Compatible with AutoHotkey Alt remapping** on Windows/Linux systems
- **Escape key** provides consistent "back" navigation through the app hierarchy

## Implementation Details

The hotkey system is implemented using

- `useGlobalHotkeys` custom hook for managing keyboard event listeners
- Global event listeners that respect input focus states
- Cross-platform support with browser-friendly key combinations

### Features

- **Smart Context Awareness**: Simple hotkeys (/) are disabled when typing in inputs, but modifier-based hotkeys work in all contexts
- **Modal Hierarchy**: Escape key respects modal stack (help → add client → client details → sticky notes → main list)
- **Simple Search**: Press `/` to quickly focus and select the search input
- **Visual Feedback**: Help modal shows all available shortcuts
- **Accessibility**: Keyboard-only navigation support
- **Sticky Notes Integration**: Full keyboard control for note management
- **Input-Safe Hotkeys**: Modifier shortcuts work even when typing in search or form fields
- **Cross-Platform**: Automatically adapts to Mac (Ctrl) vs Windows/Linux (Alt) conventions
- **Hotkey Hint Toggle**: Press `Ctrl+H`/`Alt+H` to show/hide hotkey hints in client details modal (off by default for cleaner interface)

### Hotkey Priority Order (Escape)

1. Close help modal (if open)
2. Close add client form (if open)  
3. Close client details (if open)
4. Hide sticky notes (if visible)
5. Return to main list

### Adding New Hotkeys

To add new hotkeys, update the `getDefaultHotkeys()` function in `src/hooks/useGlobalHotkeys.ts` and add the corresponding action handler. Use `[isMac ? 'ctrlKey' : 'altKey']: true` for cross-platform modifier keys.
