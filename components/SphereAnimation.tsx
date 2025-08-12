import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { THREE } from "expo-three";
import { useMemo, useRef, useState } from "react";
import data from "../assets/maps/world_small.geo.json";
import { createGeoJSONGeometry } from "../helpers/jsonConversion";

const RotatingSphere = ({
  radius = 15,
  segments = 24,
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
    transparent: false,
    opacity: 1,
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

const Country = ({
  lineVertices,
}: {
  lineVertices: Float64Array<ArrayBufferLike>;
}) => {
  const [pressed, setPressed] = useState<boolean>(false);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[lineVertices, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={pressed ? "orange" : "#B00B69"}
        linewidth={1}
        transparent
      />
    </lineSegments>
  );
};

const Geometries = ({
  data,
  radius = 15,
}: {
  data: GeoJSON.GeoJSON;
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
    return createGeoJSONGeometry(data, radius, {});
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
          <lineBasicMaterial color={"#B00B69"} linewidth={1} />
        </lineSegments>
      )}

      {/* Uncomment to render points */}
      {/* {countryGeometries.pointVertices.length > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[countryGeometries.pointVertices, 3]}
            />
          </bufferGeometry>
          <pointsMaterial color={"red"} size={1} />
        </points>
      )} */}

      {/* Uncomment to render filled polygons */}
      {/* {countryGeometries.polygonVertices.length > 0 && (
        <mesh>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[countryGeometries.polygonVertices, 3]}
            />
          </bufferGeometry>
          <meshBasicMaterial
            color={"#red"}
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>
      )} */}
      {/* {countryGeometries.lineVertices.map((geo, index) => (
        <Country key={index} lineVertices={geo} />
      ))} */}
    </group>
  );
};

const Sphere = () => {
  return (
    <Canvas camera={{ position: [0, 0, 40] }}>
      <group>
        <RotatingSphere />
        <Geometries data={data as GeoJSON.GeoJSON} />
      </group>
      <OrbitControls />
    </Canvas>
  );
};

export default Sphere;
