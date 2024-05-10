import { useEffect, useRef } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import ColorPicker, {
  Panel3,
  InputWidget,
  BrightnessSlider,
} from "reanimated-color-picker";
import PropTypes from "prop-types";

import MaterialIconsComponent from "./MaterialIconsComponent";
import SwatchesCustom from "./SwatchesCustom";
import { basicSwatches, defaultColor } from "../../constants/colors";
import { pressedStyle, scrollView } from "../../constants/styles";
import { deleteColor, insertColor } from "../../util/database";
import { Color } from "../../models/color";

export default function ModalColorPicker({
  showModal,
  setShowModal,
  customColors,
  setCustomColors,
  activeColor,
  setActiveColor,
}) {
  const pickerRef = useRef(null);
  const selectedColor = useSharedValue(activeColor.hex);

  const backgroundColorStyle = useAnimatedStyle(() => ({
    backgroundColor: selectedColor.value,
  }));

  useEffect(() => {
    selectedColor.value = activeColor.hex;
    pickerRef.current && pickerRef.current.setColor(activeColor.hex);
  }, [activeColor]);

  const onColorSelect = (color) => {
    "worklet";
    selectedColor.value = color.hex;
  };

  const handleAddColor = async () => {
    try {
      const res = await insertColor(selectedColor.value);
      const newColor = new Color(res.lastInsertRowId, selectedColor.value);
      setActiveColor(newColor);
      setCustomColors((prevColors) => [newColor, ...prevColors]);
    } catch (error) {
      console.log("Error insertColor:", error);
    }
  };

  const handleDeleteColor = () => {
    if (typeof activeColor.id === "number") {
      setCustomColors((prevColors) =>
        prevColors.filter((prevcolor) => activeColor.id !== prevcolor.id)
      );
      deleteColor(activeColor.id);
      setActiveColor(defaultColor);
    }
  };

  return (
    <Modal
      onRequestClose={() => setShowModal(false)}
      visible={showModal}
      animationType="slide"
    >
      <Animated.View style={[styles.container, backgroundColorStyle]}>
        <KeyboardAvoidingView behavior="position">
          <ScrollView>
            <View style={styles.pickerContainer}>
              <ColorPicker
                ref={pickerRef}
                value={selectedColor.value}
                sliderThickness={25}
                thumbSize={20}
                thumbShape="doubleTriangle"
                onChange={onColorSelect}
                adaptSpectrum
              >
                <InputWidget
                  inputStyle={styles.inputWidgetStyle}
                  iconColor="#707070"
                />
                <Panel3
                  style={styles.panelStyle}
                  verticalChannel="brightness"
                  thumbShape="ring"
                  thumbSize={30}
                />

                <BrightnessSlider
                  style={styles.sliderStyle}
                  thumbColor="#fff"
                />

                <View style={styles.previewTxtContainer}>
                  <Text style={[styles.text, styles.textHeader]}>
                    Basic Colors
                  </Text>
                  <View style={styles.swatchesContainer}>
                    <ScrollView horizontal={true} style={scrollView}>
                      <SwatchesCustom
                        colors={basicSwatches}
                        activeColor={activeColor}
                        setActiveColor={setActiveColor}
                      />
                    </ScrollView>
                  </View>

                  <Text style={[styles.text, styles.textHeader]}>
                    Custom Colors
                  </Text>
                  <View style={styles.swatchesContainer}>
                    <SwatchesCustom
                      colors={customColors}
                      activeColor={activeColor}
                      setActiveColor={setActiveColor}
                    />
                    <MaterialIconsComponent
                      onPress={handleDeleteColor}
                      containerStyle={styles.removeIcon}
                      icon={{
                        name: "highlight-remove",
                        size: 24,
                        color: "white",
                      }}
                    />
                  </View>

                  <View style={styles.buttonContainer}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.pressable,
                        pressed && pressedStyle,
                      ]}
                      onPress={() => setShowModal(false)}
                    >
                      <Text style={styles.text}>Close</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.pressable,
                        ,
                        pressed && pressedStyle,
                      ]}
                      onPress={handleAddColor}
                    >
                      <Text style={styles.text}>Add Color</Text>
                    </Pressable>
                  </View>
                </View>
              </ColorPicker>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

ModalColorPicker.propTypes = {
  showModal: PropTypes.bool,
  setShowModal: PropTypes.func,
  activeColor: PropTypes.object,
  setActiveColor: PropTypes.func,
  customColors: PropTypes.array,
  setCustomColors: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },
  pickerContainer: {
    alignSelf: "center",
    width: 320,
    backgroundColor: "#202124",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  panelStyle: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sliderStyle: {
    borderRadius: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputWidgetStyle: {
    color: "#fff",
    paddingVertical: 2,
    borderColor: "#707070",
    fontSize: 12,
    marginLeft: 5,
  },
  previewTxtContainer: {
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: "#bebdbe",
  },
  pressable: {
    alignSelf: "center",
    alignItems: "center",
    width: 133,
    backgroundColor: "#202124",
    marginTop: 10,
    padding: 10,
    borderRadius: 20,
    borderColor: "#707070",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  text: {
    color: "#fff",
  },
  textHeader: {
    marginBottom: 6,
  },
  swatchesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  removeIcon: {
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});