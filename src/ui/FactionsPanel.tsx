import type { MythWorld } from "../engine";
import { formatFaction } from "../engine";

interface FactionsPanelProps {
  world: MythWorld;
  truthMode: boolean;
  onSelect: (text: string) => void;
  selectedFaction: string | null;
  onSelectFaction: (id: string) => void;
}

export function FactionsPanel({
  world,
  truthMode,
  onSelect,
  selectedFaction,
  onSelectFaction,
}: FactionsPanelProps) {
  function handleClick(id: string) {
    onSelectFaction(id);
    const faction = world.factions.find((f) => f.id === id);
    if (faction) {
      onSelect(formatFaction(world, id, truthMode));
    }
  }

  return (
    <div className="panel">
      {world.factions.map((f) => (
        <button
          key={f.id}
          className={`panel-item ${selectedFaction === f.id ? "panel-item-active" : ""}`}
          onClick={() => handleClick(f.id)}
        >
          {f.name}
        </button>
      ))}
    </div>
  );
}
