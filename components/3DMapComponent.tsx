import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import CountryFor3DMap from "./CountryFor3DMap";

const MapComponent3D = ({ data }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleCountryClick = (countryData) => {
    setSelected(countryData);
    console.log("Selected:", countryData.name);
  };

  return (
    <Canvas camera={{ position: [0, 5, 10] }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />

      {data.features.map((feature, index) => (
        <CountryFor3DMap
          key={feature.properties.ISO_A3 || index}
          geometry={createGeometryFromFeature(feature)}
          countryData={feature.properties}
          onCountryClick={handleCountryClick}
        />
      ))}

      {/* Camera controls for pan/zoom */}
      {/* <OrbitControls enablePan={true} enableZoom={true} /> */}
    </Canvas>
  );
};
