"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface DerivedValue {
  key: string;
  label: string;
  placeholder: string;
  score: number;
  definition: string;
}

interface ValueRankerProps {
  derivedValues: DerivedValue[];
  onChange: (values: DerivedValue[]) => void;
}

function SortableValueItem({
  value,
  index,
  onDefinitionChange,
}: {
  value: DerivedValue;
  index: number;
  onDefinitionChange: (key: string, def: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: value.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-falcon-100 p-4 space-y-3 ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          className="cursor-grab touch-none text-falcon-300 hover:text-falcon-500 transition-colors"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${value.label}`}
        >
          <GripVertical size={18} />
        </button>
        <span className="text-xs font-medium text-falcon-400 w-5">
          {index + 1}
        </span>
        <span className="text-sm font-medium text-falcon-950">
          {value.label}
        </span>
        <span className="ml-auto text-xs text-falcon-400">
          chosen {value.score}×
        </span>
      </div>
      <Textarea
        value={value.definition}
        onChange={(e) => onDefinitionChange(value.key, e.target.value)}
        placeholder={value.placeholder}
        className="resize-none text-sm bg-falcon-50"
        rows={2}
      />
    </div>
  );
}

export function ValueRanker({ derivedValues, onChange }: ValueRankerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = derivedValues.findIndex((v) => v.key === active.id);
      const newIndex = derivedValues.findIndex((v) => v.key === over.id);
      onChange(arrayMove(derivedValues, oldIndex, newIndex));
    }
  }

  function handleDefinitionChange(key: string, definition: string) {
    onChange(
      derivedValues.map((v) => (v.key === key ? { ...v, definition } : v))
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={derivedValues.map((v) => v.key)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {derivedValues.map((value, index) => (
            <SortableValueItem
              key={value.key}
              value={value}
              index={index}
              onDefinitionChange={handleDefinitionChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
