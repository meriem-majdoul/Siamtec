import React, { memo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput as NativeTextInput } from 'react-native';
import { TextInput as Input } from "react-native-paper";
import * as theme from "../core/theme";

const TextInput = ({ errorText, style, disabled, whiteTheme, link, ...props }) => (
  <View style={styles.container}>
    <Input
      style={[theme.fonts.input, styles.input, style]}
      //fontFamily ={"Montserrat-Regular"}
      selectionColor={whiteTheme ? '#fff' : theme.colors.primary}
      underlineColor="transparent"
      direction='rtl'
      theme={whiteTheme ?
        {
          colors: { primary: '#fff', text: (disabled && props.editable === false) ? theme.colors.placeholder : '#fff', placeholder: '#fff' }
        }
        :
        {
          colors: { primary: theme.colors.primary, text: (disabled && props.editable === false) ? theme.colors.placeholder : link ? 'green' : '#000' }
        }}

      {...props} />
    {errorText ? <Text style={[theme.customFontMSregular.caption, styles.error]}>{errorText}</Text> : null}
  </View>
)

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 5
  },
  input: {
    width: "100%",
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 0.25,
    borderBottomColor: '#C7C7CD',
    textAlign: 'center',
    paddingHorizontal: 0,
  },
  error: {
    paddingHorizontal: 4,
    paddingTop: 4,
    color: theme.colors.error
  }
});

export default memo(TextInput);
