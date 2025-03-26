
import React, { memo } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { TextInput as NativeTextInput } from 'react-native';
import { TextInput as Input } from "react-native-paper";
import * as theme from "../core/theme";
import { constants } from "../core/constants";
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import NumberFormat from 'react-number-format';

const TurnoverGoal = ({ goal, index, onPress, isList = true, style, ...props }) => {

    let { current, target, month, year } = goal

    const progress = (current / target) * 100
    const targetReached = progress >= 100
    const currentLow = progress < 33
    const tintColor = targetReached ? theme.colors.primary : currentLow ? '#F5276D' : 'orange'
    const isFirstColumn = (index + 1) % 3 === 0
    const textColor = goal.isCurrent ? theme.colors.primary : theme.colors.secondary
    const size = constants.ScreenWidth * 0.26

    return (
        <TouchableOpacity style={[{ width: size, marginBottom: 17, marginLeft: !isList ? 0 : isFirstColumn ? 0 : constants.ScreenWidth * 0.06 }, style]} onPress={() => onPress(goal, index)}>
            <AnimatedCircularProgress
                size={size}
                width={5}
                fill={progress}
                tintColor={tintColor}
                //onAnimationComplete={() => console.log('onAnimationComplete')}
                arcSweepAngle={270}
                rotation={227}
                backgroundColor={theme.colors.gray_light}
                style={{ alignSelf: 'center' }}>
                {(fill) => (
                        <View style={{ justifyContent: 'center' }}>
                            <NumberFormat
                                value={current}
                                displayType={'text'}
                                thousandSeparator={true}
                                //suffix={'€'}
                                renderText={value => <Text style={[theme.customFontMSsemibold.body, { color: tintColor, textAlign: "center" }]}>{value}</Text>}
                            />

                            <NumberFormat
                                value={target}
                                displayType={'text'}
                                thousandSeparator={true}
                                //suffix={'€'}
                                renderText={value => <Text style={[theme.customFontMSmedium.caption, { textAlign: 'center', color: theme.colors.gray_dark }]}>sur {value}</Text>}
                            />

                            <Text style={[theme.customFontMSregular.caption, { color: theme.colors.gray_medium, textAlign: "center", marginTop: size * 0.05 }]}>
                                {parseInt(fill)}%
                            </Text>
                        </View>
                )}
            </AnimatedCircularProgress>

            <Text style={[theme.customFontMSmedium.caption, { textAlign: 'center', color: textColor }]}>{month} {year}</Text>

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({

})

export default memo(TurnoverGoal);
