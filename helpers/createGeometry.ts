import * as THREE from "three";

/**
 * Convert GeoJSON coordinates to Three.js world coordinates
 */
const geoToWorld = (lon, lat, radius = 5) => {
  // Simple equirectangular projection for flat map
  const x = (lon / 180) * radius;
  const y = (lat / 90) * radius;
  return [x, 0, -y]; // Note: -y because Three.js Y is up, but we want north to be "up" on screen
};

/**
 * Main function to use with your existing code
 * This is the function you were missing in your original example
 */

/**
 * Convert GeoJSON coordinates to spherical coordinates (for globe)
 */
const geoToSphere = (lon, lat, radius = 5) => {
  const phi = (90 - lat) * (Math.PI / 180); // Convert to radians
  const theta = (lon + 180) * (Math.PI / 180);

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
};

/**
 * Create Three.js geometry from GeoJSON feature
 */
const createGeometryFromFeature = (feature, options = {}) => {
  const {
    projection = "flat", // 'flat' or 'sphere'
    extrudeHeight = 0.1,
    radius = 5,
  } = options;

  const coordinates = feature.geometry.coordinates;
  const geometryType = feature.geometry.type;

  // Choose projection function
  const projectCoords = projection === "sphere" ? geoToSphere : geoToWorld;

  switch (geometryType) {
    case "Polygon":
      return createPolygonGeometry(
        coordinates,
        projectCoords,
        extrudeHeight,
        radius
      );

    case "MultiPolygon":
      return createMultiPolygonGeometry(
        coordinates,
        projectCoords,
        extrudeHeight,
        radius
      );

    case "LineString":
      return createLineGeometry(coordinates, projectCoords, radius);

    default:
      console.warn(`Unsupported geometry type: ${geometryType}`);
      return new THREE.BoxGeometry(0.1, 0.1, 0.1); // Fallback
  }
};

/**
 * Create geometry for a single polygon
 */
const createPolygonGeometry = (
  coordinates,
  projectCoords,
  extrudeHeight,
  radius
) => {
  // coordinates[0] is the outer ring, coordinates[1+] are holes
  const outerRing = coordinates[0];

  // Convert coordinates to Vector2 for Shape
  const shape = new THREE.Shape();

  outerRing.forEach((coord, index) => {
    const [x, y, z] = projectCoords(coord[0], coord[1], radius);
    if (index === 0) {
      shape.moveTo(x, z); // Use x,z for 2D shape (y will be extrude direction)
    } else {
      shape.lineTo(x, z);
    }
  });

  // Handle holes (if any)
  const holes = coordinates.slice(1).map((hole) => {
    const holePath = new THREE.Path();
    hole.forEach((coord, index) => {
      const [x, y, z] = projectCoords(coord[0], coord[1], radius);
      if (index === 0) {
        holePath.moveTo(x, z);
      } else {
        holePath.lineTo(x, z);
      }
    });
    return holePath;
  });

  shape.holes = holes;

  // Create extruded geometry
  if (extrudeHeight > 0) {
    const extrudeSettings = {
      depth: extrudeHeight,
      bevelEnabled: false,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  } else {
    // Just a flat shape
    return new THREE.ShapeGeometry(shape);
  }
};

/**
 * Create geometry for multiple polygons (like countries with islands)
 */
const createMultiPolygonGeometry = (
  coordinates,
  projectCoords,
  extrudeHeight,
  radius
) => {
  const geometries = [];

  coordinates.forEach((polygonCoords) => {
    const geometry = createPolygonGeometry(
      polygonCoords,
      projectCoords,
      extrudeHeight,
      radius
    );
    geometries.push(geometry);
  });

  // Merge all geometries into one
  const mergedGeometry = new THREE.BufferGeometry();
  const mergedGeometries = geometries.map((geom) => {
    if (geom.isBufferGeometry) return geom;
    return new THREE.BufferGeometry().fromGeometry(geom);
  });

  return THREE.BufferGeometryUtils.mergeBufferGeometries(mergedGeometries);
};

/**
 * Create line geometry (for borders, roads, etc.)
 */
const createLineGeometry = (coordinates, projectCoords, radius) => {
  const points = coordinates.map((coord) => {
    const [x, y, z] = projectCoords(coord[0], coord[1], radius);
    return new THREE.Vector3(x, y, z);
  });

  return new THREE.BufferGeometry().setFromPoints(points);
};

/**
 * Utility function to get bounding box of a feature (useful for camera positioning)
 */
const getFeatureBounds = (feature) => {
  const coordinates = feature.geometry.coordinates;
  let minLon = Infinity,
    maxLon = -Infinity;
  let minLat = Infinity,
    maxLat = -Infinity;

  const processCoords = (coords) => {
    if (typeof coords[0] === "number") {
      // Single coordinate pair
      minLon = Math.min(minLon, coords[0]);
      maxLon = Math.max(maxLon, coords[0]);
      minLat = Math.min(minLat, coords[1]);
      maxLat = Math.max(maxLat, coords[1]);
    } else {
      // Array of coordinates
      coords.forEach(processCoords);
    }
  };

  processCoords(coordinates);

  return { minLon, maxLon, minLat, maxLat };
};

export { createGeometryFromFeature, geoToSphere, geoToWorld, getFeatureBounds };
