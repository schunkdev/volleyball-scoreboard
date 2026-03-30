# Modern Volleyball Scoreboard

<img width="3536" height="2188" alt="image" src="https://github.com/user-attachments/assets/05fdb30b-2cd0-4e60-997e-adc6fe65437c" />

## Features

### Core functionality

- Real-time volleyball score tracking for two teams.
- Set tracking with automatic set completion at 25 points and a 2-point lead.
- Match completion state with winner announcement when the configured set limit is reached.

### Match controls

- Point updates via tap, swipe gestures, and direct score input dialog.
- Team editing with configurable team names and set counts.
- Side switching to mirror court changes during a match.
- Undo support with recent state history and full match reset.

### Game mode

- Automatic set wins at 25 points (2-point lead required); score resets on set win.
- Per-set **timeouts tracking**: under each team name, two dots show timeouts used (tap/click to cycle 0 → 1 → 2 → 0). Timeouts reset when a set ends.

### Display and interface

- Fullscreen scoreboard mode for better visibility.
- Landscape-oriented layout optimized for phone use.
- Set progress display and completed set chips in the bottom bar.

### Configuration

- Settings for game mode and unlimited sets.
- Theme selection with local persistence across sessions.
- Custom team colors (optional hex per side) with color picker.
- Subtle per-team **background tint** that follows the selected theme or custom team colors.
- Built-in first-run quick guide and manual re-open support.

### Live sharing

- Host a match and share a **4-character live code** for read-only spectators at `/live/[code]`.
- Viewer count while hosting.
- [documentation/live-sharing.md](documentation/live-sharing.md) — Firebase Realtime Database broadcast, server API, scheduled cleanup, and environment variables.

## Development

Bootstrapped with:

- Google Stitch (Mockups)
- Google AI Studio (Rough first Code)
- NextJS
- Vercel
- Cursor

## Themes

<table>
  <tr>
    <td>
        <img width="500" alt="Scoreboard View 1" src="https://github.com/user-attachments/assets/c1d843e1-76b4-402e-b26d-8f0186498c87" />
    </td>
    <td>
      <img width="500" alt="Scoreboard View 2" src="https://github.com/user-attachments/assets/a3b0dd97-efaa-4546-86af-a77c19e48475" />
    </td>
  </tr>
</table>
