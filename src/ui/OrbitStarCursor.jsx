import { useEffect, useRef } from 'react'
import { SCENE_STAGE, useCosmos } from '../state/store'
import { resolveBudget } from '../lib/perf'

const MAX_TRAIL_POINTS = 6

export default function OrbitStarCursor() {
  const stage = useCosmos((state) => state.stage)
  const deviceTier = useCosmos((state) => state.deviceTier)
  const quality = useCosmos((state) => state.quality)
  const root = useRef(null)
  const star = useRef(null)
  const canvas = useRef(null)
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cursorEffects = resolveBudget(deviceTier, quality).cursorEffects
  const visible = finePointer && cursorEffects && stage !== SCENE_STAGE.READING
  const trailEnabled = visible && !reducedMotion

  useEffect(() => {
    const app = document.querySelector('.app')
    if (visible) app?.classList.add('has-orbit-cursor')
    return () => app?.classList.remove('has-orbit-cursor')
  }, [visible])

  useEffect(() => {
    if (!visible) return undefined
    const rootNode = root.current
    const starNode = star.current
    const trail = canvas.current
    const context = trailEnabled ? trail?.getContext('2d') : null
    let points = []
    let frame = null
    let ratio = 1

    const resize = () => {
      if (!trail || !context) return
      ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      trail.width = Math.round(window.innerWidth * ratio)
      trail.height = Math.round(window.innerHeight * ratio)
      trail.style.width = `${window.innerWidth}px`
      trail.style.height = `${window.innerHeight}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const move = (event) => {
      starNode.style.transform = `translate3d(${event.clientX - 9}px, ${event.clientY - 9}px, 0)`
      if (trailEnabled) {
        points.push({ x: event.clientX, y: event.clientY, life: 1 })
        points = points.slice(-MAX_TRAIL_POINTS)
      }
      rootNode.classList.toggle('is-interactive', Boolean(event.target?.closest?.('button,a,[role="button"]')))
    }

    const draw = () => {
      if (context) {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight)
        points = points
          .map((point) => ({ ...point, life: point.life - 0.055 }))
          .filter((point) => point.life > 0)
        if (points.length > 1) {
          const first = points[0]
          const last = points.at(-1)
          const gradient = context.createLinearGradient(first.x, first.y, last.x, last.y)
          gradient.addColorStop(0, 'rgba(106, 174, 235, 0)')
          gradient.addColorStop(1, `rgba(205, 232, 255, ${0.62 * last.life})`)
          context.beginPath()
          context.moveTo(first.x, first.y)
          for (let index = 1; index < points.length - 1; index += 1) {
            const point = points[index]
            const next = points[index + 1]
            context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2)
          }
          context.lineTo?.(last.x, last.y)
          context.strokeStyle = gradient
          context.lineWidth = 1.15
          context.lineCap = 'round'
          context.stroke()
        }
      }
      frame = window.requestAnimationFrame(draw)
    }

    const down = () => rootNode.classList.add('is-pressed')
    const up = () => rootNode.classList.remove('is-pressed')
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    frame = window.requestAnimationFrame(draw)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [visible, trailEnabled])

  if (!visible) return null

  return (
    <div ref={root} className={`orbit-cursor${reducedMotion ? ' is-reduced' : ''}`} data-testid="orbit-star-cursor" aria-hidden="true">
      {trailEnabled && <canvas ref={canvas} className="orbit-cursor__trail" />}
      <span ref={star} className="orbit-cursor__star" data-testid="orbit-star">
        <i className="orbit-cursor__core" />
        <i className="orbit-cursor__ring" />
      </span>
    </div>
  )
}
