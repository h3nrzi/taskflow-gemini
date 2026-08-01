---
name: dnd_kit_interactions
description: Drag and drop interaction implementations using @dnd-kit (DndContext, SortableContext, drag overlay, and smooth drop animations).
---

# @dnd-kit Interactions & Drag-and-Drop Skill

This skill defines the setup and interaction patterns for drag-and-drop Kanban board movements and list re-ordering using `@dnd-kit`.

## 1. Core Component Context Setup
- Wrap Kanban board in `<DndContext>` providing custom collision detection (`rectIntersection` or `closestCorners`).
- Support both Mouse/Pointer and Keyboard sensors for accessible drag interaction:
  ```ts
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );
  ```

## 2. Sortable Items & Columns
- Enclose column items in `<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>`.
- Utilize `useSortable({ id: task.id })` hook in item components (`TaskCard`) extracting `attributes`, `listeners`, `setNodeRef`, `transform`, and `transition`.

## 3. Visual Drag Feedback & DragOverlay
- Render a dedicated `<DragOverlay>` to display a floating active card preview during drag operations.
- Apply smooth CSS transforms (`CSSTransition` / `transform` helper) with subtle rotation/elevation effects while dragging.

## 4. Optimistic Reordering & Drop Handlers
- Update local Kanban column state immediately on `onDragEnd` / `onDragOver` for zero UI latency.
- Persist move mutations to the API asynchronously (`updateTaskStatus`) and handle rollback gracefully on failure.
