import React from 'react';
import { GripVertical, X } from 'lucide-react';
import type { Location } from '../types';

interface Props {
  locations: Location[];
  onRemoveLocation: (id: string) => void;
  onReorderLocations: (startIndex: number, endIndex: number) => void;
}

export default function LocationList({ locations, onRemoveLocation, onReorderLocations }: Props) {
  const [draggedItem, setDraggedItem] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null) return;
    if (draggedItem === index) return;

    onReorderLocations(draggedItem, index);
    setDraggedItem(index);
  };

  return (
    <div className="space-y-2">
      {locations.map((location, index) => (
        <div
          key={location.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={() => setDraggedItem(null)}
          className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{location.name}</h3>
            <p className="text-sm text-gray-500">{location.address}</p>
          </div>
          <button
            onClick={() => onRemoveLocation(location.id)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );
}