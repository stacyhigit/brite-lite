import { StyleSheet, View } from "react-native";
import PropTypes from "prop-types";
import Svg, { Circle } from "react-native-svg";
import SvgDefs from "./ui/SvgDefs";
import { boxSize } from "../constants/values";

export default function BoxComponent({ box }) {
  return (
    <View style={styles.boxContainer}>
      {box.color.name === "empty" ? (
        <View style={styles.innerBoxEmpty} />
      ) : (
        <Svg height={boxSize.height} width={boxSize.width}>
          <SvgDefs />
          <Circle
            cx={boxSize.height / 2}
            cy={boxSize.height / 2}
            r={boxSize.height / 2 - 1}
            fill={`url(#${box.color.name})`}
          />
        </Svg>
      )}
    </View>
  );
}

BoxComponent.propTypes = {
  box: PropTypes.object,
};

const styles = StyleSheet.create({
  boxContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: boxSize.height,
    width: boxSize.width,
    backgroundColor: "black",
  },
  innerBoxEmpty: {
    height: 5,
    width: 5,
    backgroundColor: "#484848",
    borderRadius: boxSize.width,
  },
});
