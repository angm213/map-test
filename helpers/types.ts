import type { Matrix4, SkMatrix, SkRect } from "@shopify/react-native-skia";
import { SharedValue } from "react-native-reanimated";
import * as THREE from "three";

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

export interface D3ConverterOptions {
  width: number;
  height: number;
  extrudeHeight: number;
  projectionType: "orthographic" | "naturalEarth" | "mercator" | "albers";
}

export interface CountryData {
  name?: string;
  ISO_A3?: string;
  [key: string]: any;
}

export interface CountryFor3DMapProps {
  geometry: THREE.BufferGeometry;
  countryData: CountryData;
  onCountryClick: (countryData: CountryData) => void;
  isSelected: boolean;
}
