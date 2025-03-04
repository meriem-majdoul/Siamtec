import React, { memo } from "react";
import { StyleSheet } from "react-native";
import { Button as PaperButton } from "react-native-paper";
import * as theme from "../core/theme";

const Button = ({ mode, style, children, outlinedColor = theme.colors.primary, ...props }) => (
  <PaperButton
    style={[
      styles.button,
      mode === "outlined" && { backgroundColor: theme.colors.surface },
      mode === "contained" && { backgroundColor: props.backgroundColor || theme.colors.primary },
      style
    ]}
    labelStyle={[
      styles.text,
      mode === "outlined" && { color: outlinedColor },
      mode === "contained" && { color: theme.colors.surface },
     // theme.customFontMSsemibold.body
    ]}
    theme={{ colors: { primary: theme.colors.secondary } }}

    mode={mode}
    {...props}
  >
    {children}
  </PaperButton>
);

const styles = StyleSheet.create({
  button: {
    width: "100%",
    marginVertical: 10
  },
  text: {
    fontWeight: "bold",
    fontSize: 15,
    lineHeight: 26
  }
});

export default memo(Button);
