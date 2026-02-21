import { useState } from "react";

interface TopBarProps {
  onGenerate: (seed: number) => void;
  truthMode: boolean;
  onToggleTruth: () => void;
  currentSeed: number | null;
}

export function TopBar({ onGenerate, truthMode, onToggleTruth, currentSeed }: TopBarProps) {
  const [seedInput, setSeedInput] = useState("");

  function handleGenerate() {
    const seed = seedInput.trim() === "" ? Date.now() : parseInt(seedInput, 10);
    const finalSeed = isNaN(seed) ? 42 : seed;
    setSeedInput(String(finalSeed));
    onGenerate(finalSeed);
  }

  function handleRandom() {
    const seed = Math.floor(Math.random() * 999999) + 1;
    setSeedInput(String(seed));
    onGenerate(seed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleGenerate();
  }

  return (
    <div className="topbar">
      <span className="topbar-title">◈ MYTH ENGINE</span>
      <div className="topbar-controls">
        <input
          type="text"
          className="seed-input"
          placeholder="seed"
          value={seedInput}
          onChange={(e) => setSeedInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn" onClick={handleGenerate}>Generate</button>
        <button className="btn btn-secondary" onClick={handleRandom}>Random</button>
        <button
          className={`btn btn-toggle ${truthMode ? "active" : ""}`}
          onClick={onToggleTruth}
        >
          Truth {truthMode ? "ON" : "OFF"}
        </button>
        {currentSeed !== null && (
          <span className="seed-display">seed: {currentSeed}</span>
        )}
      </div>
    </div>
  );
}
