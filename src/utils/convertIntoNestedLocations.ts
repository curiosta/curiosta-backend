interface Location {
  name: string;
  id: string;
  parent_category_id: string;
  children?: Location[];
}

export function buildLocationTree(locations: Location[]): Location[] {
  const locationMap = new Map<string, Location>();
  const rootLocations: Location[] = [];

  // Create a map of locations using their IDs as keys
  locations.forEach((location) => {
    location.children = [];
    locationMap.set(location.id, location);
  });

  // Build the tree structure
  locations.forEach((location) => {
    const parentLocation = locationMap.get(location.parent_category_id);
    if (parentLocation) {
      parentLocation.children.push(location);
    } else {
      // If the parent doesn't exist, it's a root location
      rootLocations.push(location);
    }
  });

  return rootLocations;
}

export function getLocationPath(locations: Location[]) {
  return locations.map((l) => {
    const path = [];
    function getPath(loc: Location) {
      path.push(loc.name)
      if (loc.children) {
        loc.children.map(getPath)
      }
    }
    getPath(l)

    return path.join(' / ')
  })
}

export function getLastLocationPath(locations: Location[]) {
  return locations.map((l) => {
    const path = [];
    function getPath(loc: Location) {
      if (loc.children && loc.children.length) {
        loc.children.map(getPath)
      } else {
        path.push(loc.name)
      }
    }
    getPath(l)
    return path[0]
  })
}