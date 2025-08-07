import { CountryPathProps } from "@/helpers/types";
import { Group, Path } from "@shopify/react-native-skia";
import React from "react";
import {
  interpolateColor,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

const CountryPath: React.FC<CountryPathProps> = ({
  skiaPath,
  countryName,
  selectedCountryName,
  index,
  matrix,
}) => {
  const isSelected = useDerivedValue(
    () => selectedCountryName.value === countryName
  );

  const animatedOpacity = useDerivedValue(() =>
    withTiming(isSelected.value ? 0.9 : 0.6, { duration: 200 })
  );

  const animatedColor = useDerivedValue(() =>
    interpolateColor(isSelected.value ? 1 : 0, [0, 1], ["#4682b4", "#ff6b6b"])
  );

  return (
    <Group matrix={matrix}>
      <Path
        path={skiaPath}
        style="fill"
        color={animatedColor}
        opacity={animatedOpacity}
      />
    </Group>
  );
};

export default CountryPath;
