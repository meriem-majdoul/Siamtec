import React, { Component } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Image } from 'react-native';
import { faVials } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import StepsForm from '../../../containers/StepsForm';
import { CustomIcon, Button } from '../../../components/index';
import { ficheEEBModel } from '../../../core/forms/ficheEEB/ficheEEBModel';
import { constants, isTablet } from '../../../core/constants';
import * as theme from '../../../core/theme';
import { Checkbox } from 'react-native-paper';
import { auth } from '../../../firebase';
import { setAppToast } from '../../../core/redux';

const properties = [
    "estimation", "colorCat", "products", "nameSir", "nameMiss", "proSituationSir", "ageSir", "proSituationMiss", "ageMiss",
    "familySituation", "houseOwnership", "yearsHousing", "taxIncome", "familyMembersCount", "childrenCount", "aidAndSub",
    "aidAndSubWorksType", "aidAndSubWorksCost", "housingType", "landSurface", "livingSurface", "heatedSurface", "yearHomeConstruction",
    "roofType", "cadastralRef", "livingLevelsCount", "roomsCount", "ceilingHeight", "slopeOrientation", "slopeSupport", "basementType",
    "wallMaterial", "wallThickness", "internalWallsIsolation", "externalWallsIsolation", "floorIsolation", "lostAticsIsolation",
    "lostAticsIsolationMaterial", "lostAticsIsolationAge", "lostAticsIsolationThickness", "lostAticsSurface", "windowType",
    "glazingType", "hotWaterProduction", "yearInstallationHotWater", "heaters", "energySource", "transmittersTypes", "yearInstallationHeaters",
    "idealTemperature", "isMaintenanceContract", "isElectricityProduction", "elecProdType", "elecProdInstallYear", "energyUsage",
    "yearlyElecCost", "roofLength", "roofWidth", "roofTilt", "addressNum", "addressStreet", "addressCode", "addressCity", "phone", "email"
];

class CreateSimulation extends Component {
    constructor(props) {
        super(props);

        this.SimulationId = this.props.route.params?.SimulationId;
        this.project = this.props.route.params?.project;
        this.isGuest = !auth.currentUser;

        const nameSir = this.project ? this.project.client.fullName : "";

        this.state = {
            privacyPolicyAccepted: !this.isGuest,
            initialState: {
                version: 1,
                colorCat: "",
                estimation: "",
                nameSir,
                nameMiss: "",
                proSituationSir: "",
                ageSir: "",
                proSituationMiss: "",
                ageMiss: "",
                familySituation: "",
                houseOwnership: "Oui",  // Valeur par défaut
                yearsHousing: "",
                taxIncome: "",
                familyMembersCount: "",
                childrenCount: "",
                aidAndSub: "",
                aidAndSubWorksType: "",
                aidAndSubWorksCost: "",
                housingType: "",
                landSurface: "",
                livingSurface: "",
                heatedSurface: "",
                yearHomeConstruction: "",
                roofType: "",
                cadastralRef: "",
                livingLevelsCount: "",
                roomsCount: "",
                ceilingHeight: "",
                slopeOrientation: "",
                slopeSupport: "",
                basementType: "",
                wallMaterial: "",
                wallThickness: "",
                internalWallsIsolation: "",
                externalWallsIsolation: "",
                floorIsolation: "",
                lostAticsIsolation: "",
                lostAticsIsolationMaterial: [],
                lostAticsIsolationAge: "",
                lostAticsIsolationThickness: "",
                lostAticsSurface: "",
                windowType: "",
                glazingType: "",
                hotWaterProduction: [],
                yearInstallationHotWater: "",
                heaters: "",
                energySource: "",
                transmittersTypes: [],
                yearInstallationHeaters: "",
                idealTemperature: "",
                isMaintenanceContract: "",
                isElectricityProduction: "",
                elecProdType: "",
                elecProdInstallYear: "",
                energyUsage: "",
                yearlyElecCost: "",
                roofLength: "",
                roofWidth: "",
                roofTilt: "",
                addressNum: "",
                addressStreet: "",
                addressCode: "",
                addressCity: "",
                phone: "",
                email: "",
                products: []
            }
        };

        this.welcomeMessage = this.welcomeMessage.bind(this);
    }

    welcomeMessage(callBack) {
        const { privacyPolicyAccepted } = this.state;

        return (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
                style={[
                theme.customFontMSmedium.h3,
                styles.welcomeTitle,
                { flex: 1 }, // Permet au texte de prendre tout l'espace disponible
                ]}
            >
                SIMULATION EN LIGNE
            </Text>
            <Image
                source={require('../../../assets/Group.png')}
                style={{
                width: '25%', // Ajustez selon vos besoins
                resizeMode: 'contain', // Garde l'image proportionnelle
                }}
            />
            </View>

            </View>


                <View style={styles.welcomeInstructionsContainer}>
                    <Text style={[theme.customFontMSregular.body, { opacity: 0.8 }]}>
                        Bienvenue sur l’outil de simulation en ligne et de dépôt de dossier d’aide...
                    </Text>
                    <View style={styles.welcomeSeparator} />

                    {[
                        "Renseigner vos informations et découvrez votre montant d’aides...",
                        "Déposer votre dossier d’aide directement en ligne !",
                        "Suivez l’avancement de vos demandes"
                    ].map((text, i) => (
                        <Text key={i} style={[theme.customFontMSregular.body, { color: theme.colors.primary }]}>
                            {i + 1}. <Text style={{ color: theme.colors.secondary }}>{text}</Text>
                        </Text>
                    ))}

                    <View style={styles.bottomContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -10 }}>
                            <Checkbox.Android
                                status={privacyPolicyAccepted ? 'checked' : 'unchecked'}
                                onPress={() => this.setState({ privacyPolicyAccepted: !privacyPolicyAccepted })}
                                color={theme.colors.primary}
                            />
                            <Text style={[theme.customFontMSregular.body, { color: theme.colors.gray_dark, flex: 1, flexWrap: 'wrap' }]}>
                                Accepter les conditions de la{' '}
                                <Text
                                    onPress={() => this.props.navigation.navigate("PrivacyPolicy")}
                                    style={{ color: 'blue', textDecorationLine: 'underline' }}
                                >
                                    politique de confidentialité des données
                                </Text>
                            </Text>
                        </View>

                        <Button
                            mode="contained"
                            style={{ width: constants.ScreenWidth - theme.padding * 2 }}
                            backgroundColor={privacyPolicyAccepted ? theme.colors.primary : theme.colors.gray_medium}
                            onPress={() => {
                                if (!privacyPolicyAccepted) {
                                    setAppToast(this, {
                                        message: "Veuillez accepter les conditions de confidentialité",
                                        type: "error"
                                    });
                                    return;
                                }
                                callBack();
                            }}
                        >
                            Commencer
                        </Button>
                    </View>
                </View>
            </View>
        );
    }

    render() {
        return (
            <StepsForm
                titleText="Etude et Evaluation des besoins"
                navigation={this.props.navigation}
                stateProperties={properties}
                initialState={this.state.initialState}
                idPattern={"GS-EEB-"}
                DocId={this.SimulationId}
                collection={"Simulations"}
                pdfType={"Simulations"}
                welcomeMessage={this.welcomeMessage}
                steps={["Votre Foyer", "", "Votre Habitation", "", "Votre Bilan"]}
                pages={ficheEEBModel}
                genButtonTitle="Générer une fiche EEB"
                fileName="Fiche EEB"
              
            />
        );
    }
}

const styles = StyleSheet.create({
    welcomeContainer: {
        flex: 1,
        backgroundColor: theme.colors.white,
        justifyContent: "center"
    },
 welcomeHeader: {
    paddingLeft:20,
    paddingRight:20,
    backgroundColor: "#2C3D3F",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    color: '#6DE662',
    margin: 10, // Ajoute une marge externe
    textAlign: 'left', 
    borderRadius: 10, 
},

    welcomeTitle: {
        color: theme.colors.white,
        textAlign: "center",
        letterSpacing: 1,
        marginBottom: 28,
        marginTop: 16
    },
    welcomeInstructionsContainer: {
        flex: 1,
        paddingHorizontal: theme.padding,
        paddingVertical: theme.padding * 2,
    },
    welcomeSeparator: {
        borderColor: theme.colors.gray_light,
        borderWidth: StyleSheet.hairlineWidth,
        marginVertical: 24
    },
    bottomContainer: {
        position: "absolute",
        bottom: 0,
        alignSelf: "center",
        paddingHorizontal: theme.padding
    },
});

const mapStateToProps = (state) => ({
    user: state.user
});

export default connect(mapStateToProps)(CreateSimulation);
