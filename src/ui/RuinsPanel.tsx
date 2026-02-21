import type { MythWorld, RuinId } from "../engine";
import { formatRuin } from "../engine";

interface RuinsPanelProps {
  world: MythWorld;
  truthMode: boolean;
  onSelect: (text: string) => void;
  selectedRuin: RuinId | null;
  onSelectRuin: (id: RuinId) => void;
}

export function RuinsPanel({
  world,
  truthMode,
  onSelect,
  selectedRuin,
  onSelectRuin,
}: RuinsPanelProps) {
  function handleClick(id: RuinId) {
    onSelectRuin(id);
    onSelect(formatRuin(world, id, truthMode));
  }

  return (
    <div className="panel">
      {world.ruins.map((r) => (
        <button
          key={r.id}
          className={`panel-item ${selectedRuin === r.id ? "panel-item-active" : ""}`}
          onClick={() => handleClick(r.id)}
        >
          [{r.id}] {r.mythName}
        </button>
      ))}
    </div>
  );
}
