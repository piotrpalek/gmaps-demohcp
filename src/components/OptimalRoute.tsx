import React from "react";
import { Route } from "lucide-react";
import type { Location } from "../types";

interface Props {
  locations: Location[];
  optimizedRoute: Location[];
  isOptimizing: boolean;
  title: string;
}

export default function OptimalRoute({
  title,
  locations,
  optimizedRoute,
  isOptimizing,
}: Props) {
  if (locations.length < 2 || optimizedRoute.length < 2) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Route className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        {isOptimizing && (
          <div className="ml-2 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="ml-2 text-sm text-gray-500">
              Optimizing route...
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          {optimizedRoute.map((route, i) => (
            <div key={route.id} className="flex items-center gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{route.name}</h3>
                <p className="text-sm text-gray-500">{route.address}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
              {optimizedRoute.length + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                Back to start ({optimizedRoute[0].name})
              </h3>
            </div>
          </div>
        </div>

        {/* <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p>
              Total Distance:{' '}
              <span className="font-medium text-gray-900">
                OVER 9000
              </span>
            </p>
            <p>
              Total Duration:{' '}
              <span className="font-medium text-gray-900">
                OVER 100000
              </span>
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
