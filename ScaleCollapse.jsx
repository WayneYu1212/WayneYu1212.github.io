import { useEffect, useState } from 'react'

const STEPS = ['100,000 km', '10,000 km', '100 km', '5 km', '500 m']

// 《附近未见》独有的尺度坍缩：宇宙可以无限大，值得注意的世界也可以只有五百米。
export default function ScaleCollapse() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (i >= STEPS.length - 1) return
    const t = setTimeout(() => setI(i + 1), i === 0 ? 700 : 520)
    return () => clearTimeout(t)
  }, [i])

  return (
    <div className="collapse" aria-hidden="true">
      <span className="collapse__label">SCALE</span>
      <ol className="collapse__list">
        {STEPS.map((s, n) => (
          <li key={s} className={n <= i ? 'is-on' : ''} data-final={n === STEPS.length - 1}>
            {s}
          </li>
        ))}
      </ol>
      <p className="collapse__note">从宇宙深处一路缩小，直到街道的尺度。</p>
    </div>
  )
}
