# Keyboard Shortcuts

This application supports several keyboard shortcuts to help you navigate more efficiently.

On Mac the modifier is `Ctrl`; on Windows/Linux it is `Alt`. Shortcuts written below as
`Ctrl/Alt` follow that rule. Shortcuts written as `Ctrl+Shift` use `Ctrl+Shift` on every
platform.

## Global (caseload list)

- **`/`** - Focus the search input
- **`Enter`** - When the search has exactly one result, open that consumer
- **`Escape`** - Clear search, close the current modal, or hide sticky notes
- **`Ctrl+Shift+N`** - Add new consumer
- **`Ctrl+Shift+S`** - Toggle sticky notes visibility
- **`Ctrl+Shift+K`** - Create new sticky note (shows sticky notes if hidden)
- **`Ctrl/Alt+C`** - Toggle compact view
- **`Ctrl+H`** - Toggle the keyboard shortcuts help modal

## Consumer details

- **`Ctrl/Alt+H`** - Toggle hotkey hints inside the consumer details modal (off by default)
- **`Ctrl/Alt+T`** - Set last contact to today
- **`Ctrl/Alt+F`** - Set last face-to-face to today
- **`Ctrl/Alt+1`** - Toggle first contact status
- **`Ctrl/Alt+2`** - Toggle second contact status
- **`Ctrl/Alt+N`** - Focus add todo input
- **`Ctrl/Alt+M`** - Focus add note textarea
- **`Ctrl/Alt+C`** - Scroll to contact section
- **`Ctrl/Alt+U`** - Scroll to status section
- **`Ctrl/Alt+D`** - Scroll to todo section
- **`Ctrl/Alt+O`** - Scroll to notes section
- **`Ctrl/Alt+A`** - Archive consumer
- **`Ctrl/Alt+B`** - Save pending changes and go back to the caseload
- **`Escape`** - Cancel the field you are editing, or save and close the modal

## Todo and note lists

When a todo or note card has focus:

- **`↑` / `↓`** - Move the selection
- **`Space`** - Toggle the selected todo
- **`Enter`** - Edit the selected note
- **`Delete` / `Backspace`** - Delete the selected item
- **`Escape`** - Clear the selection

## Behaviour notes

- **Input-safe hotkeys**: modifier shortcuts work even while typing in search or form
  fields. Plain-key shortcuts such as `/` are ignored while typing.
- **Escape while typing** cancels or clears the field and blurs it; it does not close the
  consumer details modal, so pending changes are never dropped by accident.
- **Escape priority**: help modal, then add consumer form, then consumer details, then
  sticky notes, then the caseload list.
- **Consumer details owns Escape**: closing that modal always tries to save pending
  changes first and reports a failure rather than discarding them silently.

## Implementation

- `src/hooks/useGlobalHotkeys.ts` - app-wide shortcuts. `GLOBAL_HOTKEYS` is the single
  source of truth and also drives the help modal, so a new entry appears there
  automatically.
- `src/hooks/useClientDetailsHotkeys.ts` - shortcuts active inside the consumer details
  modal, plus the shared `isEditableElement` check used by both hooks.
- `src/hooks/useListNavigation.ts` - arrow-key navigation inside the todo and note lists.

To add a shortcut, append to `GLOBAL_HOTKEYS` (or `CLIENT_DETAILS_HOTKEYS`), add the
action to the `HotkeyAction` union, and map it to a handler option in
`HANDLER_FOR_ACTION`. Set `useModifier: true` for a cross-platform `Ctrl`/`Alt` shortcut.
