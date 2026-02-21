export type TabId = "world" | "ruins" | "factions" | "timeline";

interface TabsProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TAB_LABELS: { id: TabId; label: string }[] = [
  { id: "world", label: "World" },
  { id: "ruins", label: "Ruins" },
  { id: "factions", label: "Factions" },
  { id: "timeline", label: "Timeline" },
];

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <div className="tabs">
      {TAB_LABELS.map((t) => (
        <button
          key={t.id}
          className={`tab ${active === t.id ? "tab-active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
