import type { MythWorld } from "../engine";
import { formatWorldSummary } from "../engine";

interface WorldPanelProps {
  world: MythWorld;
  truthMode: boolean;
  onSelect: (text: string) => void;
}

export function WorldPanel({ world, truthMode, onSelect }: WorldPanelProps) {
  const text = formatWorldSummary(world, truthMode);

  return (
    <div className="panel">
      <button className="panel-item panel-item-active" onClick={() => onSelect(text)}>
        ◈ {world.god.mythTitle}
      </button>
      <div className="panel-hint">파괴신 정보 보기</div>
    </div>
  );
}
