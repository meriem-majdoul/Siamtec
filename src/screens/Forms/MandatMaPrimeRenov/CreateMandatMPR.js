
import React, { Component } from 'react';
import { View, Text, StyleSheet, } from 'react-native'
import { faVials } from '@fortawesome/free-solid-svg-icons';

import StepsForm from '../../../containers/StepsForm'
import { CustomIcon, Button } from '../../../components/index'

import { mandatMPRModel } from '../../../core/forms/mandatMPR/mandatMPRModel'
import { mandatMPRBase64 } from '../../../assets/files/mandatMPRBase64'

import { generatePdfForm, getAddressDetails, retrieveFirstAndLastNameFromFullName } from '../../../core/utils'
import { constants } from '../../../core/constants'
import * as theme from '../../../core/theme'
import { db } from '../../../firebase';

const properties = [
    "sexe",
    "applicantFirstName",
    "applicantLastName",
    "address",
    "zipCode",
    "city",
    "email",
    "phone",
    "createdIn",
]

let initialState = {
    sexe: "",
    applicantFirstName: "",//Auto
    applicantLastName: "",//Auto
    address: "",//Auto
    zipCode: "",//Old
    city: "",//Old
    email: "",//Auto
    phone: "", //Auto
    createdIn: "",//Auto
    version: 1
}

class CreateMandatMPR extends Component {
    constructor(props) {
        super(props)
        const { route } = this.props;

        // Récupération des paramètres via route?.params
        this.MandatMPRId = route?.params?.MandatMPRId ?? '';
        this.project = route?.params?.project ?? null;
        const clientFullName = this.project ? this.project.client.fullName : ""
        const clientAddress = this.project ? this.project.address : ""
        const clientPhone = this.project ? this.project.client.phone : ""
        const clientEmail = this.project ? this.project.client.email : ""

        const {
            firstName: clientFirstName,
            lastName: clientLastName
        } = retrieveFirstAndLastNameFromFullName(clientFullName)

        this.state = {
            zipCode: "",
            city: "",
            sexe: "Monsieur",
            applicantFirstName: clientFirstName,
            applicantLastName: clientLastName,
            address: clientAddress.description,
            phone: clientPhone,
            email: clientEmail,
            createdIn: clientAddress.description,
            version: 1
        }
    }

    async componentDidMount() {
        const { latitude, longitude } = this.project.address.marker
        const addressDetails = await getAddressDetails(latitude, longitude)
        const { zipCode, city } = addressDetails 
        this.setState({ zipCode, city })
    }

    render() {

        return (
            <StepsForm
                autoGen={true}
                titleText="Créer un mandat Maprimerénov"
                navigation={this.props.navigation}
                stateProperties={properties}
                initialState={this.state}
                idPattern={"GS-MMPR-"}
                DocId={this.MandatMPRId}
                collection={"MandatsMPR"}
                pdfType={"MandatsMPR"}
                //welcomeMessage={this.welcomeMessage}
                steps={["Identité", "", "Habitation", "", "Coordonnées"]}
                pages={mandatMPRModel}
                generatePdf={(formInputs) => generatePdfForm(formInputs, "MandatsMPR")}
                genButtonTitle="Générer un Mandat Maprimerénov"
                fileName="Mandat MaPrimeRénov"
            />
        )
    }
}

export default CreateMandatMPR
