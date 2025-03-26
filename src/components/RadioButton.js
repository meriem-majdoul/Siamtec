import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RadioButton as MyRadioButton } from 'react-native-paper';
import { constants } from '../core/constants';
import * as theme from '../core/theme';

const RadioButton = ({ firstChoice, secondChoice, checked, onPress1, onPress2, textRight = false, isRow = true, style, ...props }) => {
    // const [checked, setChecked] = React.useState('first');

    const firstTitle = () => <Text style={theme.customFontMSregular.body} onPress={onPress1}>{firstChoice.title}</Text>
    const secondTitle = () => <Text style={theme.customFontMSregular.body} onPress={onPress2}>{secondChoice.title}</Text>
    
    return (
        <View style={[isRow ? styles.container : {}, style]}>
            <View style={[styles.row, isRow ? { marginRight: constants.ScreenWidth * 0.025 } : {}]}>
                {!textRight && firstTitle()}
                <MyRadioButton.Android
                    value={firstChoice.value}
                    status={checked === 'first' ? 'checked' : 'unchecked'}
                    onPress={onPress1}
                    color={theme.colors.primary} />
                {textRight && firstTitle()}
            </View>

            <View style={[styles.row, isRow ? { justifyContent: 'flex-end' } : {}]}>
                {!textRight && secondTitle()}
                <MyRadioButton.Android
                    value={secondChoice.title}
                    status={checked === 'second' ? 'checked' : 'unchecked'}
                    onPress={onPress2}
                    color={theme.colors.primary} />
                {textRight && secondTitle()}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        //marginVertical: 5
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
})


export default RadioButton;