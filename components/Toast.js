import React, { memo } from "react";
import { Snackbar } from "react-native-paper";
import { StyleSheet, View, Text } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import * as theme from "../core/theme";

const Toast = ({ type = "error", duration = 2000, containerStyle, message, onDismiss }) => {

  const setBackgroundColor = () => {
       if (type === 'error')
       return theme.colors.error

       else if (type === 'success')
       return theme.colors.success

       else if(type === 'info')
       return '#616161'
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Snackbar
        visible={!!message}
        duration={duration}
        onDismiss={onDismiss}
        style={{
          backgroundColor: setBackgroundColor(),
        }}
      >
        <Text style={styles.content}>{message}</Text>
      </Snackbar>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80 + getStatusBarHeight(),
    width: "100%",
    alignSelf: 'center'
  },
  content: {
    fontWeight: "500"
  }
});

export default memo(Toast);
