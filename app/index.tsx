import MapComponent from "@/components/MapComponent";
import { Text, View } from "react-native";
// import data from "../assets/maps/europe.geo.json";
import data from "../assets/maps/world.geo.json";

export default function Index() {
  const onSelect = (selected: string) => {
    console.log(selected);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <MapComponent data={data as GeoJSON.GeoJSON} onCountrySelect={onSelect} />
    </View>
  );
}
