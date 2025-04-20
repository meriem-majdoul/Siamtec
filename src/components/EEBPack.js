

import { faCheck, faVrCardboard } from "@fortawesome/free-solid-svg-icons";
import React from "react"
import { View, StyleSheet, Text, Alert, TextInput as NativeTextInput } from "react-native";
import NumberFormat from 'react-number-format';

import * as theme from "../core/theme";
import CustomIcon from "./CustomIcon";


export const setEstimation = (products, colorCat) => {

    let totalAide = 0

    const isProductProposed = (productName) => {
        const isIncluded = products.includes(productName) ? 1 : 0
        return isIncluded
    }

    const isPacAirAir = isProductProposed("Pac air air (climatisation)")
    const isPacAirEau = isProductProposed("PAC AIR EAU")
    const isIsolationComble = isProductProposed("Isolation des combles")
    const isPhotovoltaique = isProductProposed("Photovoltaïque")
    const isBallonThermo = isProductProposed("Ballon thermodynamique")

    //New proucts (2022)
    const isCag = isProductProposed("Chaudière à granulé")
    const isCesi = isProductProposed("Chauffe-eau solaire individuel")
    const isSsc = isProductProposed("Chauffage solaire combiné")

    // let { lostAticsSurface } = this.state
    // lostAticsSurface = Number(lostAticsSurface)

    if (colorCat == 'blue') {
        var totalCEE = (4000 * isPacAirEau) + (0 * isPacAirAir) + (98 * isBallonThermo) + (0 * isPhotovoltaique) + (4000 * isCag) + (173 * isCesi) + (0 * isSsc)
        var totalMPR = (4000 * isPacAirEau) + (0 * isPacAirAir) + (1200 * isBallonThermo) + (0 * isPhotovoltaique) + (10000 * isCag) + (4000 * isCesi) + (10000 * isSsc)
    }

    else if (colorCat == 'yellow') {
        var totalCEE = (4000 * isPacAirEau) + (0 * isPacAirAir) + (98 * isBallonThermo) + (0 * isPhotovoltaique) + (4000 * isCag) + (173 * isCesi) + (0 * isSsc)
        var totalMPR = (3000 * isPacAirEau) + (0 * isPacAirAir) + (800 * isBallonThermo) + (0 * isPhotovoltaique) + (8000 * isCag) + (3000 * isCesi) + (8000 * isSsc)
    }

    else if (colorCat == 'purple') {
        var totalCEE = (2500 * isPacAirEau) + (0 * isPacAirAir) + (98 * isBallonThermo) + (0 * isPhotovoltaique) + (2500 * isCag) + (173 * isCesi) + (0 * isSsc)
        var totalMPR = (2000 * isPacAirEau) + (0 * isPacAirAir) + (400 * isBallonThermo) + (0 * isPhotovoltaique) + (4000 * isCag) + (2000 * isCesi) + (4000 * isSsc)
    }

    else if (colorCat == 'pink') {
        var totalCEE = (2500 * isPacAirEau) + (0 * isPacAirAir) + (98 * isBallonThermo) + (0 * isPhotovoltaique) + (2500 * isCag) + (173 * isCesi) + (0 * isSsc)
        var totalMPR = (0 * isPacAirEau) + (0 * isPacAirAir) + (0 * isBallonThermo) + (0 * isPhotovoltaique) + (0 * isCag) + (0 * isCesi) + (0 * isSsc)
    }

    totalAide = totalCEE + totalMPR

    return totalAide
}

const EEBPack = ({ packs, isPV, colorCat, ...props }) => {

    const isPVEligible = () => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 10 }}>
                <CustomIcon
                    icon={faCheck}
                    color={"green"}
                    size={16}
                    style={{ marginBottom: 2, marginRight: 8 }}
                />
                <Text style={theme.customFontMSsemibold.body}>Éligible à l'option photovoltaïque</Text>
            </View>
        )
    }

    const renderEstimation = (amount) => {
        return (
            <Text style={[{ marginTop: 20 }, theme.customFontMSregular.body]}>
                Estimation des aides:  <NumberFormat
                    value={amount}
                    displayType={'text'}
                    thousandSeparator={true}
                    suffix={'€'}
                    renderText={value => <Text style={[{ color: "green" }, theme.customFontMSbold.header]}>{value}</Text>}
                />
            </Text>
        )
    }

    if (packs.length === 0) {
        return (
            <Text style={[theme.customFontMSsemibold.body, { opacity: 0.8, margin: theme.padding }]}>Aucun pack proposé</Text>
        )
    }

    else return (
        <View>
            <Text style={[theme.customFontMSsemibold.body, { opacity: 0.8, margin: theme.padding }]}>Packs proposés:</Text>

            {packs.map((products, i) => {

                const amount = setEstimation(products, colorCat)
                const packLabel = products.join(" + ")

                return (

                    <View key={i.toString()} style={[styles.container, theme.style.shadow]}>
                        <View style={styles.headerContainer}>
                            <Text style={[styles.header, theme.customFontMSmedium.header]}>Pack {i + 1}</Text>
                        </View>

                        <View style={styles.contentContainer}>
                            <Text style={[theme.customFontMSsemibold.body]}>{packLabel}</Text>
                            {isPV && isPVEligible()}
                            {renderEstimation(amount)}
                        </View>
                    </View>
                )
            })
            }
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        margin: theme.padding,
        backgroundColor: 'white',
        borderRadius: 10
    },
    headerContainer: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.padding / 2,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    header: {
        textAlign: "center",
        color: theme.colors.secondary
    },
    contentContainer: {
        paddingVertical: theme.padding * 1.5,
        paddingHorizontal: theme.padding,
    }
})

export default EEBPack