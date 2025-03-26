import React, { memo } from "react";
import { View, ImageBackground, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
// import { SvgXml } from 'react-native-svg';

import { constants } from '../core/constants'
import * as theme from '../core/theme'

const NewBackground = ({ children, style, motifStyle, showMotif = true }) => {

    const motif = `
    <svg width="440" height="229.192" viewBox="0 0 440 229.192">
    <g id="Groupe_125" data-name="Groupe 125" transform="translate(60 -601)">
      <path id="Tracé_19" data-name="Tracé 19" d="M786.6,454.772c11.576,4.1,24.808,4.516,39.026,2.731.159-.019,1.037-7.7,1.171-8.453q.745-4.125,1.839-8.176a79.538,79.538,0,0,1,5.658-14.879,64.22,64.22,0,0,1,19.387-23.04c9.016-6.563,19.6-10.528,30.448-12.524,16.132-2.966,32.471-.3,48.735-1.168,12.807-.681,25.773-2.664,37.755-7.489A65.808,65.808,0,0,0,988.434,371.3c-46.665,93.082-123.525,142.888-157.448,100.376,27.437-4.882,51.9-16.722,73.531-35.166-54.6,29.44-99.248,38.416-134.155,27.356a.841.841,0,0,1-.334-1.388C772.466,460.087,778.044,457.519,786.6,454.772Z" transform="matrix(0.766, -0.643, 0.643, 0.766, -888.353, 951.924)" fill="#eaf7f1"/>
      <g id="Groupe_120" data-name="Groupe 120" transform="translate(283 661)">
        <ellipse id="Ellipse_5" data-name="Ellipse 5" cx="42" cy="42" rx="42" ry="42" transform="translate(0 21)" fill="#bae2d0" opacity="0.2" style="mix-blend-mode: multiply;isolation: isolate"/>
        <ellipse id="Ellipse_3" data-name="Ellipse 3" cx="27.5" cy="27" rx="27.5" ry="27" transform="translate(42 0)" fill="#bbe3d1" opacity="0.3" style="mix-blend-mode: multiply;isolation: isolate"/>
        <ellipse id="Ellipse_4" data-name="Ellipse 4" cx="42" cy="42" rx="42" ry="42" transform="translate(13 67)" fill="#bbe3d1" opacity="0.3" style="mix-blend-mode: multiply;isolation: isolate"/>
      </g>
    </g>
    </svg>
   `

    return (
        <View style={[styles.background]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                {children}
                {/* {showMotif && <SvgXml xml={motif} style={[styles.motifStyle, motifStyle]} />} */}
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: '100%',
        position: 'absolute',
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
    },
    motifStyle: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        zIndex: 0,
        marginLeft: -55,
        marginBottom: -18
    }
})

export default memo(NewBackground);
