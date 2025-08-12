import { CountryFor3DMapProps } from "@/helpers/types";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

const CountryFor3DMap: React.FC<CountryFor3DMapProps> = ({
  geometry,
  countryData,
  onCountryClick,
  isSelected,
}) => {
  const [hovered, setHover] = useState<boolean>(false);
  const meshRef = useRef<any>(null);

  const handleClick = (event: any) => {
    event.stopPropagation();
    onCountryClick(countryData);
  };

  useFrame((state, delta) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHover(false);
        document.body.style.cursor = "auto";
      }}
      position={[0, isSelected ? 2 : 0, 0]} // Elevate when selected
    >
      <meshStandardMaterial
        color={isSelected ? "#ff6b6b" : hovered ? "#4ecdc4" : "#95e1d3"}
        opacity={hovered ? 0.9 : 0.7}
        roughness={0.5}
        metalness={0.2}
      />
    </mesh>
  );
};

export default CountryFor3DMap;
