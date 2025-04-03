import React, { Component } from 'react';
import { StyleSheet, SafeAreaView, View, Image, ScrollView } from 'react-native'
import { Headline, Paragraph as PaperParagraph, Subheading } from 'react-native-paper';

import Appbar from '../../components/Appbar'
import { constants, isTablet } from '../../core/constants';
import * as theme from "../../core/theme"


const Separator = ({ style }) => {
    return (
        <View style={[{ width: constants.ScreenWidth - theme.padding * 6, alignSelf: "center", height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.gray_medium }]} />
    )
}

const Paragraph = ({ children }) => {
    if (isTablet) return <Subheading>{children}</Subheading>
    else return <PaperParagraph>{children}</PaperParagraph>
}

const MyHeadline = ({ style, showSeparator = true, ...props }) => {
    return (
        <View style={[{ marginTop: theme.padding * 2 }, style]}>
            {showSeparator && <Separator />}
            <Headline style={{ textAlign: "center", color: theme.colors.primary, marginTop: showSeparator ? theme.padding : 0, marginBottom: theme.padding }}>
                {props.children}
            </Headline>
        </View>
    )
}

class AboutUs extends Component {

    constructor(props) {
        super(props)

        this.isRoot = this.props.route?.params?.isRoot ?? true;//#task: set it to true

        this.state = {
            a: ''
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Appbar back={!this.isRoot} title titleText='A propos' />

                <ScrollView style={styles.container}>
                    <Image resizeMode='contain' source={require('../../assets/images/about-us-team.jpg')} style={{ height: constants.ScreenHeight / 5, width: constants.ScreenWidth - theme.padding * 2, alignSelf: "center" }} />
                    <MyHeadline>Présentation</MyHeadline>
                    <Paragraph>
                        Synergys est une entreprise à taille humaine. Une aventure où chacun à une réelle conscience écologique et l’envie de contribuer à la transition énergétique. L’écoute, la bonne humeur et l’entraide sont des valeurs qui habite nos locaux situés à Narbonne (Montredon-des-Corbières).
                        Les énergies renouvelables étant un domaine en constante évolution, il est primordial de se tenir informé des dernières innovations. Chez Synergys, nous suivons régulièrement des formations pour vous proposer des services d’actualités et adaptés à vos besoins !
                        Faites connaissance avec notre entreprise et notre équipe. Nous sommes à votre disposition pour répondre à toutes vos questions et vous aider à réaliser vos travaux.
                        Synergys est spécialisé dans l’installation et la rénovation de système de chauffage, les énergies renouvelables et l‘isolation. Nous apportons notre expertise et notre sérieux dans la réalisation de vos projets.
                        Nous nous déplaçons sur votre site, afin de vous offrir un service 100 % sur-mesure. Votre projet est suivi de A à Z par une équipe qualifiée, alliant compétence, savoir-faire et éthique.
                        N’hésitez pas à faire appel à notre équipe, elle se fera un plaisir de vous aider.
                    </Paragraph>
                    <MyHeadline>SAVOIR-FAIRE</MyHeadline>
                    <Paragraph>
                        Synergys c’est aussi une expertise. Un savoir-faire reconnu en matière de gestion de projets d’énergies renouvelables. Dans un secteur qui se voit évoluer très vite, Synergys se remet en question pour être performante en termes de qualité et de prix.
                        Nous ne faisons aucune sous-traitance!
                        Nos trois équipes d’intervention interviennent dans toute l’Occitanie. Souriants, compétents, motivés et bien équipés, ils sont le trésor de notre entreprise.
                    </Paragraph>
                    <Image resizeMode='cover' source={require('../../assets/images/about-us-technicien.jpg')} style={{ height: constants.ScreenHeight / 4, width: constants.ScreenWidth - theme.padding * 2, alignSelf: "center", marginVertical: theme.padding }} />
                    <Paragraph>
                        Depuis 2005, la loi POPE (Programmation fixant les Orientations de la Politique Énergétique) permet aux foyers à revenus modestes de bénéficier par exemple une prise en charge de votre changement de système de chauffage. Le but ? Lutter contre la déperdition d’énergie, qui a souvent pour conséquence une surconsommation de chauffage ou de climatisation. Ces travaux sont financés en partie par l’Europe, des caisses privés et entreprises classées « grands pollueurs », qui sont dispensés en retour du paiement de la taxe carbone.
                        Contrairement aux idées reçues, tout le monde est éligible à ces aides. Seul le montant de la subvention varie selon certains critères relatifs aux revenus, au logement, au foyer… Les travaux doivent concerner le logement principal (construit depuis plus de 15 ans) et être réalisés par un prestataire RGE tel que Synergys.
                        S’adresser à une entreprise RGE est indispensable pour mener à bien son projet d’équipement en énergies renouvelables avec le soutien financier décrit ci-dessus.
                        Synergys détient aussi plusieurs qualifications RGE. Un professionnel avec une qualification RGE, vous permet de bénéficier d’aides financières pour vos travaux d’économies d’énergie.
                    </Paragraph>
                    <Paragraph style={{ fontWeight: "bold" }}>
                        Autre certification de Synergys: la certification QualiPAC
                    </Paragraph>
                    <Paragraph>
                        QualiPAC est une certification RGE (Reconnu Garant de l’Environnement), délivrée par Qualit’EnR, l’organisme spécialiste de la qualification des entreprises d’installation des énergies renouvelables.
                        La reconnaissance RGE est octroyée aux divers professionnels de la rénovation énergétique. Le label de qualité QualiPAC est l’une des différentes qualifications de RGE pour l’installation de pompes à chaleur. Afin d’obtenir une aide financière pour la réalisation de vos travaux, vous devrez obligatoire faire appel à un de ces professionnels reconnus.
                    </Paragraph>
                    <MyHeadline>
                        Les aides de l’Etat
                    </MyHeadline>
                    <Paragraph>
                        Synergys est Mandataire administratif et financier de Maprimerenov à Narbonne. Synergys peut déposer le dossier de subvention à la place du bénéficiaire et aussi avancer l’argent de la rénovation. Par exemple: Pour une installation d’une pompe à chaleur, vous bénéficiez de 10 000€ de prise en charge par le biais de Maprimerénov. Le versement de cette aide peut prendre plusieurs mois. En étant mandataire Maprimerénov’, Synergys avancera à votre place le montant d’aide pour démarrer les travaux et patientera à votre place!
                        Plusieurs aides sont mis en place pour la transition énergétique, par conséquent le montage des dossiers est la clé pour l’obtention la plus rapide des fonds!
                        Synergys avance les aides à la place du client et dispose de tous les agréments nécessaires pour le montage et le suivi administratif.
                        Afin de vous encourager à vous tourner vers des solutions énergétiques plus propres; telles que l’installation de pompe à chaleur, poêle à granulés, panneaux photovoltaïques, chauffe-eau solaire, vmc double flux, etc. De nombreuses aides financières ont été mises en place par le gouvernement pour vous :{"\n"}{"\n"}

                        <Paragraph>- CEE (certificat d’économie d’énergie){"\n"}</Paragraph>
                        <Paragraph>- MaPrimeRénov’{"\n"}</Paragraph>
                        <Paragraph>- L’ éco-prêt à taux zéro{"\n"}</Paragraph>
                        <Paragraph>- La TVA à 5,5%{"\n"}</Paragraph>
                        <Paragraph>- L’éco-chèque de la région{"\n"}</Paragraph>
                    </Paragraph>
                    <MyHeadline>
                        Les équipements
                    </MyHeadline>
                    <Paragraph>
                        Synergys s’assure toujours de la qualité et de la cohérence des produits installés pour ses clients. Du choix du système le plus adéquat, en passant par l’étude technique pour l’installation et le calibrage du matériel nous vous proposons toujours les équipements qui répondent le mieux au besoin du foyer.
                        On vous propose divers services: Chauffage; Eau chaude sanitaire; Photovoltaïque.
                    </Paragraph>

                    <Paragraph>
                        Synergys, spécialiste en transition énergétique des bâtiments à Narbonne et dans tout le Languedoc-Roussillon est à votre écoute. Nous réalisons tous vos projets, l’installation de panneaux photovoltaïques, chauffe-eau solaire, vmc double flux, etc. Réalisation des dossiers, accompagnement et réalisation de votre projet. Nous mettons notre savoir-faire et notre expérience à votre service.
                    </Paragraph>

                    <Image resizeMode='cover' source={require('../../assets/images/hitachi-climatisation-reversible.jpg')} style={{ height: constants.ScreenHeight / 4, width: constants.ScreenWidth - theme.padding * 2, alignSelf: "center", marginVertical: theme.padding }} />
                    <MyHeadline showSeparator={false} style={{ marginTop: 0 }}>Chauffage</MyHeadline>
                    <Image resizeMode='cover' source={require('../../assets/images/chauffe-eau-thermodynamique-hitachi.jpg')} style={{ height: constants.ScreenHeight / 4, width: constants.ScreenWidth - theme.padding * 2, alignSelf: "center", marginVertical: theme.padding }} />
                    <MyHeadline showSeparator={false} style={{ marginTop: 0 }}>Eau chaude sanitaire</MyHeadline>
                    <Image resizeMode='cover' source={require('../../assets/images/installation-panneau-solaire-domotique-photovoltaique-800x512.jpg')} style={{ height: constants.ScreenHeight / 4, width: constants.ScreenWidth - theme.padding * 2, alignSelf: "center", marginVertical: theme.padding }} />
                    <MyHeadline showSeparator={false} style={{ marginTop: 0 }}>Photovoltaïque</MyHeadline>
                    <Image resizeMode='cover' source={require('../../assets/images/poele-a-granule.jpeg')} style={{ height: constants.ScreenHeight / 4, width: constants.ScreenWidth - theme.padding * 2, alignSelf: "center", marginVertical: theme.padding }} />
                    <MyHeadline showSeparator={false} style={{ marginTop: 0 }}>Poêles à granulés</MyHeadline>
                </ScrollView>

            </SafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: theme.padding / 2
    },
})


export default AboutUs

