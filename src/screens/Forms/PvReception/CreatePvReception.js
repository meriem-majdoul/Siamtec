
import React, { Component } from 'react';
import { View, Text, StyleSheet, } from 'react-native'
import { faVials } from 'react-native-vector-icons/FontAwesome5';

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import StepsForm from '../../../containers/StepsForm'
import { CustomIcon, Button } from '../../../components/index'

import { pvReceptionBase64 } from '../../../assets/files/pvReceptionBase64'

import { pvReceptionModel } from '../../../core/forms'
import { generateId, generatePdfForm, generatePvReception } from '../../../core/utils'
import { constants } from '../../../core/constants'
import * as theme from '../../../core/theme'

const properties = [
    "acceptReception",
    "reservesNature",
    "worksToExecute",
    "timeLimitFromToday",
    "madeIn",
    "clientName",
    "installationAddress",
    "phone",

    "projectOwner",
    "billingDate",

    "installations",
    "solarWaterHeaterSensorSurface",
    "combinedSolarSystemSensorSurface",
    "collectiveSolarThermalSensorSurface",
    "woodHeatingPower",
    "woodHeatingDeviceType",
    "photovoltaicPower",
    "photovoltaicWorksType",
    "woodHeatingPower",
    "heatPumpDeviceType",
    "geothermalDrillingDepth",
    "drillingType",
    "condensingBoilerPower",
    "condensingBoilerDeviceType",

    "appreciation",
    "signatoryName",
]

let initialState = {
    acceptReception: "",
    reservesNature: "",
    worksToExecute: "",
    timeLimitFromToday: "",
    madeIn: "",
    clientName: "",
    installationAddress: { description: '', place_id: '', marker: { latitude: '', longitude: '' } },
    phone: "",
    //Installations
    installations: [],
    solarWaterHeaterSensorSurface: "",
    combinedSolarSystemSensorSurface: "",
    collectiveSolarThermalSensorSurface: "",
    woodHeatingPower: "",
    woodHeatingDeviceType: "",
    photovoltaicPower: "",
    photovoltaicWorksType: "",
    woodHeatingPower: "",
    heatPumpDeviceType: "",
    geothermalDrillingDepth: "",
    drillingType: "",
    condensingBoilerPower: "",
    condensingBoilerDeviceType: "",

    appreciation: "",
    signatoryName: "",
    version: 1
}

class CreatePvReception extends Component {
    constructor(props) {
        super(props)

        this.PvReceptionId = this.props.navigation.getParam('PvReceptionId', '')
        this.project = this.props.navigation.getParam('project', null)
        this.pvId = this.project ? this.project.id : `anonyme-${generateId("pv-", 4)}`
        this.clientFullName = this.project ? this.project.client.fullName : ""
        this.clientPhone = this.project ? this.project.client.phone : ""
        this.clientAddress = this.project ? this.project.address : ""
        this.billingDate = moment().format('DD/MM/YYYY')  //Info not available: Billing date is registred only after filling Billing amount during the process

        initialState.clientName = this.clientFullName
        initialState.installationAddress = this.clientAddress
        initialState.phone = this.clientPhone
        initialState.signatoryName = this.clientFullName

        this.state = {
        }
    }

    render() {

        const { pvId, clientFullName, billingDate } = this
        const pdfParams = { pvId, clientFullName, billingDate }
        const { model } = pvReceptionModel({ clientFullName, billingDate })

        return (
            <StepsForm
                titleText="Nouveau PV réception"
                navigation={this.props.navigation}
                stateProperties={properties}
                initialState={initialState}
                idPattern={"GS-PV-"}
                DocId={this.PvReceptionId}
                collection={"PvReception"}
                pdfType={"PvReception"}
                pdfParams={pdfParams}
                //welcomeMessage={this.welcomeMessage}
                steps={["RÉSERVES", "", "CHANTIER", "", "INSTALLATIONS"]}
                pages={model}
                generatePdf={(formInputs) => generatePdfForm(formInputs, "PvReception", { clientFullName, billingDate })}
                genButtonTitle="Générer un PV réception"
                fileName="PV Réception"
            />
        )
    }
}

const styles = StyleSheet.create({
    welcomeContainer: {
        flex: 1,
        backgroundColor: theme.colors.white,
        justifyContent: "center"
    },
    welcomeHeader: {
        justifyContent: "center",
        paddingTop: theme.padding * 3,
        backgroundColor: "#003250",
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary
    },
    welcomeTitle: {
        color: theme.colors.white,
        textAlign: "center",
        letterSpacing: 1,
        marginBottom: 48,
        marginTop: 16
    },
    welcomeInstructionsContainer: {
        flex: 1,
        paddingHorizontal: theme.padding,
        paddingVertical: theme.padding * 3
    },
    welcomeSeparator: {
        borderColor: theme.colors.gray_light,
        borderWidth: StyleSheet.hairlineWidth,
        marginVertical: 24
    },
    bottomCenterButton: {
        position: "absolute",
        bottom: 0,
        alignSelf: "center",
        width: constants.ScreenWidth - theme.padding * 2,
        backgroundColor: theme.colors.primary
    },
})

export default CreatePvReception




   // //Auto fields
        // initialState.projectOwner = this.clientFullName
        // initialState.billingDate = this.billingDate
        // initialState.reserveDate1 = moment().format('DD/MM/YYYY')
        // initialState.reserveDate2 = moment().format('DD/MM/YYYY')
        // initialState.todayDate1 = moment().format('DD/MM/YYYY')
        // initialState.appreciationDate = moment().format('DD/MM/YYYY')
        // initialState.dayNow = moment().format('DD')
        // initialState.monthNow = moment().format('MM')
        // initialState.yearNow = moment().format('YYYY')