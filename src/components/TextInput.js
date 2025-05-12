import React, { memo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput as Input } from "react-native-paper";
import * as theme from "../core/theme";

const TextInput = ({ errorText, disabled, whiteTheme, right, ...props }) => {
  return (
    <View style={styles.container}>
      <Input
        mode="outlined" // Ajoute une bordure
        style={[styles.input, whiteTheme && styles.whiteTheme]}
        selectionColor={theme.colors.primary}
        maxLength={props.maxLength}
        placeholderTextColor="#6C7278" // Gris clair pour le placeholder
        right={right}
        outlineColor="#EDF1F3" // Couleur de la bordure
        activeOutlineColor={theme.colors.primary} // Bordure active
        theme={{
          colors: {
            text: disabled ? "#A0A0A0" : "#000",
            error: theme.colors.error,
          },
        }}
        {...props}
      />
      {errorText ? (
        <Text style={[styles.error]}>{errorText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
  },
  input: {
    backgroundColor: "#F9F9F9", // Fond gris clair
    fontSize: 16,
    borderRadius: 8, // Coins arrondis
  },
  whiteTheme: {
    backgroundColor: "#FFFFFF", // Fond blanc si `whiteTheme` est activé
  },
  error: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 5,
  },
});

export default memo(TextInput);
