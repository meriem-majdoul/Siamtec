import React from "react";
import { Text } from "react-native";
import * as theme from "../../core/theme";

const { title, header, body, caption } = theme.customFontMSregular

const Caption = ({ style, children }) => (
    <Text style={[caption, style]}>
        {children}
    </Text>
)

const Body = ({ style, children }) => (
    <Text style={[body, style]}>
        {children}
    </Text>
)

const Header = ({ style, children }) => (
    <Text style={[header, style]}>
        {children}
    </Text>
)

const Title = ({ style, children }) => (
    <Text style={[title, style]}>
        {children}
    </Text>
)


export { Title, Header, Body, Caption }