import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { TextInput as Input, ProgressBar } from "react-native-paper";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {faFilePdf,faClock} from '@fortawesome/free-solid-svg-icons';

import { setAttachmentIcon } from '../core/utils'
import * as theme from "../core/theme"

const UploadProgress = ({ attachment, onPress, showRightIcon = false, rightIcon, showProgress = true, pending = false, containerStyle, ...props }) => {

    const { name, color } = setAttachmentIcon(attachment.type || attachment.contentType)
    let readableSize = attachment.size / 1000
    readableSize = readableSize.toFixed(1)

    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, containerStyle]}>
            <View style={{ flex: 0.9, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 0.17, justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faFilePdf} size={24} color={color}/>
                </View>

                <View style={{ flex: showRightIcon ? 0.68 : 0.83, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View>
                        <Text numberOfLines={1} ellipsizeMode='middle' style={[theme.customFontMSmedium.body, { color: theme.colors.gray_dark }]}>{attachment.name}</Text>
                        <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.gray_dark }]}>{readableSize} KB</Text>
                    </View>

                    {pending &&
                        <View style={{ paddingRight: 15 }}>
                            <FontAwesomeIcon icon={faClock} size={18} color={'#000'}/>
                        </View>
                    }
                </View>

                {showRightIcon && rightIcon}
            </View>

            {showProgress &&
                <View style={{ flex: 0.1, justifyContent: 'flex-end' }}>
                    <ProgressBar progress={attachment.progress} color={theme.colors.primary} visible={true} />
                </View>
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.attachment,
        width: '100%',
        height: 64,
        alignSelf: 'center',
        borderRadius: 8,
        marginVertical: 8,
        ...theme.style.shadow
    },
})

export default UploadProgress


