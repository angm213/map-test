import * as d3 from "d3";
import THREE from "./three-file";
import { D3ConverterOptions } from "./types";

/**
 * Convert GeoJSON using D3 projections to Three.js geometries
 */

class D3ToThreeConverter {
  width: number;
  height: number;
  extrudeHeight: number;
  projection: d3.GeoProjection;
  pathGenerator: d3.GeoPath;
  constructor(
    options: D3ConverterOptions = {
      width: 10,
      height: 10,
      extrudeHeight: 0.1,
      projectionType: "orthographic",
    }
  ) {
    this.width = options.width || 10;
    this.height = options.height || 10;
    this.extrudeHeight = options.extrudeHeight || 0.1;
    this.projection = this.createProjection(
      options.projectionType || "mercator"
    );
    this.pathGenerator = d3.geoPath().projection(this.projection);
  }

  /**
   * Create D3 projection (you can use any D3 projection here)
   */
  createProjection(
    type: "orthographic" | "naturalEarth" | "mercator" | "albers"
  ) {
    let projection;

    switch (type) {
      case "orthographic": // Globe-like
        projection = d3.geoOrthographic();
        break;
      case "naturalEarth": // Nice world map projection
        projection = d3.geoNaturalEarth1();
        break;
      case "mercator": // Standard web map projection
        projection = d3.geoMercator();
        break;
      case "albers": // Good for specific countries/regions
        projection = d3.geoAlbersUsa();
        break;
      default:
        projection = d3.geoMercator();
    }

    return projection
      .scale(this.width / 2 / Math.PI)
      .translate([this.width / 2, this.height / 2]);
  }

  /**
   * Convert a single GeoJSON feature to Three.js geometry using D3
   */
  createGeometryFromFeature(feature: GeoJSON.Feature): THREE.BufferGeometry {
    const geometryType = feature.geometry.type;

    switch (geometryType) {
      case "Polygon":
        return this.createPolygonGeometry(
          feature as GeoJSON.Feature<GeoJSON.Polygon>
        );
      case "MultiPolygon":
        return this.createMultiPolygonGeometry(
          feature as GeoJSON.Feature<GeoJSON.MultiPolygon>
        );
      case "LineString":
        return this.createLineGeometry(
          feature as GeoJSON.Feature<GeoJSON.LineString>
        );
      default:
        console.warn(`Unsupported geometry type: ${geometryType}`);
        return new THREE.BoxGeometry(0.01, 0.01, 0.01);
    }
  }

  /**
   * Create polygon geometry using D3 path data
   */
  createPolygonGeometry(
    feature: GeoJSON.Feature<GeoJSON.Polygon>
  ): THREE.ExtrudeGeometry {
    const coordinates = feature.geometry.coordinates;
    const outerRing = coordinates[0];

    // Use D3 to project coordinates
    const projectedCoords = outerRing.map((coord) => {
      const projected = this.projection(coord as [number, number]);
      if (!projected) {
        throw new Error(`Failed to project coordinate: ${coord}`);
      }
      // Convert D3 screen coordinates to Three.js world coordinates
      return [
        projected[0] - this.width / 2, // Center X
        0, // Y will be extrusion
        -(projected[1] - this.height / 2), // Center Z, flip Y
      ];
    });

    // Create THREE.Shape from projected coordinates
    const shape = new THREE.Shape();
    projectedCoords.forEach((coord, index) => {
      if (index === 0) {
        shape.moveTo(coord[0], coord[2]);
      } else {
        shape.lineTo(coord[0], coord[2]);
      }
    });

    // Handle holes (interior rings)
    if (coordinates.length > 1) {
      const holes = coordinates.slice(1).map((hole) => {
        const holePath = new THREE.Path();
        hole.forEach((coord, index) => {
          const projected = this.projection(coord as [number, number]);
          if (!projected) {
            throw new Error(`Failed to project hole coordinate: ${coord}`);
          }
          const x = projected[0] - this.width / 2;
          const z = -(projected[1] - this.height / 2);

          if (index === 0) {
            holePath.moveTo(x, z);
          } else {
            holePath.lineTo(x, z);
          }
        });
        return holePath;
      });
      shape.holes = holes;
    }

    // Create extruded geometry
    const extrudeSettings = {
      depth: this.extrudeHeight,
      bevelEnabled: false,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  /**
   * Handle MultiPolygon (countries with multiple parts/islands)
   */
  createMultiPolygonGeometry(
    feature: GeoJSON.Feature<GeoJSON.MultiPolygon>
  ): THREE.BufferGeometry {
    const geometries: THREE.ExtrudeGeometry[] = [];

    feature.geometry.coordinates.forEach((polygonCoords) => {
      // Create a temporary feature for each polygon
      const tempFeature: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: polygonCoords,
        },
        properties: feature.properties,
      };

      const geometry = this.createPolygonGeometry(tempFeature);
      geometries.push(geometry);
    });

    // Merge all geometries
    return this.mergeGeometries(geometries);
  }

  /**
   * Create line geometry for borders, rivers, etc.
   */
  createLineGeometry(
    feature: GeoJSON.Feature<GeoJSON.LineString>
  ): THREE.BufferGeometry {
    const coordinates = feature.geometry.coordinates;

    const points = coordinates.map((coord) => {
      const projected = this.projection(coord as [number, number]);
      if (!projected) {
        throw new Error(`Failed to project line coordinate: ${coord}`);
      }
      return new THREE.Vector3(
        projected[0] - this.width / 2,
        0,
        -(projected[1] - this.height / 2)
      );
    });

    return new THREE.BufferGeometry().setFromPoints(points);
  }

  mergeGeometries(geometries: THREE.ExtrudeGeometry[]): THREE.BufferGeometry {
    if (geometries.length === 1) {
      return geometries[0];
    }

    // Convert all to BufferGeometry
    const bufferGeometries = geometries.map((geom) => {
      // ExtrudeGeometry extends BufferGeometry in newer Three.js versions
      return geom as THREE.BufferGeometry;
    });

    // Simple merge by creating a new geometry and copying attributes
    const mergedGeometry = new THREE.BufferGeometry();

    // Calculate total vertex count
    let totalVertices = 0;
    let totalIndices = 0;

    bufferGeometries.forEach((geom) => {
      const positionAttr = geom.getAttribute("position");
      const indexAttr = geom.getIndex();
      if (positionAttr) totalVertices += positionAttr.count;
      if (indexAttr) totalIndices += indexAttr.count;
    });

    // Create merged arrays
    const positions = new Float32Array(totalVertices * 3);
    const indices = new Uint32Array(totalIndices);

    let vertexOffset = 0;
    let indexOffset = 0;
    let vertexCount = 0;

    bufferGeometries.forEach((geom) => {
      const positionAttr = geom.getAttribute("position");
      const indexAttr = geom.getIndex();

      if (positionAttr) {
        positions.set(positionAttr.array as Float32Array, vertexOffset);
        vertexOffset += positionAttr.array.length;
      }

      if (indexAttr) {
        // Adjust indices for vertex offset
        const adjustedIndices = Array.from(indexAttr.array).map(
          (idx) => idx + vertexCount
        );
        indices.set(adjustedIndices, indexOffset);
        indexOffset += indexAttr.count;
      }

      if (positionAttr) {
        vertexCount += positionAttr.count;
      }
    });

    mergedGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    mergedGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    mergedGeometry.computeVertexNormals();

    return mergedGeometry;
  }

  /**
   * Get bounding box using D3 (useful for camera positioning)
   */
  getFeatureBounds(
    feature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>
  ) {
    const bounds = d3.geoBounds(feature);
    return {
      minLon: bounds[0][0],
      minLat: bounds[0][1],
      maxLon: bounds[1][0],
      maxLat: bounds[1][1],
    };
  }

  /**
   * Fit projection to feature bounds
   */
  fitToFeature(
    feature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>
  ) {
    this.projection.fitSize([this.width, this.height], feature);
    return this;
  }

  /**
   * Batch convert multiple features
   */
  convertGeoJSON(geojson: GeoJSON.FeatureCollection) {
    return geojson.features.map((feature: GeoJSON.Feature) => ({
      feature,
      geometry: this.createGeometryFromFeature(
        feature as GeoJSON.Feature<
          GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.LineString
        >
      ),
      bounds: this.getFeatureBounds(
        feature as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>
      ),
    }));
  }
}

/**
 * Convenience function for your existing code
 */
const createGeometryFromFeature = (
  feature: GeoJSON.Feature<
    GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.LineString
  >,
  options?: D3ConverterOptions
): THREE.BufferGeometry => {
  const converter = new D3ToThreeConverter(options);
  return converter.createGeometryFromFeature(feature);
};

// Export both the class and convenience function
export { createGeometryFromFeature, D3ToThreeConverter, THREE };
