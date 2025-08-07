import * as d3 from "d3";
import * as THREE from "three";

/**
 * Convert GeoJSON using D3 projections to Three.js geometries
 */
class D3ToThreeConverter {
  constructor(options = {}) {
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
  createProjection(type) {
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
  createGeometryFromFeature(feature) {
    const geometryType = feature.geometry.type;

    switch (geometryType) {
      case "Polygon":
        return this.createPolygonGeometry(feature);
      case "MultiPolygon":
        return this.createMultiPolygonGeometry(feature);
      case "LineString":
        return this.createLineGeometry(feature);
      default:
        console.warn(`Unsupported geometry type: ${geometryType}`);
        return new THREE.BoxGeometry(0.01, 0.01, 0.01);
    }
  }

  /**
   * Create polygon geometry using D3 path data
   */
  createPolygonGeometry(feature) {
    const coordinates = feature.geometry.coordinates;
    const outerRing = coordinates[0];

    // Use D3 to project coordinates
    const projectedCoords = outerRing.map((coord) => {
      const projected = this.projection(coord);
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
          const projected = this.projection(coord);
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
  createMultiPolygonGeometry(feature) {
    const geometries = [];

    feature.geometry.coordinates.forEach((polygonCoords) => {
      // Create a temporary feature for each polygon
      const tempFeature = {
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
  createLineGeometry(feature) {
    const coordinates = feature.geometry.coordinates;

    const points = coordinates.map((coord) => {
      const projected = this.projection(coord);
      return new THREE.Vector3(
        projected[0] - this.width / 2,
        0,
        -(projected[1] - this.height / 2)
      );
    });

    return new THREE.BufferGeometry().setFromPoints(points);
  }

  /**
   * Merge multiple geometries into one
   */
  mergeGeometries(geometries) {
    if (geometries.length === 1) {
      return geometries[0];
    }

    // Convert to BufferGeometry if needed
    const bufferGeometries = geometries.map((geom) => {
      if (geom.isBufferGeometry) {
        return geom;
      }
      return new THREE.BufferGeometry().fromGeometry
        ? new THREE.BufferGeometry().fromGeometry(geom)
        : geom;
    });

    // Use BufferGeometryUtils if available, otherwise return first geometry
    if (THREE.BufferGeometryUtils) {
      return THREE.BufferGeometryUtils.mergeBufferGeometries(bufferGeometries);
    } else {
      console.warn(
        "BufferGeometryUtils not available, returning first geometry only"
      );
      return bufferGeometries[0];
    }
  }

  /**
   * Get bounding box using D3 (useful for camera positioning)
   */
  getFeatureBounds(feature) {
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
  fitToFeature(feature) {
    this.projection.fitSize([this.width, this.height], feature);
    return this;
  }

  /**
   * Batch convert multiple features
   */
  convertGeoJSON(geojson) {
    return geojson.features.map((feature) => ({
      feature,
      geometry: this.createGeometryFromFeature(feature),
      bounds: this.getFeatureBounds(feature),
    }));
  }
}

/**
 * Convenience function for your existing code
 */
const createGeometryFromFeature = (feature, options = {}) => {
  const converter = new D3ToThreeConverter(options);
  return converter.createGeometryFromFeature(feature);
};

// Export both the class and convenience function
export { createGeometryFromFeature, D3ToThreeConverter };
