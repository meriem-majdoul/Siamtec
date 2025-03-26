import { faInfoCircle } from "react-native-fontawesome";
import React, { memo, useEffect, useRef } from "react";
import { View, StyleSheet, Text, Alert, TextInput as NativeTextInput } from "react-native";
import { TextInput as Input } from "react-native-paper";
import { isTablet } from "../core/constants";
import * as theme from "../core/theme";
import CustomIcon from "./CustomIcon";

const TextInput = ({ errorText, disabled, whiteTheme, link, maxLength, right, ...props }) => {

  return (
    <View style={styles.container}>
      <Input
        style={[theme.customFontMSregular.body, styles.input]}
        selectionColor={whiteTheme ? '#fff' : theme.colors.primary}
        underlineColor={theme.colors.gray_extraLight}
        maxLength={maxLength}
        right={right}
        theme={
          {
            colors: {
              placeholder: theme.colors.secondary,
              text: (disabled && !props.editable) ? theme.colors.placeholder : link ? 'green' : theme.colors.gray_dark,
              error: theme.colors.error
            },
          }
        }

        {...props} />
      {errorText ? <Text style={[theme.customFontMSregular.caption, styles.error]}>{errorText}</Text> : null}
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 5,
    // marginBottom: 10,
    // backgroundColor: 'yellow'
  },
  input: {
    width: "100%",
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: theme.colors.gray_extraLight,
    textAlign: 'center',
    paddingHorizontal: 0,
    textAlign: 'auto',
    height: isTablet ? 85 : undefined,
    //    backgroundColor: 'pink'
    textAlignVertical: "center",
    paddingTop: 0,
    paddingBottom: 0

  },
  error: {
    // paddingHorizontal: 4,
    paddingTop: 4,
    color: theme.colors.error
  }
});

export default memo(TextInput);
