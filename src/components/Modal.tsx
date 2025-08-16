import type { PropsWithChildren } from "react";


interface Props {
  open: boolean
  onClose: () => void
}
export default function Modal({ open, onClose, children }: PropsWithChildren<Props>) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
