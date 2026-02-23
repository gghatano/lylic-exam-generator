type SelectionPopupProps = {
  x: number
  y: number
  onAdd: () => void
}

export function SelectionPopup({ x, y, onAdd }: SelectionPopupProps) {
  return (
    <div className="selection-popup" style={{ left: x, top: y }}>
      <button onClick={onAdd}>傍線部に追加</button>
    </div>
  )
}
