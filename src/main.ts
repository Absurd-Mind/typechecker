// Beispieltexte zum Abtippen
const sampleTexts = [
  // 0: Einfacher Text (Deutsch)
  `Der schnelle braune Fuchs springt über den faulen Hund. QWERTZ ist ein Tastaturlayout das von den ersten sechs Buchstaben abgeleitet ist. Übung macht den Meister!`,
  
  // 1: Text mit Sonderzeichen
  `Programmieren macht Spaß! Funktionen wie calc(x) oder print("Hallo") sind wichtig. Nutze #Hashtags und @Mentions. Mathe: (5 + 3) * 2 = 16. Fragen? Ja/Nein!`,
  
  // 2: Englischer Text
  `The quick brown fox jumps over the lazy dog. QWERTY is a keyboard layout named after the first six letters. Practice makes perfect!`,
  
  // 3: Programmier-Übung
  `const result = array.map((item) => item * 2); if (x > 0 && y < 10) { return true; } // #TODO: Fix bug @line:42`
];

// Tastenlayouts für verschiedene Sprachen
const layouts = {
  de: {
    // QWERTZ: Linke Hand Tasten - sollten mit RECHTER Shift-Taste großgeschrieben werden
    leftHandKeys: new Set([
      'q', 'w', 'e', 'r', 't',
      'a', 's', 'd', 'f', 'g',
      'y', 'x', 'c', 'v', 'b',  // Deutsche Tastatur: y ist links
      '1', '2', '3', '4', '5',
      '^', '°'
    ]),
    // Rechte Hand Tasten - sollten mit LINKER Shift-Taste großgeschrieben werden
    rightHandKeys: new Set([
      'z', 'u', 'i', 'o', 'p', 'ü',  // Deutsche Tastatur: z ist rechts
      'h', 'j', 'k', 'l', 'ö', 'ä',
      'n', 'm', ',', '.', '-',
      '6', '7', '8', '9', '0', 'ß', '´'
    ]),
    // Sonderzeichen mit Shift (linke Hand Position -> rechte Shift)
    shiftedLeftHand: new Set(['!', '"', '§', '$', '%']),
    // Sonderzeichen mit Shift (rechte Hand Position -> linke Shift)
    shiftedRightHand: new Set(['&', '/', '(', ')', '=', '?', '`', '*', "'", '>', ';', ':', '_'])
  },
  en: {
    // QWERTY: Linke Hand Tasten
    leftHandKeys: new Set([
      'q', 'w', 'e', 'r', 't',
      'a', 's', 'd', 'f', 'g',
      'z', 'x', 'c', 'v', 'b',  // Englische Tastatur: z ist links
      '1', '2', '3', '4', '5',
      '`', '~'
    ]),
    // Rechte Hand Tasten
    rightHandKeys: new Set([
      'y', 'u', 'i', 'o', 'p', '[', ']', '\\',  // Englische Tastatur: y ist rechts
      'h', 'j', 'k', 'l', ';', "'",
      'n', 'm', ',', '.', '/',
      '6', '7', '8', '9', '0', '-', '='
    ]),
    shiftedLeftHand: new Set(['!', '@', '#', '$', '%']),
    shiftedRightHand: new Set(['^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '?'])
  }
};

let currentTextIndex = 0;
let currentLayout: 'de' | 'en' = 'de';
let showSpaceSymbol = true;

interface ShiftEvent {
  character: string;
  shiftUsed: 'left' | 'right' | 'none';
  correct: boolean;
  timestamp: number;
}

interface Stats {
  leftShiftCount: number;
  rightShiftCount: number;
  correctShiftCount: number;
  wrongShiftCount: number;
  errorCount: number;
  shiftEvents: ShiftEvent[];
}

const stats: Stats = {
  leftShiftCount: 0,
  rightShiftCount: 0,
  correctShiftCount: 0,
  wrongShiftCount: 0,
  errorCount: 0,
  shiftEvents: []
};

let currentShiftKey: 'left' | 'right' | 'none' = 'none';
let lastInputLength = 0;

// DOM Elemente
const textDisplay = document.getElementById('textDisplay') as HTMLDivElement;
const inputArea = document.getElementById('inputArea') as HTMLTextAreaElement;
const leftShiftCountEl = document.getElementById('leftShiftCount') as HTMLSpanElement;
const rightShiftCountEl = document.getElementById('rightShiftCount') as HTMLSpanElement;
const correctShiftCountEl = document.getElementById('correctShiftCount') as HTMLSpanElement;
const wrongShiftCountEl = document.getElementById('wrongShiftCount') as HTMLSpanElement;
const errorCountEl = document.getElementById('errorCount') as HTMLSpanElement;
const progressEl = document.getElementById('progress') as HTMLSpanElement;
const shiftLogEl = document.getElementById('shiftLog') as HTMLDivElement;
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
const textSelect = document.getElementById('textSelect') as HTMLSelectElement;
const layoutSelect = document.getElementById('layoutSelect') as HTMLSelectElement;
const showSpaceSymbolCheckbox = document.getElementById('showSpaceSymbol') as HTMLInputElement;

// Hilfsfunktion für aktuellen Text
function getCurrentSampleText(): string {
  return sampleTexts[currentTextIndex].replace(/\s+/g, ' ').trim();
}

// Hilfsfunktion für aktuelles Layout
function getLayout() {
  return layouts[currentLayout];
}

// Text anzeigen mit Hervorhebung
function renderText(typedText: string): void {
  let html = '';
  const normalizedSampleText = getCurrentSampleText();
  
  for (let i = 0; i < normalizedSampleText.length; i++) {
    const char = normalizedSampleText[i];
    let className = '';
    
    if (i < typedText.length) {
      if (typedText[i] === char) {
        className = 'correct';
      } else {
        className = 'incorrect';
      }
    } else if (i === typedText.length) {
      className = 'current';
    }
    
    // Leerzeichen sichtbar machen (je nach Option)
    const displayChar = (char === ' ' && showSpaceSymbol) ? '␣' : char;
    html += `<span class="${className}">${escapeHtml(displayChar)}</span>`;
  }
  
  textDisplay.innerHTML = html;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Prüfen welche Shift-Taste korrekt wäre
function getCorrectShiftKey(char: string): 'left' | 'right' | 'none' {
  const layout = getLayout();
  const lowerChar = char.toLowerCase();
  
  // Prüfen ob Großbuchstabe oder Sonderzeichen das Shift benötigt
  const needsShift = char !== lowerChar || isShiftedSpecialChar(char);
  
  if (!needsShift) {
    return 'none';
  }
  
  // Prüfen ob es ein Sonderzeichen ist (hat höhere Priorität)
  if (layout.shiftedLeftHand.has(char)) {
    return 'right'; // Linke Hand Position -> rechte Shift
  }
  if (layout.shiftedRightHand.has(char)) {
    return 'left'; // Rechte Hand Position -> linke Shift
  }
  
  // Wenn linke Hand Taste -> rechte Shift verwenden
  if (layout.leftHandKeys.has(lowerChar)) {
    return 'right';
  }
  
  // Wenn rechte Hand Taste -> linke Shift verwenden
  if (layout.rightHandKeys.has(lowerChar)) {
    return 'left';
  }
  
  // Fallback: keine spezifische Präferenz
  return 'none';
}

// Sonderzeichen die Shift benötigen
function isShiftedSpecialChar(char: string): boolean {
  const layout = getLayout();
  return layout.shiftedLeftHand.has(char) || layout.shiftedRightHand.has(char);
}

// Shift-Taste Event tracken
function handleKeyDown(e: KeyboardEvent): void {
  if (e.code === 'ShiftLeft') {
    currentShiftKey = 'left';
    stats.leftShiftCount++;
    updateStats();
  } else if (e.code === 'ShiftRight') {
    currentShiftKey = 'right';
    stats.rightShiftCount++;
    updateStats();
  }
}

function handleKeyUp(e: KeyboardEvent): void {
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    // Kurze Verzögerung um sicherzustellen dass der Input verarbeitet wurde
    setTimeout(() => {
      currentShiftKey = 'none';
    }, 50);
  }
}

// Input verarbeiten
function handleInput(): void {
  const typedText = inputArea.value;
  const normalizedSampleText = getCurrentSampleText();
  
  // Neuer Buchstabe wurde eingegeben
  if (typedText.length > lastInputLength) {
    const newChar = typedText[typedText.length - 1];
    const expectedChar = normalizedSampleText[typedText.length - 1];
    
    // Prüfen ob Großbuchstabe/Shift verwendet wurde
    const correctShift = getCorrectShiftKey(newChar);
    
    if (correctShift !== 'none' && currentShiftKey !== 'none') {
      const isCorrectShift = currentShiftKey === correctShift;
      
      const event: ShiftEvent = {
        character: newChar,
        shiftUsed: currentShiftKey,
        correct: isCorrectShift,
        timestamp: Date.now()
      };
      
      stats.shiftEvents.push(event);
      
      if (isCorrectShift) {
        stats.correctShiftCount++;
      } else {
        stats.wrongShiftCount++;
      }
      
      addShiftLogEntry(event);
    }
    
    // Tippfehler zählen
    if (newChar !== expectedChar) {
      stats.errorCount++;
    }
  }
  
  lastInputLength = typedText.length;
  renderText(typedText);
  updateStats();
  
  // Fertig?
  if (typedText === normalizedSampleText) {
    showCompletion();
  }
}

function updateStats(): void {
  leftShiftCountEl.textContent = stats.leftShiftCount.toString();
  rightShiftCountEl.textContent = stats.rightShiftCount.toString();
  correctShiftCountEl.textContent = stats.correctShiftCount.toString();
  wrongShiftCountEl.textContent = stats.wrongShiftCount.toString();
  errorCountEl.textContent = stats.errorCount.toString();
  
  const normalizedSampleText = getCurrentSampleText();
  const progress = Math.round((inputArea.value.length / normalizedSampleText.length) * 100);
  progressEl.textContent = `${Math.min(progress, 100)}%`;
}

function addShiftLogEntry(event: ShiftEvent): void {
  const entry = document.createElement('div');
  entry.className = `log-entry ${event.correct ? 'log-correct' : 'log-wrong'}`;
  
  const shiftName = event.shiftUsed === 'left' ? 'L-Shift' : 'R-Shift';
  const correctShift = getCorrectShiftKey(event.character);
  const expectedShift = correctShift === 'left' ? 'L-Shift' : 'R-Shift';
  
  entry.innerHTML = `
    <span class="log-char">${escapeHtml(event.character)}</span>
    <span class="log-used">Verwendet: ${shiftName}</span>
    <span class="log-expected">Erwartet: ${expectedShift}</span>
    <span class="log-status">${event.correct ? '✓' : '✗'}</span>
  `;
  
  shiftLogEl.insertBefore(entry, shiftLogEl.firstChild);
  
  // Maximal 20 Einträge anzeigen
  while (shiftLogEl.children.length > 20) {
    shiftLogEl.removeChild(shiftLogEl.lastChild!);
  }
}

function showCompletion(): void {
  const totalShiftEvents = stats.correctShiftCount + stats.wrongShiftCount;
  const accuracy = totalShiftEvents > 0 
    ? Math.round((stats.correctShiftCount / totalShiftEvents) * 100) 
    : 100;
  
  alert(`Geschafft! 🎉

Statistiken:
- Linke Shift: ${stats.leftShiftCount}x
- Rechte Shift: ${stats.rightShiftCount}x
- Korrekte Shift-Nutzung: ${stats.correctShiftCount}
- Falsche Shift-Nutzung: ${stats.wrongShiftCount}
- Shift-Genauigkeit: ${accuracy}%
- Tippfehler: ${stats.errorCount}`);
}

function reset(): void {
  stats.leftShiftCount = 0;
  stats.rightShiftCount = 0;
  stats.correctShiftCount = 0;
  stats.wrongShiftCount = 0;
  stats.errorCount = 0;
  stats.shiftEvents = [];
  lastInputLength = 0;
  currentShiftKey = 'none';
  
  inputArea.value = '';
  shiftLogEl.innerHTML = '';
  
  renderText('');
  updateStats();
  inputArea.focus();
}

// Event Listener
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
inputArea.addEventListener('input', handleInput);
resetBtn.addEventListener('click', reset);

// Event Listener für Optionen
textSelect.addEventListener('change', () => {
  currentTextIndex = parseInt(textSelect.value, 10);
  reset();
});

layoutSelect.addEventListener('change', () => {
  currentLayout = layoutSelect.value as 'de' | 'en';
  reset();
});

showSpaceSymbolCheckbox.addEventListener('change', () => {
  showSpaceSymbol = showSpaceSymbolCheckbox.checked;
  renderText(inputArea.value);
});

// Initial rendern
renderText('');
inputArea.focus();
