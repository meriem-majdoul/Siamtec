
import React, { Component } from 'react';
import { View, Text, StyleSheet, } from 'react-native'
import { faVials } from '@fortawesome/free-solid-svg-icons';

import StepsForm from '../../../containers/StepsForm'
import { CustomIcon, Button } from '../../../components/index'

import { mandatSynergysModel } from '../../../core/forms'
import { mandatMPRBase64 } from '../../../assets/files/mandatMPRBase64'

import { generatePdfForm, retrieveFirstAndLastNameFromFullName } from '../../../core/utils'
import { constants } from '../../../core/constants'
import * as theme from '../../../core/theme'
import { db } from '../../../firebase';

const properties = [
    "serviceProvider",
    "serviceType",
    "productTypes",
    "clientFirstName",
    "clientLastName",
    "addressClient",
    "addressCodeClient",
    "addressCityClient",
    "fixedPhoneClient",
    "mobilePhoneClient",
    "emailClient",
    "isSiteInfoEqualToClientInfo",
    "siteName",
    "addressSite",
    "addressCodeSite",
    "phoneSite",
    "emailSite",
    "financingAids",
]

let initialState = {
    serviceProvider: "",
    serviceType: "",
    productTypes: [],
    clientFirstName: "",
    clientLastName: "",
    addressClient: "",
    addressCodeClient: "",
    addressCityClient: "",
    fixedPhoneClient: "",
    mobilePhoneClient: "",
    emailClient: "",
    isSiteInfoEqualToClientInfo: "",
    siteName: "",
    addressSite: "",
    addressCodeSite: "",
    phoneSite: "",
    emailSite: "",
    financingAids: [],
    version: 1
}

class CreateMandatSynergys extends Component {
    constructor(props) {
        super(props)
        const { route } = this.props;

        this.MandatSynergysId = route.params?.MandatSynergysId || '';
        this.project = route.params?.project ?? null;
        this.clientFullName = this.project ? this.project.client.fullName : ""
        this.clientAddress = this.project ? this.project.address : ""
        this.clientPhone = this.project ? this.project.client.phone : ""
        this.clientEmail = this.project ? this.project.client.email : ""

        const { firstName: clientFirstName, lastName: clientLastName } = retrieveFirstAndLastNameFromFullName(this.clientFullName)
        initialState.clientFirstName = clientFirstName
        initialState.clientLastName = clientLastName
        initialState.addressClient = this.clientAddress.description
        initialState.mobilePhoneClient = this.clientPhone
        initialState.emailClient = this.clientEmail
    }

    render() {

        const { model } = mandatSynergysModel()

        return (
            <StepsForm
                titleText="Créer un mandat Synergys"
                navigation={this.props.navigation}
                stateProperties={properties}
                initialState={initialState}
                idPattern={"GS-MSYN-"}
                DocId={this.MandatSynergysId}
                collection={"MandatsSynergys"}
                pdfType={"MandatsSynergys"}
                //welcomeMessage={this.welcomeMessage}
                steps={["PRESTATION", "", "CLIENT", "", "CHANTIER"]}
                pages={model}
                generatePdf={(formInputs) => generatePdfForm(formInputs, "MandatsSynergys")}
                genButtonTitle="Générer un Mandat Synergys"
                fileName="Mandat Synergys"
            />
        )
    }
}

export default CreateMandatSynergys
