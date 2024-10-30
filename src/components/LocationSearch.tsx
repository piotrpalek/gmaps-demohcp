import React, { useEffect, useRef, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import type { Location } from '../types';

interface Props {
  onLocationSelect: (location: Location) => void;
  value?: Location;
}

export default function LocationSearch({ onLocationSelect, value }: Props) {
  const [searchValue, setSearchValue] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['place_id', 'formatted_address', 'name'],
      types: ['establishment', 'geocode']
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.place_id) {
        onLocationSelect({
          id: crypto.randomUUID(),
          name: place.name || place.formatted_address || '',
          address: place.formatted_address || '',
          placeId: place.place_id
        });
        setSearchValue('');
      }
    });
  }, [onLocationSelect]);

  const selectedValue = value?.address.toString();

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedValue || searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search for a location..."
          className="w-full px-4 py-2 pl-10 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <button
          onClick={() => inputRef.current?.focus()}
          className="absolute right-2 top-1.5 p-1 hover:bg-gray-100 rounded-full"
        >
          <Plus className="h-5 w-5 text-blue-500" />
        </button>
      </div>
    </div>
  );
}