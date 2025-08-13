import earcut from "earcut";
import { THREE } from "expo-three";

function geoToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export const createGeoJSONGeometry = (
  geoJSON: GeoJSON.FeatureCollection,
  radius: number = 1
) => {
  const lineVertices: Array<number> = [];

  function processCoordinates(coordinates: number[][][], type: string) {
    switch (type) {
      case "LineString":
        for (let i = 0; i < coordinates.length - 1; i++) {
          const start = geoToVector3(
            coordinates[i][1],
            coordinates[i][0],
            radius
          );
          const end = geoToVector3(
            coordinates[i + 1][1],
            coordinates[i + 1][0],
            radius
          );
          lineVertices.push(start.x, start.y, start.z, end.x, end.y, end.z);
        }
        break;

      case "Polygon":
        coordinates.forEach((ring: any) => {
          for (let i = 0; i < ring.length - 1; i++) {
            const start = geoToVector3(ring[i][1], ring[i][0], radius);
            const end = geoToVector3(ring[i + 1][1], ring[i + 1][0], radius);
            lineVertices.push(start.x, start.y, start.z, end.x, end.y, end.z);
          }
        });
        break;

      case "MultiLineString":
        coordinates.forEach((lineString) =>
          processCoordinates(lineString, "LineString")
        );
        break;

      case "MultiPolygon":
        coordinates.forEach((polygon) =>
          processCoordinates(polygon, "Polygon")
        );
        break;
    }
  }

  function processFeature(feature: GeoJSON.Feature) {
    const { geometry } = feature;
    //@ts-ignore
    if (geometry && geometry.coordinates) {
      //@ts-ignore
      processCoordinates(geometry.coordinates, geometry.type);
    }
  }

  // Process GeoJSON
  if (geoJSON?.type === "FeatureCollection") {
    geoJSON?.features.forEach(processFeature);
  } else if (geoJSON?.type === "Feature") {
    //@ts-ignore
    processFeature(geoJSON);
  } else if ((geoJSON as any)?.coordinates) {
    processCoordinates((geoJSON as any)?.coordinates, geoJSON?.type);
  }

  return {
    lineVertices: new Float32Array(lineVertices),
  };
};

function mergeGeometries(geometries: THREE.BufferGeometry[]) {
  const merged = new THREE.BufferGeometry();
  let offset = 0;
  const positions: number[] = [];

  for (const g of geometries) {
    const pos = g.attributes.position.array as Float32Array;
    positions.push(...pos);
    offset += pos.length / 3;
  }

  merged.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  return merged;
}

export function geoPolygonToSphereGeometry(coords: number[][][], radius = 1) {
  const geometries: THREE.BufferGeometry[] = [];

  const polygons = Array.isArray(coords[0][0][0]) ? coords : [coords];

  for (const polygon of polygons) {
    const splitPolygonParts = splitAntimeridianPolygon(polygon as number[][][]);

    for (const part of splitPolygonParts) {
      const flat: number[] = [];
      const holes: number[] = [];
      let holeIndex = 0;

      for (let r = 0; r < part.length; r++) {
        const ring = part[r];
        if (r > 0) {
          holeIndex += part[r - 1].length;
          holes.push(holeIndex);
        }
        for (const [lon, lat] of ring) {
          flat.push(lon, lat);
        }
      }

      // Triangulate in lon/lat space
      const triangles = earcut(flat, holes, 2);

      // Project onto sphere
      const positions: number[] = [];
      for (const idx of triangles) {
        const lon = flat[idx * 2];
        const lat = flat[idx * 2 + 1];
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        positions.push(x, y, z);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geometries.push(geometry);
    }
  }

  return mergeGeometries(geometries);
}

/**
 * Split any polygon ring that crosses the antimeridian (±180° longitude).
 */
function splitAntimeridianPolygon(polygon: number[][][]) {
  const result: number[][][][] = [[]];

  for (const ring of polygon) {
    const normalizedRing = ring.map(([lon, lat]) => [normalizeLon(lon), lat]);
    if (crossesAntimeridian(normalizedRing)) {
      const [left, right] = splitRingAtAntimeridian(normalizedRing);
      result.push([left], [right]);
    } else {
      result[0].push(normalizedRing);
    }
  }

  return result;
}

function normalizeLon(lon: number) {
  return ((((lon + 180) % 360) + 360) % 360) - 180;
}

function crossesAntimeridian(ring: number[][]) {
  for (let i = 1; i < ring.length; i++) {
    if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) return true;
  }
  return false;
}

function splitRingAtAntimeridian(ring: number[][]) {
  const left: number[][] = [];
  const right: number[][] = [];

  for (let i = 0; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    if (lon >= 0) right.push([lon, lat]);
    else left.push([lon, lat]);
  }
  return [left, right];
}
