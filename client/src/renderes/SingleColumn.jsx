// src/components/renderers/SingleColumn.jsx
// NO import needed — Block comes in as a prop

export default function SingleColumn({
  blocks, selId, font, sizes, accentColor,
  onSelect, onChange, onDelete, onMoveUp, onMoveDown,
  BlockComponent   // ← passed from ATSResumeBuilder
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {blocks.map(b => (
        <BlockComponent
          key={b.id} block={b} isSelected={selId === b.id}
          font={font} sizes={sizes} accentColor={accentColor}
          onSelect={() => onSelect(b.id)}
          onChange={text => onChange(b.id, text)}
          onDelete={() => onDelete(b.id)}
          onMoveUp={() => onMoveUp(b.id)}
          onMoveDown={() => onMoveDown(b.id)}
        />
      ))}
    </div>
  );
}