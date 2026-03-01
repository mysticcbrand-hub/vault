import { AnimatePresence } from 'framer-motion'
import { DraggableCard } from './DraggableCard.jsx'
import { useDragToReorder } from '../../hooks/useDragToReorder.js'

// ─── SortableExerciseList ─────────────────────────────────────────────────────
// Renders a list of exercises with Apple-style drag-to-reorder.
// ExerciseRow is rendered as the child of DraggableCard.
// ─────────────────────────────────────────────────────────────────────────────
export function SortableExerciseList({ exercises, onReorder, onRemove, onUpdate, ExerciseRowComponent }) {
  const {
    dragIndex,
    overIndex,
    isDragging,
    getVisualOrder,
    startLongPress,
    cancelLongPress,
    handleDragOver,
    handleDrop,
  } = useDragToReorder({ items: exercises, onReorder })

  const visualOrder = getVisualOrder()

  return (
    <AnimatePresence initial={false}>
      {exercises.map((ex, originalIndex) => {
        const visualPosition = visualOrder.indexOf(originalIndex)
        const isDisplaced = isDragging &&
          originalIndex !== dragIndex &&
          visualPosition !== originalIndex

        // Which direction is this card displaced?
        // If it was before the dragged card and now needs to move down → +1
        // If it was after the dragged card and now needs to move up → -1
        let displacedDir = 0
        if (isDisplaced) {
          displacedDir = originalIndex < dragIndex
            ? (overIndex <= originalIndex ? 1 : 0)
            : (overIndex >= originalIndex ? -1 : 0)
        }

        return (
          <DraggableCard
            key={`${ex.exerciseId}-${originalIndex}`}
            index={originalIndex}
            isDragged={dragIndex === originalIndex}
            isDisplaced={!!displacedDir}
            displacedDir={displacedDir}
            isDragActive={isDragging}
            onLongPressStart={startLongPress}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <ExerciseRowComponent
              exercise={ex}
              isLast={originalIndex === exercises.length - 1}
              onRemove={() => onRemove(originalIndex)}
              onUpdate={(field, value) => onUpdate(originalIndex, field, value)}
            />
          </DraggableCard>
        )
      })}
    </AnimatePresence>
  )
}
