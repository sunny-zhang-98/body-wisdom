import type { SelfCheck } from '../types'

interface Props {
  selfCheck: SelfCheck
}

export default function SelfCheckCard({ selfCheck }: Props) {
  return (
    <div className="self-check-card">
      <div className="self-check-card-title">🩺 {selfCheck.title}</div>
      <div className="self-check-card-step">
        <strong>操作方法：</strong>{selfCheck.method}
      </div>
      <div className="self-check-card-step">
        <strong>观察指标：</strong>{selfCheck.whatToObserve}
      </div>
      <div className="self-check-card-result">
        <div className="self-check-normal">
          ✅ <strong>正常：</strong>{selfCheck.normalResult}
        </div>
        <div className="self-check-warning">
          ⚠️ <strong>警示：</strong>{selfCheck.warningResult}
        </div>
      </div>
      {selfCheck.note && (
        <div className="self-check-card-note">📌 {selfCheck.note}</div>
      )}
    </div>
  )
}
