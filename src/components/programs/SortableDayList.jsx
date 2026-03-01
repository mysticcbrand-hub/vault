import { motion, AnimatePresence } from 'framer-motion'
import { DraggableCard } from './DraggableCard.jsx'
import { useDragToReorder } from '../../hooks/useDragToReorder.js'

// ─── SortableDayList ──────────────────────────────────────────────────────────
// Renders a list of training days with Apple-style drag-to-reorder.
// DayCard is rendered as the child of DraggableCard.
// ─────────────────────────────────────────────────────────────────────────────
export function SortableDayList({
  days,
  onReorder,
  DayCardComponent,
  // All props forwarded to each DayCard:
  expandedDay,
  onToggle,
  onRename,
  onRemove,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onReorderExercises,
}) {
  const {
    dragIndex,
    overIndex,
    isDragging,
    getVisualOrder,
    startLongPress,
    cancelLongPress,
    handleDragOver,
    handleDrop,
  } = useDragToReorder({ items: days, onReorder })

  const visualOrder = getVisualOrder()

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      className={isDragging ? 'drag-active' : ''}
    >
      <AnimatePresence initial={false}>
        {days.map((day, originalIndex) => {
          const visualPosition = visualOrder.indexOf(originalIndex)
          const isDisplaced = isDragging &&
            originalIndex !== dragIndex &&
            visualPosition !== originalIndex

          let displacedDir = 0
          if (isDisplaced) {
            displacedDir = originalIndex < dragIndex
              ? (overIndex <= originalIndex ? 1 : 0)
              : (overIndex >= originalIndex ? -1 : 0)
          }

          return (
            <DraggableCard
              key={day.id}
              index={originalIndex}
              isDragged={dragIndex === originalIndex}
              isDisplaced={!!displacedDir}
              displacedDir={displacedDir}
              isDragActive={isDragging}
              onLongPressStart={startLongPress}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <DayCardComponent
                day={day}
                dayIndex={originalIndex}
                isExpanded={expandedDay === day.id}
                onToggle={() => onToggle(day.id)}
                onRename={name => onRename(day.id, name)}
                onRemove={() => onRemove(day.id)}
                onAddExercise={() => onAddExercise(day.id)}
                onRemoveExercise={i => onRemoveExercise(day.id, i)}
                onUpdateExercise={(i, f, v) => onUpdateExercise(day.id, i, f, v)}
                onReorderExercises={(from, to) => onReorderExercises(day.id, from, to)}
              />
            </DraggableCard>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
