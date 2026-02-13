// Beispieltext zum Abtippen
const sampleText = `Der schnelle braune Fuchs springt über den faulen Hund. 
QWERTY ist ein Tastaturlayout das von den ersten sechs Buchstaben abgeleitet ist.
Übung macht den Meister! Tippe sorgfältig und achte auf die Shift-Tasten.`;

// Linke Hand Tasten (QWERTZ Layout) - sollten mit RECHTER Shift-Taste großgeschrieben werden
const leftHandKeys = new Set([
  'q', 'w', 'e', 'r', 't',
  'a', 's', 'd', 'f', 'g',
  'y', 'x', 'c', 'v', 'b',  // Deutsche Tastatur: y ist links
  '1', '2', '3', '4', '5',
  '^', '°'
]);

// Rechte Hand Tasten - sollten mit LINKER Shift-Taste großgeschrieben werden
const rightHandKeys = new Set([
  'z', 'u', 'i', 'o', 'p', 'ü',  // Deutsche Tastatur: z ist rechts
  'h', 'j', 'k', 'l', 'ö', 'ä',
  'n', 'm', ',', '.', '-',
  '6', '7', '8', '9', '0', 'ß', '´'
]);

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

// Text anzeigen mit Hervorhebung
function renderText(typedText: string): void {
  let html = '';
  const normalizedSampleText = sampleText.replace(/\s+/g, ' ').trim();
  
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
    
    // Leerzeichen sichtbar machen
    const displayChar = char === ' ' ? '␣' : char;
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
  const lowerChar = char.toLowerCase();
  
  // Prüfen ob Großbuchstabe oder Sonderzeichen das Shift benötigt
  const needsShift = char !== lowerChar || isShiftedSpecialChar(char);
  
  if (!needsShift) {
    return 'none';
  }
  
  // Wenn linke Hand Taste -> rechte Shift verwenden
  if (leftHandKeys.has(lowerChar)) {
    return 'right';
  }
  
  // Wenn rechte Hand Taste -> linke Shift verwenden
  if (rightHandKeys.has(lowerChar)) {
    return 'left';
  }
  
  // Fallback: keine spezifische Präferenz
  return 'none';
}

// Sonderzeichen die Shift benötigen
function isShiftedSpecialChar(char: string): boolean {
  const shiftedChars = new Set([
    '!', '"', '§', '$', '%', '&', '/', '(', ')', '=', '?', '`',
    '*', "'", '>', ';', ':', '_', 'Ä', 'Ö', 'Ü'
  ]);
  return shiftedChars.has(char);
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
  const normalizedSampleText = sampleText.replace(/\s+/g, ' ').trim();
  
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
  
  const normalizedSampleText = sampleText.replace(/\s+/g, ' ').trim();
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

// Initial rendern
renderText('');
inputArea.focus();
