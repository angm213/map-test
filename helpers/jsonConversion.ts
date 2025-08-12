// export function drawThreeGeo(json, radius, shape, materalOptions, container) {
//   container = container || window.scene;

import { THREE } from "expo-three";

//   var x_values = [];
//   var y_values = [];
//   var z_values = [];

//   var json_geom = createGeometryArray(json);
//   //An array to hold the feature geometries.
//   var convertCoordinates = getConversionFunctionName(shape);
//   //Whether you want to convert to spherical or planar coordinates.
//   var coordinate_array = [];
//   //Re-usable array to hold coordinate values. This is necessary so that you can add
//   //interpolated coordinates. Otherwise, lines go through the sphere instead of wrapping around.

//   for (var geom_num = 0; geom_num < json_geom.length; geom_num++) {
//     if (json_geom[geom_num].type == "Point") {
//       convertCoordinates(json_geom[geom_num].coordinates, radius);
//       drawParticle(x_values[0], y_values[0], z_values[0], materalOptions);
//     } else if (json_geom[geom_num].type == "MultiPoint") {
//       for (
//         var point_num = 0;
//         point_num < json_geom[geom_num].coordinates.length;
//         point_num++
//       ) {
//         convertCoordinates(json_geom[geom_num].coordinates[point_num], radius);
//         drawParticle(x_values[0], y_values[0], z_values[0], materalOptions);
//       }
//     } else if (json_geom[geom_num].type == "LineString") {
//       coordinate_array = createCoordinateArray(json_geom[geom_num].coordinates);

//       for (
//         var point_num = 0;
//         point_num < coordinate_array.length;
//         point_num++
//       ) {
//         convertCoordinates(coordinate_array[point_num], radius);
//       }
//       drawLine(x_values, y_values, z_values, materalOptions);
//     } else if (json_geom[geom_num].type == "Polygon") {
//       for (
//         var segment_num = 0;
//         segment_num < json_geom[geom_num].coordinates.length;
//         segment_num++
//       ) {
//         coordinate_array = createCoordinateArray(
//           json_geom[geom_num].coordinates[segment_num]
//         );

//         for (
//           var point_num = 0;
//           point_num < coordinate_array.length;
//           point_num++
//         ) {
//           convertCoordinates(coordinate_array[point_num], radius);
//         }
//         drawLine(x_values, y_values, z_values, materalOptions);
//       }
//     } else if (json_geom[geom_num].type == "MultiLineString") {
//       for (
//         var segment_num = 0;
//         segment_num < json_geom[geom_num].coordinates.length;
//         segment_num++
//       ) {
//         coordinate_array = createCoordinateArray(
//           json_geom[geom_num].coordinates[segment_num]
//         );

//         for (
//           var point_num = 0;
//           point_num < coordinate_array.length;
//           point_num++
//         ) {
//           convertCoordinates(coordinate_array[point_num], radius);
//         }
//         drawLine(x_values, y_values, z_values, materalOptions);
//       }
//     } else if (json_geom[geom_num].type == "MultiPolygon") {
//       for (
//         var polygon_num = 0;
//         polygon_num < json_geom[geom_num].coordinates.length;
//         polygon_num++
//       ) {
//         for (
//           var segment_num = 0;
//           segment_num < json_geom[geom_num].coordinates[polygon_num].length;
//           segment_num++
//         ) {
//           coordinate_array = createCoordinateArray(
//             json_geom[geom_num].coordinates[polygon_num][segment_num]
//           );

//           for (
//             var point_num = 0;
//             point_num < coordinate_array.length;
//             point_num++
//           ) {
//             convertCoordinates(coordinate_array[point_num], radius);
//           }
//           drawLine(x_values, y_values, z_values, materalOptions);
//         }
//       }
//     } else {
//       throw new Error("The geoJSON is not valid.");
//     }
//   }

//   function createGeometryArray(json) {
//     var geometry_array = [];

//     if (json.type == "Feature") {
//       geometry_array.push(json.geometry);
//     } else if (json.type == "FeatureCollection") {
//       for (
//         var feature_num = 0;
//         feature_num < json.features.length;
//         feature_num++
//       ) {
//         geometry_array.push(json.features[feature_num].geometry);
//       }
//     } else if (json.type == "GeometryCollection") {
//       for (var geom_num = 0; geom_num < json.geometries.length; geom_num++) {
//         geometry_array.push(json.geometries[geom_num]);
//       }
//     } else {
//       throw new Error("The geoJSON is not valid.");
//     }
//     //alert(geometry_array.length);
//     return geometry_array;
//   }

//   function getConversionFunctionName(shape) {
//     var conversionFunctionName;

//     if (shape == "sphere") {
//       conversionFunctionName = convertToSphereCoords;
//     } else if (shape == "plane") {
//       conversionFunctionName = convertToPlaneCoords;
//     } else {
//       throw new Error("The shape that you specified is not valid.");
//     }
//     return conversionFunctionName;
//   }

//   function createCoordinateArray(feature) {
//     //Loop through the coordinates and figure out if the points need interpolation.
//     var temp_array = [];
//     var interpolation_array = [];

//     for (var point_num = 0; point_num < feature.length; point_num++) {
//       var point1 = feature[point_num];
//       var point2 = feature[point_num - 1];

//       if (point_num > 0) {
//         if (needsInterpolation(point2, point1)) {
//           interpolation_array = [point2, point1];
//           interpolation_array = interpolatePoints(interpolation_array);

//           for (
//             var inter_point_num = 0;
//             inter_point_num < interpolation_array.length;
//             inter_point_num++
//           ) {
//             temp_array.push(interpolation_array[inter_point_num]);
//           }
//         } else {
//           temp_array.push(point1);
//         }
//       } else {
//         temp_array.push(point1);
//       }
//     }
//     return temp_array;
//   }

//   function needsInterpolation(point2, point1) {
//     //If the distance between two latitude and longitude values is
//     //greater than five degrees, return true.
//     var lon1 = point1[0];
//     var lat1 = point1[1];
//     var lon2 = point2[0];
//     var lat2 = point2[1];
//     var lon_distance = Math.abs(lon1 - lon2);
//     var lat_distance = Math.abs(lat1 - lat2);

//     if (lon_distance > 5 || lat_distance > 5) {
//       return true;
//     } else {
//       return false;
//     }
//   }

//   function interpolatePoints(interpolation_array) {
//     //This function is recursive. It will continue to add midpoints to the
//     //interpolation array until needsInterpolation() returns false.
//     var temp_array = [];
//     var point1, point2;

//     for (
//       var point_num = 0;
//       point_num < interpolation_array.length - 1;
//       point_num++
//     ) {
//       point1 = interpolation_array[point_num];
//       point2 = interpolation_array[point_num + 1];

//       if (needsInterpolation(point2, point1)) {
//         temp_array.push(point1);
//         temp_array.push(getMidpoint(point1, point2));
//       } else {
//         temp_array.push(point1);
//       }
//     }

//     temp_array.push(interpolation_array[interpolation_array.length - 1]);

//     if (temp_array.length > interpolation_array.length) {
//       temp_array = interpolatePoints(temp_array);
//     } else {
//       return temp_array;
//     }
//     return temp_array;
//   }

//   function getMidpoint(point1, point2) {
//     var midpoint_lon = (point1[0] + point2[0]) / 2;
//     var midpoint_lat = (point1[1] + point2[1]) / 2;
//     var midpoint = [midpoint_lon, midpoint_lat];

//     return midpoint;
//   }

//   function convertToSphereCoords(coordinates_array, sphere_radius) {
//     var lon = coordinates_array[0];
//     var lat = coordinates_array[1];

//     x_values.push(
//       Math.cos((lat * Math.PI) / 180) *
//         Math.cos((lon * Math.PI) / 180) *
//         sphere_radius
//     );
//     y_values.push(
//       Math.cos((lat * Math.PI) / 180) *
//         Math.sin((lon * Math.PI) / 180) *
//         sphere_radius
//     );
//     z_values.push(Math.sin((lat * Math.PI) / 180) * sphere_radius);
//   }

//   function convertToPlaneCoords(coordinates_array, radius) {
//     var lon = coordinates_array[0];
//     var lat = coordinates_array[1];

//     z_values.push((lat / 180) * radius);
//     y_values.push((lon / 180) * radius);
//   }

//   function drawParticle(x, y, z, options) {
//     var particle_geom = new THREE.Geometry();
//     particle_geom.vertices.push(new THREE.Vector3(x, y, z));

//     var particle_material = new THREE.ParticleSystemMaterial(options);

//     var particle = new THREE.ParticleSystem(particle_geom, particle_material);
//     container.add(particle);

//     clearArrays();
//   }

//   function drawLine(x_values, y_values, z_values, options) {
//     var line_geom = new THREE.Geometry();
//     createVertexForEachPoint(line_geom, x_values, y_values, z_values);

//     var line_material = new THREE.LineBasicMaterial(options);
//     var line = new THREE.Line(line_geom, line_material);
//     container.add(line);

//     clearArrays();
//   }

//   function createVertexForEachPoint(
//     object_geometry,
//     values_axis1,
//     values_axis2,
//     values_axis3
//   ) {
//     for (var i = 0; i < values_axis1.length; i++) {
//       object_geometry.vertices.push(
//         new THREE.Vector3(values_axis1[i], values_axis2[i], values_axis3[i])
//       );
//     }
//   }

//   function clearArrays() {
//     x_values.length = 0;
//     y_values.length = 0;
//     z_values.length = 0;
//   }
// }

function geoToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}
export function createGeoJSONGeometry(geoJSON, radius = 1, options = {}) {
  const lineVertices = [];
  const pointVertices = [];
  const polygonVertices = [];

  function processCoordinates(coordinates, type) {
    switch (type) {
      case "Point":
        const point = geoToVector3(coordinates[1], coordinates[0], radius);
        pointVertices.push(point.x, point.y, point.z);
        break;

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
        // Process outer ring
        const ring = coordinates[0];
        for (let i = 0; i < ring.length - 1; i++) {
          const start = geoToVector3(ring[i][1], ring[i][0], radius);
          const end = geoToVector3(ring[i + 1][1], ring[i + 1][0], radius);
          lineVertices.push(start.x, start.y, start.z, end.x, end.y, end.z);
        }

        // For filled polygons, triangulate (simplified version)
        if (options.fill && ring.length >= 3) {
          const center = ring.reduce(
            (acc, coord) => {
              const point = geoToVector3(coord[1], coord[0], radius);
              return {
                x: acc.x + point.x / ring.length,
                y: acc.y + point.y / ring.length,
                z: acc.z + point.z / ring.length,
              };
            },
            { x: 0, y: 0, z: 0 }
          );

          for (let i = 0; i < ring.length - 1; i++) {
            const p1 = geoToVector3(ring[i][1], ring[i][0], radius);
            const p2 = geoToVector3(ring[i + 1][1], ring[i + 1][0], radius);

            polygonVertices.push(
              center.x,
              center.y,
              center.z,
              p1.x,
              p1.y,
              p1.z,
              p2.x,
              p2.y,
              p2.z
            );
          }
        }
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

  function processFeature(feature) {
    const { geometry } = feature;
    if (geometry && geometry.coordinates) {
      processCoordinates(geometry.coordinates, geometry.type);
    }
  }

  // Process GeoJSON
  if (geoJSON.type === "FeatureCollection") {
    geoJSON.features.forEach(processFeature);
  } else if (geoJSON.type === "Feature") {
    processFeature(geoJSON);
  } else if (geoJSON.coordinates) {
    processCoordinates(geoJSON.coordinates, geoJSON.type);
  }

  return {
    lineVertices: new Float32Array(lineVertices),
    pointVertices: new Float32Array(pointVertices),
    polygonVertices: new Float32Array(polygonVertices),
  };
}
