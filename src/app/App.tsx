import { useState, useCallback } from "react";
import type { MythWorld, RuinId } from "../engine";
import { generateMythWorld, formatWorldSummary } from "../engine";
import type { TabId } from "../ui/Tabs";
import { TopBar } from "../ui/TopBar";
import { MainView } from "../ui/MainView";
import { BottomPanel } from "../ui/BottomPanel";
import "./App.css";

export default function App() {
  const [world, setWorld] = useState<MythWorld | null>(null);
  const [currentSeed, setCurrentSeed] = useState<number | null>(null);
  const [truthMode, setTruthMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("world");
  const [mainContent, setMainContent] = useState("");
  const [selectedRuin, setSelectedRuin] = useState<RuinId | null>(null);
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

  const handleGenerate = useCallback((seed: number) => {
    const w = generateMythWorld(seed);
    setWorld(w);
    setCurrentSeed(seed);
    setActiveTab("world");
    setSelectedRuin(null);
    setSelectedFaction(null);
    setMainContent(formatWorldSummary(w, false));
  }, []);

  const handleToggleTruth = useCallback(() => {
    setTruthMode((prev) => {
      const next = !prev;
      // Re-render current content with new truth mode
      if (world) {
        // We'll let the user re-click to refresh; simplest approach
      }
      return next;
    });
  }, [world]);

  const handleSelect = useCallback((text: string) => {
    setMainContent(text);
  }, []);

  return (
    <div className="app">
      <TopBar
        onGenerate={handleGenerate}
        truthMode={truthMode}
        onToggleTruth={handleToggleTruth}
        currentSeed={currentSeed}
      />
      <MainView content={mainContent} />
      <BottomPanel
        world={world}
        truthMode={truthMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelect={handleSelect}
        selectedRuin={selectedRuin}
        onSelectRuin={setSelectedRuin}
        selectedFaction={selectedFaction}
        onSelectFaction={setSelectedFaction}
      />
    </div>
  );
}
