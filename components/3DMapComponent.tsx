import { D3ToThreeConverter } from "@/helpers/createGeometry";
// import { CountryData, CountryFor3DMapProps } from "@/helpers/types";
import THREE from "@/helpers/three-file";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { Dimensions } from "react-native";
// import CountryFor3DMap from "./CountryFor3DMap";

const { width, height } = Dimensions.get("screen");

const MapComponent3D = ({ data }: { data: GeoJSON.FeatureCollection }) => {
  const onContextCreate = async (gl: any) => {
    console.log(gl);

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#d5d2ff");
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 10, 5);
    scene.add(dirLight);

    const converter = new D3ToThreeConverter({
      width: width,
      height: height,
      extrudeHeight: 0.1,
      projectionType: "orthographic",
    });

    data.features.forEach((feature) => {
      const geometry = converter.createGeometryFromFeature(
        feature as GeoJSON.Feature<
          GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.LineString
        >
      );
      if (!geometry) return;

      const material = new THREE.MeshStandardMaterial({
        color: "#282A4A",
        metalness: 0.1,
        roughness: 0.8,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = feature.properties || {};
      scene.add(mesh);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  return (
    <GLView
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: width,
        height: height,
      }}
      onContextCreate={onContextCreate}
    />
  );
};

export default MapComponent3D;
