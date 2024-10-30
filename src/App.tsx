import React, { useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin } from "lucide-react";
import LocationSearch from "./components/LocationSearch";
import LocationList from "./components/LocationList";
import DistanceMatrix from "./components/DistanceMatrix";
import OptimalRoute from "./components/OptimalRoute";
import { findBestRoute } from "./utils/routeOptimizer";
import type { Location, DistanceResult, OptimizedRoute } from "./types";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function distanceToOptimizedRoute(
  result: google.maps.DirectionsResult,
  originalWaypoints: Location[],
  origin: Location
): Location[] {
  const firstRoute = result.routes?.[0];
  if (!firstRoute) {
    return [];
  }

  const waypointOrder = firstRoute.waypoint_order;
  const sortedLocations: Location[] = waypointOrder.map(
    (index) => originalWaypoints[index]
  );
  return [origin, ...sortedLocations];
}

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [results, setResults] = useState<DistanceResult[]>([]);
  const [directionRoute, setDirectionRoute] = useState<Location[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    });

    loader.load().then(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (locations.length < 2) {
      setResults([]);
      setOptimizedRoute([]);
      return;
    }

    // Calculate distance matrix
    const dmService = new google.maps.DistanceMatrixService();
    const origins = locations.map((loc) => ({ placeId: loc.placeId }));
    const destinations = [...origins];

    dmService.getDistanceMatrix(
      {
        origins,
        destinations,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK" && response) {
          const newResults: DistanceResult[] = [];
          response.rows.forEach((row, i) => {
            row.elements.forEach((element, j) => {
              if (i !== j) {
                newResults.push({
                  origin: locations[i].name,
                  destination: locations[j].name,
                  distance: element.distance.text,
                  duration: element.duration.text,
                });
              }
            });
          });
          setResults(newResults);

          // Start route optimization
          setIsOptimizing(true);
          // console.log("matrix loc: ", locations);
          findBestRoute(locations).then((bestRoute) => {
            const bestLocationOrder: Location[] = bestRoute.order.map(
              (index) => locations[index]
            );
            setOptimizedRoute(bestLocationOrder);
            setIsOptimizing(false);
          });
        }
      }
    );
  }, [locations]);

  useEffect(() => {
    if (locations.length < 2) {
      return;
    }

    // Calculate order using Directions API
    const directionsService = new google.maps.DirectionsService();
    const [mainOrigin, ...wpts] = locations;
    const waypoints = wpts.map((location) => {
      return {
        location: { placeId: location.placeId },
        stopover: true,
      };
    });

    const response = directionsService.route({
      origin: { placeId: mainOrigin.placeId },
      destination: { placeId: mainOrigin.placeId },
      waypoints,
      optimizeWaypoints: true, // This will optimize the route
      travelMode: google.maps.TravelMode.DRIVING,
    });

    response.then((resp) => {
      // const send = [mainOrigin, ...wpts, mainOrigin].map((wp) => wp.placeId);
      // console.log("waypoints send: ", send);
      // const receivedWpts = resp.geocoded_waypoints?.map((w) => w.place_id);
      // console.log("waypoints received: ", receivedWpts);
      // console.log("response: ", resp);
      const optRes = distanceToOptimizedRoute(resp, wpts, mainOrigin);
      setDirectionRoute(optRes);
    });
  }, [locations]);

  const handleAddLocation = (location: Location) => {
    setLocations((prev) => [...prev, location]);
  };

  const handleRemoveLocation = (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  const handleReorderLocations = (startIndex: number, endIndex: number) => {
    setLocations((prev) => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Distance Matrix Explorer
            </h1>
          </div>
          <p className="text-gray-600">
            Calculate distances and find the shortest route between locations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Add Locations
              </h2>
              <LocationSearch onLocationSelect={handleAddLocation} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Location List
              </h2>
              <LocationList
                locations={locations}
                onRemoveLocation={handleRemoveLocation}
                onReorderLocations={handleReorderLocations}
              />
            </div>

            {optimizedRoute && (
              <OptimalRoute
                title="Matrix API (local nearest neighbor)"
                locations={locations}
                optimizedRoute={optimizedRoute}
                isOptimizing={isOptimizing}
              />
            )}

            {directionRoute && (
              <OptimalRoute
                title="Distance API"
                locations={locations}
                optimizedRoute={directionRoute}
                isOptimizing={isOptimizing}
              />
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Distance Matrix
            </h2>
            <DistanceMatrix results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
