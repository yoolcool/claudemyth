import type { MythWorld, RuinId } from "../engine";
import type { TabId } from "./Tabs";
import { Tabs } from "./Tabs";
import { WorldPanel } from "./WorldPanel";
import { RuinsPanel } from "./RuinsPanel";
import { FactionsPanel } from "./FactionsPanel";
import { TimelinePanel } from "./TimelinePanel";

interface BottomPanelProps {
  world: MythWorld | null;
  truthMode: boolean;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSelect: (text: string) => void;
  selectedRuin: RuinId | null;
  onSelectRuin: (id: RuinId) => void;
  selectedFaction: string | null;
  onSelectFaction: (id: string) => void;
}

export function BottomPanel({
  world,
  truthMode,
  activeTab,
  onTabChange,
  onSelect,
  selectedRuin,
  onSelectRuin,
  selectedFaction,
  onSelectFaction,
}: BottomPanelProps) {
  return (
    <div className="bottom-panel">
      <Tabs active={activeTab} onChange={onTabChange} />
      <div className="panel-content">
        {!world ? (
          <div className="panel-empty">세계를 먼저 생성하세요.</div>
        ) : activeTab === "world" ? (
          <WorldPanel world={world} truthMode={truthMode} onSelect={onSelect} />
        ) : activeTab === "ruins" ? (
          <RuinsPanel
            world={world}
            truthMode={truthMode}
            onSelect={onSelect}
            selectedRuin={selectedRuin}
            onSelectRuin={onSelectRuin}
          />
        ) : activeTab === "factions" ? (
          <FactionsPanel
            world={world}
            truthMode={truthMode}
            onSelect={onSelect}
            selectedFaction={selectedFaction}
            onSelectFaction={onSelectFaction}
          />
        ) : (
          <TimelinePanel world={world} truthMode={truthMode} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}
