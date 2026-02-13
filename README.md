# Typechecker 

Der etwas andere Typechecker, der die korrekte Nutzung der Shift-Tasten analysiert.

## Features

- **Mehrere Übungstexte**: Einfacher Text, Sonderzeichen, Englisch, Programmier-Übung
- **Tastatur-Layout Unterstützung**: Deutsch (QWERTZ) und Englisch (QWERTY)
- **Shift-Tasten Analyse**: Trackt linke und rechte Shift-Taste separat
- **Korrekte Shift-Nutzung**: Prüft ob die richtige Shift-Taste verwendet wurde (10-Finger-System)
  - Rechte Shift für linke Hand-Tasten (Q, W, E, R, T, etc.)
  - Linke Shift für rechte Hand-Tasten (Z, U, I, O, P, etc.)
- **Live-Feedback**: Zeigt Fortschritt und Fehler in Echtzeit
- **Ergebnis-Export**: Ergebnisse können einfach kopiert werden

## Demo

Die App ist als statische Webseite verfügbar: [GitHub Pages Demo](https://absurd-mind.github.io/typechecker/)

## Installation

```bash
# Repository klonen
git clone https://github.com/Absurd-Mind/typechecker.git
cd typechecker

# Dependencies installieren
pnpm install

# Entwicklungsserver starten
pnpm dev

# Für Produktion bauen
pnpm build

# Produktion-Build lokal ansehen
pnpm preview
```

## Technologien

- TypeScript
- Vite
- Vanilla CSS

## Lizenz

MIT License - siehe [LICENSE](LICENSE)
