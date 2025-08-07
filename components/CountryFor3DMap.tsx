import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Text } from "react-native";

const CountryFor3DMap = ({ geometry, countryData, onCountryClick }) => {
  const [selected, setSelected] = useState<boolean>(false);
  const [hovered, setHover] = useState<boolean>(false);
  const meshRef = useRef(null);

  const handleClick = () => {
    setSelected((prev) => !prev);
    onCountryClick(countryData);
  };

  useFrame((state, delta) => (meshRef.current.rotation.x += delta));

  return (
    <mesh
      geometry={geometry}
      onClick={handleClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      position={[0, selected ? 0.1 : 0, 0]} // Elevate when selected
    >
      <meshStandardMaterial
        color={selected ? "#ff6b6b" : hovered ? "#4ecdc4" : "#95e1d3"}
        transparent
        opacity={hovered ? 0.8 : 0.6}
      />
      {hovered && (
        <Text
        //   position={[0, 1, 0]}
        //   fontSize={0.5}
        //   color="white"
        //   anchorX="center"
        //   anchorY="middle"
        >
          {countryData.name}
        </Text>
      )}
    </mesh>
  );
};

export default CountryFor3DMap;
