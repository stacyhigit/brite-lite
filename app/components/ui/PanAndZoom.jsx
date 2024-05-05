import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import PropTypes from "prop-types";

import { boxSize } from "../../constants/values";
import { useCallback, useState } from "react";

export default function PanAndZoom({
  columnCount,
  rowCount,
  setColor,
  children,
}) {
  const [currentBoxes, setCurrentBoxes] = useState([]);

  const boardWidth = boxSize.width * columnCount;
  const boardHeight = boxSize.height * rowCount;
  const boardWidthShared = useSharedValue(boardWidth);
  const boardHeightShared = useSharedValue(boardHeight);

  const scale = useSharedValue(1);
  const scaleOffset = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateXOffset = useSharedValue(0);
  const translateYOffset = useSharedValue(0);

  const originX = useSharedValue(0);
  const originY = useSharedValue(0);

  const handlePan = useCallback(({ x, y }) => {
    const targetColumn = Math.floor(x / boxSize.width);
    const targetRow = Math.floor(y / boxSize.height);

    return targetRow * columnCount + targetColumn;
  }, []);

  const singleTap = Gesture.Tap()
    .runOnJS(true)
    .onStart(({ x, y }) => {
      setColor(handlePan({ x, y }));
    });

  const pan = Gesture.Pan()
    .runOnJS(true)
    .maxPointers(1)
    .onStart(({ x, y }) => {
      const currentBox = handlePan({ x, y });
      setCurrentBoxes((prevBoxes) => [...prevBoxes, currentBox]);
      setColor(currentBox);
    })
    .onChange(({ x, y }) => {
      const currentBox = handlePan({ x, y });
      if (!currentBoxes.includes(currentBox)) {
        setCurrentBoxes((prevBoxes) => [...prevBoxes, currentBox]);
        setColor(currentBox);
      }
    })
    .onFinalize(() => {
      setCurrentBoxes([]);
    })
    .onTouchesCancelled(() => {
      setCurrentBoxes([]);
    })
    .shouldCancelWhenOutside(true);

  const pinchTransform = ({ toScale, fromScale, delta, origin, offset }) => {
    "worklet";
    const fromPinchX = -1 * (origin.x * fromScale - origin.x);
    const fromPinchY = -1 * (origin.y * fromScale - origin.y);
    const toPinchX = -1 * (origin.x * toScale - origin.x);
    const toPinchY = -1 * (origin.y * toScale - origin.y);

    const x = offset.x + toPinchX - fromPinchX + delta.x;
    const y = offset.y + toPinchY - fromPinchY + delta.y;
    return { x, y };
  };

  const clamp = (lowerBound, upperBound, value) => {
    "worklet";
    return Math.max(lowerBound, Math.min(value, upperBound));
  };

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      originX.value = e.focalX - boardWidthShared.value / 2;
      originY.value = e.focalY - boardHeightShared.value / 2;

      translateXOffset.value = translateX.value;
      translateYOffset.value = translateY.value;
      scaleOffset.value = scale.value;
    })
    .onUpdate((e) => {
      const toScale = e.scale * scaleOffset.value;
      const deltaX = e.focalX - boardWidthShared.value / 2 - originX.value;
      const deltaY = e.focalY - boardHeightShared.value / 2 - originY.value;

      const { x: toX, y: toY } = pinchTransform({
        toScale: toScale,
        fromScale: scaleOffset.value,
        origin: { x: originX.value, y: originY.value },
        offset: { x: translateXOffset.value, y: translateYOffset.value },
        delta: { x: deltaX, y: deltaY },
      });

      const boundX =
        Math.max(0, boardWidthShared.value * toScale - boardWidth) / 2;
      const boundY =
        Math.max(0, boardHeightShared.value * toScale - boardHeight) / 2;

      translateX.value = clamp(-1 * boundX, boundX, toX);
      translateY.value = clamp(-1 * boundY, boundY, toY);
      scale.value = clamp(0.7, toScale, 2.5);
    })
    .onEnd(() => {
      if (scale.value < 0.75) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    width: boardWidthShared.value,
    height: boardHeightShared.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={Gesture.Race(pinch, pan, singleTap)}>
        <Animated.View style={animatedStyle} resizeMethod={"scale"}>
          {children}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

PanAndZoom.propTypes = {
  children: PropTypes.object,
  columnCount: PropTypes.number,
  rowCount: PropTypes.number,
  setColor: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});