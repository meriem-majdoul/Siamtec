
import React from "react";
import { Text } from "react-native";
import { appVersion } from "../core/constants";
import * as theme from "../core/theme";

const AppVersion = ({ }) => {
    return <Text style={[theme.customFontMSregular.caption, { marginLeft: 15, color: theme.colors.gray400 }]}>App v{appVersion}</Text>
}

export default AppVersion