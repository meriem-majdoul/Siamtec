import { faChevronRight, faFile, faInfoCircle, faLock, faPen } from 'react-native-vector-icons/FontAwesome5';
import React, { Component } from 'react';
import { StyleSheet, SafeAreaView, View, TouchableOpacity } from 'react-native'
import { Subheading, Title } from 'react-native-paper';
import { CustomIcon } from '../../components';

import Appbar from '../../components/Appbar'
import { constants, isTablet } from '../../core/constants';
import * as theme from "../../core/theme"


const SettingItem = ({ icon, title, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.rowStyle, styles.settingItemContainer]}
            onPress={onPress}
        >
            <View style={[styles.rowStyle, styles.settingItemContentWrapper]}>
                <CustomIcon icon={icon} size={isTablet ? 24 : 19} style={{ marginRight: theme.padding }} />
                {isTablet ?
                    <Title>{title}</Title>
                    :
                    <Subheading>{title}</Subheading>
                }
            </View>
            <View>
                <CustomIcon icon={faChevronRight} color={theme.colors.gray_medium} size={19}></CustomIcon>
            </View>
        </TouchableOpacity>
    )
}

const settings = [
    { icon: faInfoCircle, title: "A propos", navigation: { screen: "AboutUs", params: { isRoot: false } } },
    { icon: faLock, title: "Politique de confidentialité", navigation: { screen: "PrivacyPolicy", params: { isRoot: false } } },
    { icon: faFile, title: "Politique de vente et travaux", navigation: { screen: "SalesTermsAndConditions", params: { isRoot: false } } },
    { icon: faPen, title: "Signaler un problème", navigation: { screen: "Support", params: { isRoot: false } } },
]

class Settings extends Component {

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Appbar menu title titleText='Paramètres' />

                <View style={styles.container}>
                    {settings.map((settingItem, index) => {
                        const { icon, title, navigation } = settingItem
                        const { screen, params } = navigation
                        return (
                            <SettingItem
                                key={index.toString()}
                                icon={icon}
                                title={title}
                                onPress={() => this.props.navigation.navigate(screen, params)}
                            />
                        )
                    })}
                </View>

            </SafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: theme.padding,
    },
    rowStyle: {
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: "center",
    },
    settingItemContainer: {
        paddingVertical: theme.padding / 1.7,
        paddingHorizontal: theme.padding,
        //backgroundColor:"green"
    },
    settingItemContentWrapper: {

    }
})


export default Settings

