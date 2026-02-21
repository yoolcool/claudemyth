import type { MythWorld } from "../engine";
import { formatTimeline } from "../engine";

interface TimelinePanelProps {
  world: MythWorld;
  truthMode: boolean;
  onSelect: (text: string) => void;
}

export function TimelinePanel({ world, truthMode, onSelect }: TimelinePanelProps) {
  const text = formatTimeline(world, truthMode);

  return (
    <div className="panel">
      <button className="panel-item panel-item-active" onClick={() => onSelect(text)}>
        ◈ 연대기 ({world.timeline.length}개 사건)
      </button>
      <div className="panel-hint">전체 연대기 보기</div>
    </div>
  );
}
