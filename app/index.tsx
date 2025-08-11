// import MapComponent from "@/components/MapComponent";
// import data from "../assets/maps/europe.geo.json";
import MapComponent3D from "@/components/3DMapComponent";
import { Text, View } from "react-native";
import data from "../assets/maps/world.geo.json";

// function Box(props) {
//   const meshRef = useRef(null);
//   const [hovered, setHover] = useState(false);
//   const [active, setActive] = useState(false);
//   useFrame((state, delta) => (meshRef.current.rotation.x += delta));
//   return (
//     <mesh
//       {...props}
//       ref={meshRef}
//       scale={active ? 1.5 : 1}
//       onClick={(event) => setActive(!active)}
//       onPointerOver={(event) => setHover(true)}
//       onPointerOut={(event) => setHover(false)}
//     >
//       <boxGeometry args={[1, 1, 1]} />
//       <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
//     </mesh>
//   );
// }

export default function Index() {
  const onSelect = (selected: string) => {
    console.log(selected);
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      {/* <MapComponent data={data as GeoJSON.GeoJSON} onCountrySelect={onSelect} /> */}
      <MapComponent3D data={data as GeoJSON.FeatureCollection} />
    </View>
    // <Canvas>
    //   <ambientLight intensity={Math.PI / 2} />
    //   <spotLight
    //     position={[10, 10, 10]}
    //     angle={0.15}
    //     penumbra={1}
    //     decay={0}
    //     intensity={Math.PI}
    //   />
    //   <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
    //   <Box position={[-1.2, 0, 0]} />
    //   <Box position={[1.2, 0, 0]} />
    //   <MapComponent3D data={data as GeoJSON.FeatureCollection} />
    // </Canvas>
  );
}
