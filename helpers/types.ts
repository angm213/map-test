import type { Matrix4, SkMatrix, SkRect } from "@shopify/react-native-skia";
import { SharedValue } from "react-native-reanimated";

export interface CountryPathProps {
  skiaPath: any;
  countryName: string;
  selectedCountryName: SharedValue<string | null>;
  index: number;
  matrix: SkMatrix | SharedValue<Matrix4>;
  //   translateX: any;
  //   translateY: any;
  //   scale: any;
  //   transform: any;
}

interface GestureHandlerProps {
  matrix: any;
  dimensions: SkRect;
  debug?: boolean;
}
