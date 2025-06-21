import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import OnScreenKeyboard from "@/components/ui/OnScreenKeyboard.jsx";

function SortableKey({ id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="px-3 py-2 bg-white border rounded shadow min-w-[48px] text-center"
    >
      {id}
    </button>
  );
}

function EmptySlot({ id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab", // or "default" if you don't want empty slots draggable
  };

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="min-w-[48px] min-h-[36px] border-2 border-dashed rounded bg-gray-100 flex items-center justify-center text-gray-400 select-none"
      disabled={true} // disables actual drag interaction if you want (optional)
      onClick={(e) => e.preventDefault()} // prevent clicks if needed
    >
      &nbsp;
    </button>
  );
}

export default function KeyboardEditor({ keyboardRows, setKeyboardRows }) {
  // availableKeys are all keys not currently on keyboard
  const [availableKeys, setAvailableKeys] = useState([
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const [activeId, setActiveId] = useState(null);

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // We'll parse empty slot ids like "empty-3"
    const isEmptySlot = overId.startsWith && overId.startsWith("empty-");

    if (keyboardRows.topRow.includes(activeId) || availableKeys.includes(activeId)) {
      // Dragging a key either from keyboard or available keys

      if (keyboardRows.topRow.includes(overId) || isEmptySlot) {
        // Dropped on a keyboard slot (occupied or empty)

        const newTopRow = [...keyboardRows.topRow];
        let overIndex;

        if (isEmptySlot) {
          // Parse index from "empty-X"
          overIndex = parseInt(overId.split("-")[1], 10);
        } else {
          overIndex = newTopRow.indexOf(overId);
        }

        if (availableKeys.includes(activeId)) {
          // Dragging from available keys to keyboard slot
          // Remove activeId from availableKeys
          setAvailableKeys((keys) => keys.filter((k) => k !== activeId));

          // If slot occupied, put replaced key back into available keys
          const replacedKey = newTopRow[overIndex];
          if (replacedKey) {
            setAvailableKeys((keys) => [...keys, replacedKey]);
          }

          newTopRow[overIndex] = activeId;
          setKeyboardRows({ ...keyboardRows, topRow: newTopRow });
        } else if (keyboardRows.topRow.includes(activeId)) {
          // Dragging within keyboard (reorder or replace)
          const activeIndex = newTopRow.indexOf(activeId);

          if (activeIndex === overIndex) return; // dropped on itself, no change

          if (isEmptySlot) {
            // Move key to empty slot (replace null)
            newTopRow[activeIndex] = null;
            newTopRow[overIndex] = activeId;
            setKeyboardRows({ ...keyboardRows, topRow: newTopRow });
          } else {
            // Reorder keys: move active key before over key
            newTopRow.splice(activeIndex, 1);
            newTopRow.splice(overIndex, 0, activeId);
            setKeyboardRows({ ...keyboardRows, topRow: newTopRow });
          }
        }
      } else if (availableKeys.includes(overId)) {
        // Dropped on available keys (remove from keyboard)
        if (keyboardRows.topRow.includes(activeId)) {
          const newTopRow = [...keyboardRows.topRow];
          const activeIndex = newTopRow.indexOf(activeId);
          newTopRow[activeIndex] = null; // Mark slot empty

          setAvailableKeys((keys) => [...keys, activeId]);
          setKeyboardRows({ ...keyboardRows, topRow: newTopRow });
        }
      }
    }
  }

  // Prepare sortable items: keys and empty slots with unique ids
  // For SortableContext, ids must be unique strings
  // Use keys and empty slot ids e.g. "empty-3"

  const sortableItems = keyboardRows.topRow.map((key, index) =>
    key ? key : `empty-${index}`
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col w-full h-full space-y-6">
        {/* Available Keys on top */}
        <div className="border rounded p-4 bg-gray-50 max-h-40 overflow-auto">
          <p className="font-semibold mb-2">Available Keys</p>
          <SortableContext items={availableKeys} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-wrap gap-2">
              {availableKeys.map((key) => (
                <SortableKey key={key} id={key} />
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Keyboard rows below available keys */}
        <div className="flex flex-col space-y-3">
          <p className="font-semibold mb-2">Custom Keyboard</p>
          <SortableContext items={sortableItems} strategy={horizontalListSortingStrategy}>
            <div className="flex space-x-2 p-2 border rounded bg-white min-w-[480px]">
              {keyboardRows.topRow.map((key, index) =>
                key ? (
                  <SortableKey key={key} id={key} />
                ) : (
                  <EmptySlot key={`empty-${index}`} id={`empty-${index}`} />
                )
              )}
            </div>
          </SortableContext>

          <div className="mt-6 border p-4 bg-white rounded shadow max-w-md mx-auto">
            <p className="font-semibold mb-2 text-center">On-Screen Keyboard Preview</p>
            <OnScreenKeyboard layout={keyboardRows} previewMode={true} />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId && !activeId.startsWith("empty-") ? (
          <button className="px-3 py-2 bg-blue-200 rounded">{activeId}</button>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
