import type { MythWorld } from "../engine";
import { formatRelations } from "../engine";

interface RelationsPanelProps {
  world: MythWorld;
  truthMode: boolean;
  onSelect: (text: string) => void;
}

export function RelationsPanel({ world, truthMode, onSelect }: RelationsPanelProps) {
  const text = formatRelations(world, truthMode);

  const betrayalCount = world.relations.filter((r) => r.kind === "betrayal").length;

  return (
    <div className="panel">
      <button className="panel-item panel-item-active" onClick={() => onSelect(text)}>
        ◈ 관계도 ({world.relations.length}개 관계, 배신 {betrayalCount}건)
      </button>
      <div className="panel-hint">전체 관계도 보기</div>
    </div>
  );
}
