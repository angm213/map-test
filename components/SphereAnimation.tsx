import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { THREE } from "expo-three";
import { useMemo, useRef, useState } from "react";
import data from "../assets/maps/world_small.geo.json";
import {
  createGeoJSONGeometry,
  geoPolygonToSphereGeometry,
} from "../helpers/jsonConversion";

const RotatingSphere = ({
  radius = 15,
  segments = 64,
}: {
  radius?: number;
  segments?: number;
}) => {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.5;
    }
  });
  const sphereGeometry = useMemo(
    () => new THREE.SphereGeometry(radius, segments, Math.floor(segments / 2)),
    [radius, segments]
  );

  // Create material for sphere and edges
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: "#282A4A",
    wireframe: false,
    transparent: true,
    opacity: 0.3,
  });
  const edgesGeometry = useMemo(
    () => new THREE.EdgesGeometry(sphereGeometry),
    [sphereGeometry]
  );
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: "red",
    transparent: true,
    opacity: 0.2,
  });

  // Create meshes
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);

  return (
    <>
      <primitive object={sphereMesh} />
      <primitive object={edgesMesh} />
    </>
  );
};

const Country = ({ coords }: { coords: THREE.BufferGeometry }) => {
  const [pressed, setPressed] = useState<boolean>(false);

  const material = new THREE.MeshBasicMaterial({
    color: pressed ? "orange" : "#B00B69",
    transparent: false,
    opacity: 0.7,
  });

  return (
    <mesh
      geometry={coords}
      material={material}
      onClick={(e) => {
        e.stopPropagation(); // so it doesn’t trigger parent clicks
        setPressed((prev) => !prev);
      }}
    />
  );
};

const Geometries = ({
  data,
  radius = 15,
}: {
  data: GeoJSON.FeatureCollection;
  radius?: number;
}) => {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.5;
    }
  });
  const countryGeometries = useMemo(() => {
    if (!data) return null;
    return createGeoJSONGeometry(data, radius, { fill: true });
  }, [data, radius]);

  if (!countryGeometries) return null;
  return (
    <group>
      {countryGeometries.lineVertices.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[countryGeometries.lineVertices, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={"orange"} linewidth={1} />
        </lineSegments>
      )}
      {data.features.map((feature, index) => {
        const geom = geoPolygonToSphereGeometry(
          //@ts-ignore
          feature.geometry.coordinates,
          radius
        );
        return <Country key={index} coords={geom} />;
      })}
    </group>
  );
};

const Sphere = () => {
  return (
    <Canvas camera={{ position: [0, 0, 40] }}>
      <OrbitControls
        minDistance={20}
        maxDistance={10000}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
        enablePan={false}
      />
      <group>
        <RotatingSphere />
        <Geometries data={data as GeoJSON.FeatureCollection} />
      </group>
    </Canvas>
  );
};

export default Sphere;
