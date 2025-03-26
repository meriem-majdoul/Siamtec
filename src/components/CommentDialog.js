import React, { useState } from "react";
import { StyleSheet, ActivityIndicator, Keyboard, TouchableOpacity } from "react-native"
import Dialog from 'react-native-dialog'
import * as theme from "../core/theme";

const CommentDialog = ({
    title,
    description,
    keyboardType = "default",
    onSubmit,
    isVisible,
    onCancel,
    loading,
}) => {

    const [comment, setComment] = useState('')
    const clearComment = () => setComment('')
    const titleContent = loading ? "Traitement en cours..." : title

    return (
        <Dialog.Container
            visible={isVisible}
            onBackdropPress={() => Keyboard.dismiss()}
        >
            <Dialog.Title style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>{titleContent}</Dialog.Title>
            {loading &&
                <ActivityIndicator color={theme.colors.primary} size='small' />
            }
            {!loading &&
                <Dialog.Input
                    label={description}
                    returnKeyType="done"
                    value={comment}
                    onChangeText={comment => setComment(comment)}
                    autoFocus={isVisible}
                    multiline={true}
                    numberOfLines={4}
                    keyboardType={keyboardType}
                    style={{ color: theme.colors.gray_dark }}
                />
            }
            {!loading &&
                <Dialog.Button
                    label="Annuler"
                    onPress={onCancel}
                    style={{ color: theme.colors.error }}
                />
            }
            {!loading &&
                <Dialog.Button
                    label="Valider"
                    onPress={() => onSubmit(comment, clearComment)}
                    style={{ color: theme.colors.primary }}
                />
            }
        </Dialog.Container>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingTop: 5,
        // marginBottom: 10,
        //backgroundColor: 'yellow'
    },
    input: {
        width: "100%",
        alignSelf: 'center',
        backgroundColor: 'transparent',
        borderBottomWidth: StyleSheet.hairlineWidth * 2,
        borderBottomColor: theme.colors.gray_extraLight,
        textAlign: 'center',
        paddingHorizontal: 0,
        //    backgroundColor: 'pink'
    },
    error: {
        // paddingHorizontal: 4,
        paddingTop: 4,
        color: theme.colors.error
    }
});

export default CommentDialog
