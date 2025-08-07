import {
  Canvas,
  Group,
  Matrix4,
  processTransform3d,
  Skia,
} from "@shopify/react-native-skia";
import * as d3 from "d3-geo";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import CountryPath from "./CountryPath";

interface GeoFeature {
  type: "Feature";
  properties: {
    NAME?: string;
    [key: string]: any;
  };
  geometry: GeoJSON.Geometry;
}

interface MapComponentProps {
  data: GeoJSON.GeoJSON;
  width?: number;
  height?: number;
  onCountrySelect: (countryName: string, feature: GeoFeature) => void;
}

const { width: screenW, height: screenH } = Dimensions.get("screen");

const MapComponent: React.FC<MapComponentProps> = ({
  data,
  width = screenW,
  height = screenH,
  onCountrySelect,
}) => {
  const [paths, setPaths] = useState<
    Array<{ path: string; feature: GeoFeature }>
  >([]);
  const selected = useSharedValue<string | null>(null);

  {
    /*d3 projectors:  geoMercator (initialul incercat, e bun pentru continent, nu prea e ok la tot globul); geoOrthographic (harta cu glob, asta vreau sa folosesc); geoEquirectangular(harta plata e ok pentru tot globul) */
  }

  useEffect(() => {
    const projection = d3.geoOrthographic().fitSize([width, height], data);
    const pathGenerator = d3.geoPath(projection);
    const features = (data as GeoJSON.FeatureCollection)
      .features as GeoFeature[];

    if (!features || features.length === 0) {
      console.log("No features");
      return;
    }

    const generatedPaths = features
      .map((feature) => {
        const pathString = pathGenerator(feature);
        return {
          path: pathString || "",
          feature,
        };
      })
      .filter((item) => item.path.length > 0);

    setPaths(generatedPaths);
  }, [data, width, height]);

  const skiaPaths = useMemo(() => {
    return paths.map(({ path, feature }) => ({
      skiaPath: Skia.Path.MakeFromSVGString(path)!,
      feature,
      countryName:
        feature.properties?.NAME ||
        feature.properties?.name ||
        `Country-${Math.random().toString(36).substring(2, 9)}`,
    }));
  }, [paths]);

  //gestures
  const currentPosition = useSharedValue({ x: 0, y: 0 });
  const previousPosition = useSharedValue({ x: 0, y: 0 });

  const currentRotation = useSharedValue(0);
  const previousRotation = useSharedValue(0);

  const currentScale = useSharedValue(1);
  const previousScale = useSharedValue(1);

  const MIN_SCALE = 1;
  const MAX_SCALE = 6;

  const matrix = useSharedValue(Matrix4());

  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const clamp = (value: number, min: number, max: number) => {
    "worklet";
    return Math.min(Math.max(value, min), max);
  };

  const getBounds = (currentScale: number) => {
    "worklet";
    const scaledWidth = width * currentScale;
    const scaledHeight = height * currentScale;
    const maxTranslateX = scaledWidth > width ? (scaledWidth - width) / 2 : 0;
    const maxTranslateY =
      scaledHeight > height ? (scaledHeight - height) / 2 : 0;
    return {
      minX: -maxTranslateX,
      maxX: maxTranslateX,
      minY: -maxTranslateY,
      maxY: maxTranslateY,
    };
  };

  const rotateGesture = Gesture.Rotation()
    .onChange((event) => {
      // currentRotation.value = event.rotation + previousRotation.value;
      rotateY.value += event.anchorY + 300;
    })
    .onEnd(() => {
      // previousRotation.value = currentRotation.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      previousScale.value = currentScale.value;
    })
    .onUpdate((event) => {
      const newScale = clamp(
        previousScale.value * event.scale,
        MIN_SCALE,
        MAX_SCALE
      );
      currentScale.value = newScale;
    })
    .onEnd(() => {
      previousScale.value = currentScale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const bounds = getBounds(currentScale.value);
      currentPosition.value = {
        x: clamp(
          event.translationX + previousPosition.value.x,
          bounds.minX,
          bounds.maxX
        ),
        y: clamp(
          event.translationY + previousPosition.value.y,
          bounds.minY,
          bounds.maxY
        ),
      };
    })
    .onEnd(() => {
      previousPosition.value = currentPosition.value;
    });

  const newMatrix = useDerivedValue(() => {
    return processTransform3d([
      { translateX: currentPosition.value.x },
      { translateY: currentPosition.value.y },
      { translateX: width / 2 },
      { translateY: height / 2 },
      { scale: currentScale.value },
      { rotateZ: currentRotation.value },
      { rotateY: rotateY.value },
      { translateX: -width / 2 },
      { translateY: -height / 2 },
    ]);
  });

  const tapGesture = Gesture.Tap().onStart((e) => {
    const { x, y } = e;

    console.log("pressed on :", "x:", x, "y:", y);

    for (const { skiaPath, countryName, feature } of skiaPaths) {
      if (skiaPath.contains(x, y)) {
        selected.value = countryName;
        runOnJS(onCountrySelect)(countryName, feature);
        return;
      }
    }
    selected.value = null;
  });

  useDerivedValue(() => {
    matrix.value = newMatrix.value;
  });

  // const composedGesture = Gesture.Simultaneous(
  //   Gesture.Race(pinchGesture, panGesture),

  //   tapGesture
  // );

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    tapGesture,
    rotateGesture
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Canvas style={{ width, height }}>
          <Group matrix={newMatrix}>
            {skiaPaths.map(({ skiaPath, countryName, feature }, index) => (
              <CountryPath
                key={index}
                skiaPath={skiaPath}
                countryName={countryName}
                selectedCountryName={selected}
                index={index}
                matrix={newMatrix}
                // transform={transform}
              />
            ))}
          </Group>
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  debugInfo: {
    marginTop: 8,
    padding: 4,
    backgroundColor: "#000",
    borderRadius: 4,
  },
  debugText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "monospace",
  },
});
export default MapComponent;
