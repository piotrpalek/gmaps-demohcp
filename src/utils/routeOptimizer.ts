import type { Location, OptimizedRoute } from "../types";

// Nearest neighbor algorithm to solve TSP
function findBestOrder(distances: number[][]): number[] {
  const n = distances.length;
  const visited = new Set<number>([0]);
  const order = [0];

  while (visited.size < n) {
    let lastCity = order[order.length - 1];
    let nextCity = -1;
    let minDistance = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && distances[lastCity][i] < minDistance) {
        minDistance = distances[lastCity][i];
        nextCity = i;
      }
    }

    visited.add(nextCity);
    order.push(nextCity);
  }

  return order;
}

export async function findBestRoute(
  locations: Location[]
): Promise<OptimizedRoute> {
  if (locations.length < 2) {
    throw new Error("Need at least 2 locations to optimize route");
  }

  // First, get the distance matrix for all locations
  const service = new google.maps.DistanceMatrixService();
  const origins = locations.map((loc) => ({ placeId: loc.placeId }));
  const destinations = [...origins];

  return new Promise((resolve, reject) => {
    service.getDistanceMatrix(
      {
        origins,
        destinations,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      async (response, status) => {
        if (status === "OK" && response) {
          // Convert response to distance matrix
          const distances: number[][] = response.rows.map((row) =>
            row.elements.map((element) => element.distance.value)
          );

          // console.log('distance matrix: ', distances);
          // console.log('resp: ', response);

          // Find optimal order using nearest neighbor algorithm
          const bestOrder = findBestOrder(distances);

          // Get detailed route for the optimal order
          const directionsService = new google.maps.DirectionsService();
          const orderedLocations = bestOrder.map((i) => locations[i]);

          try {
            const result = await new Promise<google.maps.DirectionsResult>(
              (resolveDir, rejectDir) => {
                directionsService.route(
                  {
                    origin: { placeId: orderedLocations[0].placeId },
                    destination: { placeId: orderedLocations[0].placeId },
                    waypoints: orderedLocations.slice(1).map((location) => ({
                      location: { placeId: location.placeId },
                      stopover: true,
                    })),
                    travelMode: google.maps.TravelMode.DRIVING,
                  },
                  (result, directionsStatus) => {
                    if (directionsStatus === "OK" && result) {
                      resolveDir(result);
                    } else {
                      rejectDir(
                        new Error(
                          `Directions request failed: ${directionsStatus}`
                        )
                      );
                    }
                  }
                );
              }
            );

            const route = result.routes[0];
            resolve({
              order: bestOrder,
              totalDistance: route.legs
                .reduce((acc, leg) => acc + leg.distance?.text + " + ", "")
                .slice(0, -3),
              totalDuration: route.legs
                .reduce((acc, leg) => acc + leg.duration?.text + " + ", "")
                .slice(0, -3),
            });
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`Distance Matrix request failed: ${status}`));
        }
      }
    );
  });
}
