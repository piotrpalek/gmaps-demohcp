export interface Location {
  id: string;
  name: string;
  address: string;
  placeId: string;
  distance: number;
  duration: number;
}

export interface DistanceResult {
  origin: string;
  destination: string;
  distance: string;
  duration: string;
}

export interface OptimizedRoute {
  order: number[];
  totalDistance: string;
  totalDuration: string;
}
