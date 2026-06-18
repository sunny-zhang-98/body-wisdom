import type { Behavior } from '../types'

interface Props {
  behavior: Behavior
  onClick?: () => void
}

export default function BehaviorCard({ behavior, onClick }: Props) {
  return (
    <div className="behavior-card" onClick={onClick}>
      <div className="behavior-card-top">
        <span className="behavior-card-name">{behavior.name}</span>
        <span className={`tag ${behavior.type === 'beneficial' ? 'tag-beneficial' : 'tag-harmful'}`}>
          {behavior.type === 'beneficial' ? '有益' : '有害'}
        </span>
      </div>
      <div className="behavior-card-quant">{behavior.quantificationNote}</div>
    </div>
  )
}
