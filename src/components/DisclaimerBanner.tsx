interface Props {
  text?: string
}

export default function DisclaimerBanner({ text }: Props) {
  return (
    <div className="disclaimer-banner">
      <span className="icon">⚠️</span>
      <span>
        {text || '内容由 AI 生成，非专业医生建议，仅供参考。如有身体不适请及时就医。'}
      </span>
    </div>
  )
}
