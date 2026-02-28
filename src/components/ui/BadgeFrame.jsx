import React from 'react'
import {
  Sparkles, Play, Star, Scale, Zap, Shield, ShieldCheck, Flame, Crown,
  Dumbbell, Activity, BarChart2, Trophy, Medal, Weight, Package, Layers,
  Mountain, TrendingUp, ArrowDown, ArrowUp, User, Grid, PenLine, Plus,
  Calendar, CalendarDays, Globe, Target, Sunrise, Moon, ClipboardList,
  CheckCircle, Award,
} from 'lucide-react'
import { RARITY_STYLES } from '../../data/badges.js'

// ─── Icon registry ─────────────────────────────────────────────────────────
const ICON_MAP = {
  Sparkles, Play, Star, Scale, Zap, Shield, ShieldCheck, Flame, Crown,
  Dumbbell, Activity, BarChart2, Trophy, Medal, Weight, Package, Layers,
  Mountain, TrendingUp, ArrowDown, ArrowUp, User, Grid, PenLine, Plus,
  Calendar, CalendarDays, Globe, Target, Sunrise, Moon, ClipboardList,
  CheckCircle, Award,
}

// ─── SVG shape paths ───────────────────────────────────────────────────────
const SHAPES = {
  circle: {
    clipPath: <circle cx="32" cy="32" r="29"/>,
    borderPath: <circle cx="32" cy="32" r="29" fill="none" strokeWidth="1.5"/>,
  },
  shield: {
    clipPath: <path d="M32 5 L57 15 L57 37 Q57 53 32 61 Q7 53 7 37 L7 15 Z"/>,
    borderPath: <path d="M32 5 L57 15 L57 37 Q57 53 32 61 Q7 53 7 37 L7 15 Z" fill="none" strokeWidth="1.5"/>,
  },
  hexagon: {
    clipPath: <polygon points="32,4 56,18 56,46 32,60 8,46 8,18"/>,
    borderPath: <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="none" strokeWidth="1.5"/>,
  },
  star: {
    clipPath: <polygon points="32,4 38,24 60,24 43,37 49,58 32,46 15,58 21,37 4,24 26,24"/>,
    borderPath: <polygon points="32,4 38,24 60,24 43,37 49,58 32,46 15,58 21,37 4,24 26,24" fill="none" strokeWidth="1.5"/>,
  },
  diamond: {
    clipPath: <polygon points="32,4 58,32 32,60 6,32"/>,
    borderPath: <polygon points="32,4 58,32 32,60 6,32" fill="none" strokeWidth="1.5"/>,
  },
  crown: {
    clipPath: <path d="M8,50 L8,20 L20,33 L32,8 L44,33 L56,20 L56,50 Z"/>,
    borderPath: <path d="M8,50 L8,20 L20,33 L32,8 L44,33 L56,20 L56,50 Z" fill="none" strokeWidth="1.5"/>,
  },
}

// ─── Legendary floating particles ─────────────────────────────────────────
const PARTICLES = [
  { angle: 0,   dur: 4.2 },
  { angle: 45,  dur: 3.8 },
  { angle: 90,  dur: 5.1 },
  { angle: 135, dur: 4.6 },
  { angle: 180, dur: 3.5 },
  { angle: 225, dur: 4.9 },
  { angle: 270, dur: 3.7 },
  { angle: 315, dur: 4.3 },
]

export function BadgeFrame({ badge, size = 64, locked = false, animated = true }) {
  const shape = SHAPES[badge.shape] ?? SHAPES.circle
  const style = RARITY_STYLES[badge.rarity] ?? RARITY_STYLES.common
  const IconComponent = ICON_MAP[badge.icon]
  const iconSize = Math.round(size * 0.38)
  const clipId = `clip-${badge.id}-${size}`
  const gradId = `grad-${badge.id}-${size}`
  const shimId = `shim-${badge.id}-${size}`

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0,
      filter: locked ? 'grayscale(1) brightness(0.35)' : 'none',
      transition: 'filter 0.3s ease',
    }}>
      {/* Legendary glow behind */}
      {badge.rarity === 'legendary' && !locked && animated && (
        <div style={{
          position: 'absolute',
          inset: -Math.round(size * 0.14),
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${style.glowColor} 0%, transparent 70%)`,
          animation: 'legendaryPulse 2.5s ease-in-out infinite',
          pointerEvents: 'none',
        }}/>
      )}

      {/* Legendary orbiting particles */}
      {badge.rarity === 'legendary' && !locked && animated && PARTICLES.map((p, i) => (
        <div
          key={i}
          className="legendary-particle"
          style={{
            '--start-angle': `${p.angle}deg`,
            '--orbit-r': `${size * 0.6}px`,
            '--duration': `${p.dur}s`,
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: Math.max(2, Math.round(size * 0.05)),
            height: Math.max(2, Math.round(size * 0.05)),
            borderRadius: '50%',
            background: style.iconColor,
            marginTop: -Math.max(1, Math.round(size * 0.025)),
            marginLeft: -Math.max(1, Math.round(size * 0.025)),
            opacity: 0.65,
          }}
        />
      ))}

      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <clipPath id={clipId}>
            {shape.clipPath}
          </clipPath>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={style.borderColor1} stopOpacity="1"/>
            <stop offset="100%" stopColor={style.borderColor2} stopOpacity="1"/>
          </linearGradient>
          {style.shimmer && (
            <linearGradient id={shimId} x1="-100%" y1="0" x2="100%" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="transparent"/>
              <stop offset="50%" stopColor="rgba(255,255,255,0.07)"/>
              <stop offset="100%" stopColor="transparent"/>
            </linearGradient>
          )}
        </defs>

        {/* Background */}
        <g clipPath={`url(#${clipId})`}>
          <rect width="64" height="64" fill={style.frameBg}/>
          {/* Subtle inner gradient */}
          <rect width="64" height="64" fill="url(#innerGrad)" opacity="0.4"/>
        </g>

        {/* Shimmer overlay for rare/epic/legendary */}
        {style.shimmer && !locked && (
          <g clipPath={`url(#${clipId})`}>
            <rect
              width="64" height="64"
              fill={`url(#${shimId})`}
              className="badge-shimmer-rect"
            />
          </g>
        )}

        {/* Border */}
        <g>
          {React.cloneElement(shape.borderPath, {
            stroke: `url(#${gradId})`,
          })}
        </g>
      </svg>

      {/* Icon centered, rendered outside SVG for proper Lucide rendering */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {IconComponent ? (
          <IconComponent
            size={iconSize}
            color={locked ? 'rgba(255,255,255,0.18)' : style.iconColor}
            strokeWidth={1.8}
          />
        ) : (
          <span style={{ fontSize: iconSize * 0.7, color: style.iconColor }}>?</span>
        )}
      </div>
    </div>
  )
}
