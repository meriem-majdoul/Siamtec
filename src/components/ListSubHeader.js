import React, { memo } from "react";
import { StyleSheet, View, Text } from "react-native";
import { List } from "react-native-paper";
import * as theme from "../core/theme";
import { constants } from '../core/constants'

const ListSubHeader = ({ right, children, style }) => (
  <View style={[styles.header, style]}>
    <List.Subheader style={[theme.customFontMSregular.caption, { color: theme.colors.gray_dark }]}>{children}</List.Subheader>
    {right}
  </View>
)

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: theme.padding,
    backgroundColor: theme.colors.background
  }
})

export default memo(ListSubHeader);