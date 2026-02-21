import type { MythWorld, CharacterId } from "../engine";
import { formatCharacter, formatCharacterDialogue } from "../engine";

interface PeoplePanelProps {
  world: MythWorld;
  truthMode: boolean;
  onSelect: (text: string) => void;
  selectedCharacter: CharacterId | null;
  onSelectCharacter: (id: CharacterId) => void;
}

export function PeoplePanel({
  world,
  truthMode,
  onSelect,
  selectedCharacter,
  onSelectCharacter,
}: PeoplePanelProps) {
  function handleClick(id: CharacterId) {
    onSelectCharacter(id);
    const charDetail = formatCharacter(world, id, truthMode);
    const dialogueDetail = formatCharacterDialogue(world, id, truthMode);
    onSelect(charDetail + "\n\n" + dialogueDetail);
  }

  return (
    <div className="panel">
      {world.people.map((p) => {
        const faction = p.factionId
          ? world.factions.find((f) => f.id === p.factionId)
          : null;
        const factionLabel = faction ? faction.name : "무소속";

        return (
          <button
            key={p.id}
            className={`panel-item ${selectedCharacter === p.id ? "panel-item-active" : ""}`}
            onClick={() => handleClick(p.id)}
          >
            {p.name} — {p.epithet} ({factionLabel})
          </button>
        );
      })}
    </div>
  );
}
