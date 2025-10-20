# 🎮 Tic Tac Toe - Advanced Edition

Ein modernes, voll ausgestattetes Tic Tac Toe Spiel mit React, TypeScript und Framer Motion. Featuring KI-Gegner, mehrere Spielfeldgrößen, 3D-Animationen, Sound-Effekte und Hintergrundmusik.

![React](https://img.shields.io/badge/React-19.1.1-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.10-646cff?style=flat-square&logo=vite)

## ✨ Features

### 🎯 Spielmodi
- **Spieler vs Spieler (PvP)** - Lokales Multiplayer
- **Spieler vs KI** - Mit 3 Schwierigkeitsstufen:
  - 🟢 Einfach - Perfekt für Anfänger
  - 🟡 Mittel - Ausgewogene Herausforderung
  - 🔴 Schwer - Minimax-Algorithmus, nahezu unschlagbar

### 🎲 Spielfeld-Varianten
- **3x3 Klassisch** - 3 in einer Reihe
- **5x5 Fortgeschritten** - 4 in einer Reihe
- **7x7 Profi** - 5 in einer Reihe

### 🏆 Match-Modi
- **Einzelspiel** - Ein schnelles Spiel
- **Best of 3** - Erster zu 2 Siegen
- **Best of 5** - Erster zu 3 Siegen

### 🎪 Visuelle Features
- 🪙 **Coin Flip Animation** - 3D-Münzwurf bestimmt den Startspieler
- ✨ **Konfetti-Effekt** bei Sieg
- 📊 **Live Scoreboard** mit Rundenfortschritt
- 🌟 **Gewinn-Linie Animation** - SVG-basiert mit Glow-Effekt
- 🎨 **3D-Hover-Effekte** auf allen Feldern
- 🎭 **Smooth Transitions** mit Framer Motion

### 🎵 Audio-System
- 🎼 **Hintergrundmusik** - 6 Songs (3 Lofi, 3 Phonk)
- 🔊 **Sound-Effekte** - Unterschiedliche Sounds für X und O
- 🎚️ **Lautstärkeregelung** - Getrennte Kontrolle für Musik und Spielsounds
- 🎧 **Persistent Music Player** - Musik läuft weiter beim Schließen des Panels

### 💾 Weitere Features
- 📈 **Statistiken** - Persistente Speicherung via LocalStorage
- 🌍 **Deutsche Lokalisierung**
- ⚡ **Optimierte Performance** mit React 19

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development Server starten
```bash
npm run dev
```
Öffne [http://localhost:5173](http://localhost:5173) im Browser.

### Production Build erstellen
```bash
npm run build
```

### Production Preview
```bash
npm run preview
```

## 🎮 Spielanleitung

1. **Spiel starten**
   - Wähle Spielmodus (PvP oder vs KI)
   - Bei KI: Wähle Schwierigkeitsgrad
   - Gib Spielernamen ein
   - Wähle Spielfeldgröße (3x3, 5x5, 7x7)
   - Wähle Match-Modus (Einzelspiel, Best of 3/5)

2. **Coin Flip**
   - Bei PvP: Wähle Kopf oder Zahl
   - Das Ergebnis bestimmt, wer anfängt

3. **Spielen**
   - Spieler X (blau) und O (orange) wechseln sich ab
   - Bei KI-Modus wartet die KI 2 Sekunden vor jedem Zug
   - Gewinne durch eine vollständige Reihe (horizontal, vertikal, diagonal)

4. **Musik & Sound**
   - Klicke auf "⚙️ Musik & Lautstärke" oben links
   - Wähle einen Song aus der Liste
   - Passe die Lautstärken an

## 🛠️ Tech Stack

- **React 19.1.1** - UI Framework
- **TypeScript 5.6** - Type Safety
- **Vite 7.1.10** - Build Tool & Dev Server
- **Framer Motion** - Animations
- **React Context** - State Management für Music Player
- **CSS3** - 3D Transforms & Gradients
- **LocalStorage** - Persistente Statistiken

## 📁 Projekt-Struktur

```
src/
├── components/
│   ├── Board.tsx              # Spiellogik & KI-Integration
│   ├── Square.tsx             # Einzelne Zelle mit Animationen
│   ├── GameSetup.tsx          # Konfigurations-Screen
│   ├── Scoreboard.tsx         # Match-Statistiken
│   ├── CoinFlip.tsx           # 3D Münzwurf-Animation
│   ├── WinLine.tsx            # SVG Gewinn-Linie
│   ├── Confetti.tsx           # Partikel-Effekte
│   ├── SettingsMenu.tsx       # Musik & Sound Einstellungen
│   ├── MusicPlayer.tsx        # React Context für Audio
│   └── MusicControls.tsx      # UI Controls für Musik
├── utils/
│   └── ai.ts                  # Minimax-Algorithmus
├── types/
│   └── game.ts                # TypeScript Definitionen
├── App.tsx                    # Root Component
├── App.css                    # Haupt-Styles
└── main.tsx                   # Entry Point
```

## 🎯 KI-Algorithmus

Die KI verwendet den **Minimax-Algorithmus** mit folgenden Features:
- **Alpha-Beta Pruning** für Optimierung
- **Dynamische Tiefe** je nach Schwierigkeitsgrad
- **Center-Bias** für bessere Eröffnungen
- Unterstützt alle Spielfeldgrößen (3x3, 5x5, 7x7)

## 🎨 Anpassung

### Neue Sounds hinzufügen
Bearbeite `src/components/MusicPlayer.tsx` und füge neue Songs zum `SONGS` Array hinzu:
```typescript
{
  id: 7,
  title: 'Dein Song',
  genre: 'Lofi', // oder 'Phonk'
  url: 'https://deine-url.com/song.mp3'
}
```

### UI-Sprache ändern
Alle UI-Texte sind direkt in den Komponenten. Suche nach deutschen Strings und ersetze sie.

## 📝 Lizenz

Dieses Projekt ist ein persönliches Lernprojekt und frei verwendbar.

## 🙏 Credits

- **Musik** - Von [Pixabay](https://pixabay.com/)
- **Sound-Effekte** - Von [Pixabay](https://pixabay.com/)
- **Animationen** - [Framer Motion](https://www.framer.com/motion/)

---

Viel Spaß beim Spielen! 🎮✨

