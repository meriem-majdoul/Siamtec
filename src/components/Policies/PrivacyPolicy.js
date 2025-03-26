import React, { Component } from 'react';
import { View, ScrollView, Dimensions, StyleSheet, Linking } from 'react-native';
import { Paragraph as PaperParagraph, Title, Subheading } from 'react-native-paper';
import { isTablet } from '../../core/constants';
import * as  theme from '../../core/theme'
// import { constants } from '../core/constants'


const br = (n) => {
    let str = ""
    for (let i = 0; i < n; i++) {
        str = str + "\n"
    }
    return str
}

const bold = (text) => {
    return <Paragraph style={{ fontWeight: "bold" }}>{text}</Paragraph>
}

Paragraph = ({ children }) => {
    if (isTablet) return <Subheading>{children}</Subheading>
    else return <PaperParagraph>{children}</PaperParagraph>
}

BulletPoints = ({ bulletpoints, ...props }) => {
    return (
        bulletpoints.map((point, index) => {
            return <Paragraph key={index.toString()} style={{ marginLeft: theme.padding }}>• {point}</Paragraph>
        })
    )
}

export default class PrivacyPolicy extends Component {

    renderTitle(title) {
        return (
            <View style={{ paddingBottom: 8, borderBottomWidth: 3, borderBottomColor: theme.colors.primary }}>
                <Title style={{ color: theme.colors.primary, fontWeight: "bold" }}>{title}</Title>
            </View>
        )
    }

    renderSubheading(subheading) {
        return <Subheading style={{ marginTop: theme.padding, marginBottom: theme.padding / 2, color: theme.colors.primary, fontWeight: "bold" }}>{subheading}</Subheading>
    }

    renderSmallSubheading(subheading) {
        return <Paragraph style={{ marginTop: theme.padding, marginBottom: theme.padding / 2, color: theme.colors.primary, fontWeight: "bold" }}>- {subheading}</Paragraph>
    }

    renderLink(text) {
        return <Paragraph style={{ textDecorationLine: "underline", color: "blue" }} onPress={() => Linking.openURL(text)}>{text}</Paragraph>
    }

    renderPrivacyPolicy() {
        return (
            <ScrollView
                style={styles.tcContainer}
                contentContainerStyle={{ padding: theme.padding }}>
                <Paragraph>
                    Politique de confidentialité{br(2)}Dernière mise à jour : 21 avril 2022{br(2)}
                    Cette politique de confidentialité décrit nos politiques et procédures sur la collecte, l'utilisation et la divulgation de vos informations lorsque vous utilisez l’application SYNERGYS et vous informe sur vos droits en matière de confidentialité et sur la manière dont la loi vous protège.{br(2)}
                    Nous utilisons vos données personnelles pour fournir et améliorer le service. En utilisant le Service, Vous acceptez la collecte et l'utilisation d'informations conformément à la présente Politique de confidentialité.{br(2)}
                </Paragraph>
                {this.renderTitle("Interprétations et Définitions")}

                <View style={{ marginBottom: theme.padding }}>
                    {this.renderSubheading("Interprétation")}
                    <Paragraph>
                        Les mots dont la lettre initiale est en majuscule ont des significations définies dans les
                        conditions suivantes. Les définitions suivantes auront la même signification qu'elles
                        apparaissent au singulier ou au pluriel.
                    </Paragraph>
                </View>

                <View style={{ marginBottom: theme.padding }}>
                    {this.renderSubheading("Définitions")}
                    <Paragraph>
                        Aux fins de la présente politique de confidentialité :{br(2)}
                        {bold("Compte")} désigne un compte unique créé pour vous permettre d'accéder à notre service ou à
                        des parties de notre service.{br(1)}
                        {bold("Affilié")} désigne une entité qui contrôle, est contrôlée par ou est sous contrôle commun avec
                        une partie, où "contrôle" signifie la propriété de 50 % ou plus des actions, participations ou
                        autres titres habilités à voter pour l'élection des administrateurs ou autre autorité de
                        gestion.{br(1)}
                        {bold("Application")} désigne le programme logiciel fourni par la Société que Vous téléchargez sur
                        tout appareil électronique, nommé Synergys.{br(1)}
                        {bold("Société")} (ci-après dénommée « la Société », « Nous », « Notre » ou « Notre » dans le présent
                        Contrat) désigne le Groupe Synergys, ZAC du castellas, 270 bis rue de la combe du meunier,
                        11100 Montredon-des Corbières, France.{br(1)}
                        {bold("Pays")} fait référence à : France{br(1)}
                        Appareil désigne tout appareil pouvant accéder au Service tel qu’un téléphone portable ou
                        une tablette numérique.{br(1)}
                        {bold("Les données personnelles")} sont toutes les informations relatives à une personne identifiée
                        ou identifiable.{br(1)}
                        {bold("Service")} fait référence à l'Application.{br(1)}
                        {bold("Prestataire")} désigne toute personne physique ou morale qui traite les données pour le
                        compte de la Société. Il fait référence à des sociétés tierces ou à des personnes employées
                        par la Société pour faciliter le Service, pour fournir le Service au nom de la Société, pour
                        effectuer des services liés au Service ou pour aider la Société à analyser la manière dont le
                        Service est utilisé.{br(1)}
                        {bold("Les données d'utilisation")} font référence aux données collectées automatiquement, soit
                        générées par l'utilisation du service, soit à partir de l'infrastructure du service elle-même
                        (par exemple, la durée d'une visite de page).{br(1)}
                        {bold("Agent utilisateur")} est un ensemble d'informations collectées à partir de la plupart des
                        services de Firebase et comprend les éléments suivants: appareil, système d'exploitation, ID
                        de groupe d'applications et plate-forme de développement. L'agent utilisateur n'est jamais
                        lié à un identifiant d'utilisateur ou d'appareil et est utilisé par l'équipe Firebase pour
                        déterminer l'adoption de la plate-forme et de la version afin de mieux informer les décisions
                        relatives aux fonctionnalités de Firebase.{br(1)}
                        {bold("Vous")} désigne la personne accédant ou utilisant le Service, ou la société ou toute autre entité
                        juridique au nom de laquelle cette personne accède ou utilise le Service, selon le cas.{br(1)}
                    </Paragraph>
                    {this.renderTitle("Collection et Utilisation de vos données personnelles")}
                    {this.renderSubheading("Types de données collectées")}
                    {this.renderSmallSubheading("Données personnelles")}
                    <Paragraph>
                        Lors de l'utilisation de notre service, nous pouvons vous demander de nous fournir
                        certaines informations personnellement identifiables qui peuvent être utilisées pour vous
                        contacter ou vous identifier. Les informations personnellement identifiables peuvent
                        inclure, mais sans s'y limiter :
                    </Paragraph>
                    <BulletPoints
                        bulletpoints={[
                            "Adresse email et mot de passe",
                            "Nom et Prénom",
                            "Numéro de téléphone",
                            "Adresse, Province, Code postal, Ville, Pays",
                            "Localisation basée sur des coordonnées (longitude et latitude) via une interface de Apple Maps",
                            "Données d’utilisation"
                        ]}
                    />
                    {this.renderSmallSubheading("Données d’utilisation")}
                    <Paragraph>
                        Lorsque vous utilisez l’Application, votre appareil mobile transfère automatiquement
                        diverses informations techniques vers notre serveur, sans action de votre part.
                        Ces informations sont nécessaires au fonctionnement correct de l’Application et vous
                        permettent d’accéder aux services proposés.
                        Plus précisément, les informations concernent les données suivantes :
                    </Paragraph>
                    <BulletPoints
                        bulletpoints={[
                            "Adresse IP de votre appareil mobile",
                            "Type et version de votre appareil mobile (iPhone 7, iOS 12.1...)",
                            "Numéro de version de l’Application"
                        ]}
                    />
                    {this.renderSmallSubheading("Informations collectées lors de l'utilisation de l'application")}
                    <Paragraph>
                        Lors de l'utilisation de Notre Application, afin de fournir des fonctionnalités de Notre
                        Application, Nous pouvons collecter, avec Votre autorisation préalable :
                    </Paragraph>
                    <BulletPoints
                        bulletpoints={[
                            "Images, Documents et autres informations de l'appareil photo et de la bibliothèque de photos de votre appareil"
                        ]}
                    />
                    <Paragraph>
                        Nous utilisons ces informations pour fournir des fonctionnalités de Notre Service, pour
                        améliorer et personnaliser Notre Service. Les informations peuvent être téléchargées sur
                        les serveurs de la société et/ou sur le serveur d'un fournisseur de services ou peuvent être
                        simplement stockées sur votre appareil.
                        Vous pouvez activer ou désactiver l'accès à ces informations à tout moment, via les
                        paramètres de votre appareil.
                    </Paragraph>
                    {this.renderSubheading("Utilisation de vos données personnelles")}
                    <Paragraph>
                        La Société peut utiliser les Données Personnelles aux fins suivantes :{br(1)}
                        {bold("Pour fournir et maintenir notre Service")}, y compris pour surveiller l'utilisation de notre
                        Service.{br(1)}
                        {bold("Pour gérer Votre Compte :")} pour gérer Votre inscription en tant qu'utilisateur du Service.
                        Les données personnelles que vous fournissez peuvent vous donner accès à différentes
                        fonctionnalités du service qui sont à votre disposition en tant qu'utilisateur enregistré.{br(1)}
                        {bold("Pour l'exécution d'un contrat :")} l'élaboration, la conformité et la réalisation du contrat
                        d'achat des produits, articles ou services que vous avez achetés ou de tout autre contrat
                        avec nous par le biais du service.{br(1)}
                        {bold("Pour vous contacter :")} pour vous contacter par e-mail, appels téléphoniques, SMS ou autres
                        formes équivalentes de communication électronique, telles que les notifications push d'une
                        application mobile concernant les mises à jour ou les communications informatives
                        relatives aux fonctionnalités, produits ou services sous contrat, y compris les mises à jour
                        de sécurité, lorsque cela est nécessaire ou raisonnable pour leur mise en œuvre.{br(1)}
                        {bold("Pour gérer vos demandes :")} pour assister et gérer vos demandes que vous nous adressez.{br(1)}
                        {bold("Pour les transferts d'entreprise :")} nous pouvons utiliser vos informations pour évaluer ou
                        mener une fusion, une cession, une restructuration, une réorganisation, une dissolution ou
                        toute autre vente ou transfert de tout ou partie de nos actifs, que ce soit dans le cadre d'une
                        entreprise en activité ou dans le cadre d'une faillite, d'une liquidation, ou procédure
                        similaire, dans laquelle les données personnelles que nous détenons sur les utilisateurs de
                        nos services font partie des actifs transférés.
                        Nous pouvons partager vos informations personnelles dans les situations suivantes :
                    </Paragraph>
                    <Paragraph>
                        Avec les fournisseurs de services : nous pouvons partager vos informations
                        personnelles avec des fournisseurs de services pour surveiller et analyser l'utilisation
                        de notre service, pour vous contacter.{br(1)}
                        • {bold("Pour les transferts d'entreprise :")} nous pouvons partager ou transférer vos
                        informations personnelles dans le cadre de, ou pendant les négociations de, toute
                        fusion, vente d'actifs de la société, financement ou acquisition de tout ou partie de nos
                        activités à une autre société.{br(1)}
                        • {bold("Avec les affiliés :")} nous pouvons partager vos informations avec nos affiliés, auquel cas
                        nous exigerons de ces affiliés qu'ils respectent la présente politique de confidentialité.
                        Les sociétés affiliées incluent notre société mère et toutes autres filiales, partenaires de
                        coentreprise ou autres sociétés que nous contrôlons ou qui sont sous contrôle commun
                        avec nous.{br(1)}
                        • {bold("Avec des partenaires commerciaux :")} nous pouvons partager vos informations avec
                        nos partenaires commerciaux pour vous proposer certains produits, services ou
                        promotions.{br(1)}
                        • {bold("Avec des partenaires commerciaux :")} nous pouvons partager vos informations avec
                        nos employés commerciaux pour vous proposer certains produits, services ou
                        promotions.{br(1)}
                        • {bold("Avec votre consentement :")} nous pouvons divulguer vos informations personnelles à
                        toute autre fin avec votre consentement.{br(1)}
                    </Paragraph>
                    {this.renderSubheading('Conservation de vos données personnelles')}
                    <Paragraph>
                        La Société ne conservera vos données personnelles que le temps nécessaire aux fins
                        énoncées dans la présente politique de confidentialité. Nous conserverons et utiliserons vos
                        données personnelles dans la mesure nécessaire pour nous conformer à nos obligations
                        légales (par exemple, si nous sommes tenus de conserver vos données pour nous conformer
                        aux lois applicables), résoudre les litiges et appliquer nos accords et politiques juridiques.
                    </Paragraph>
                    {this.renderSubheading('Transfert de vos données personnelles')}
                    <Paragraph>
                        Vos informations, y compris les données personnelles, sont traitées dans les bureaux
                        d'exploitation de la société et dans tout autre lieu où se trouvent les parties impliquées dans
                        le traitement. Cela signifie que ces informations peuvent être transférées et conservées sur
                        des ordinateurs situés en dehors de votre état, province, pays ou autre juridiction
                        gouvernementale où les lois sur la protection des données peuvent différer de celles de
                        votre juridiction.
                        Votre consentement à cette politique de confidentialité suivi de votre soumission de ces
                        informations représente votre accord à ce transfert.
                        La société prendra toutes les mesures raisonnablement nécessaires pour garantir que vos
                        données sont traitées en toute sécurité et conformément à la présente politique de
                        confidentialité et aucun transfert de vos données personnelles n'aura lieu vers une
                        organisation ou un pays à moins que des contrôles adéquats ne soient en place, y compris la
                        sécurité de Vos données et autres informations personnelles.
                    </Paragraph>
                    {this.renderSubheading('Suppression de vos données personnelles')}
                    <Paragraph>
                        Si vous résidez dans l'Espace économique européen (EEE), vous disposez de certains droits
                        en matière de protection des données. Si vous souhaitez être informé des informations
                        personnelles que nous détenons à votre sujet et si vous souhaitez qu'elles soient
                        supprimées de nos systèmes, veuillez nous contacter.
                        Dans certaines circonstances, vous disposez des droits suivants en matière de protection
                        des données :
                    </Paragraph>
                    <BulletPoints
                        bulletpoints={[
                            "Le droit d'accéder, de mettre à jour ou de supprimer les informations que nous avons sur vous.",
                            "Le droit de rectification.",
                            "Le droit d'opposition.",
                            "Le droit de restriction.",
                            "Le droit à la portabilité des données",
                            "Le droit de retirer son consentement",
                        ]}
                    />
                    <Paragraph>
                        Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée et au règlement
                        n°2016/679 dit Règlement Général sur la Protection des Données (RGPD) , vous disposez
                        d’un droit d’accès, de rectification, de portabilité ou de suppression des informations vous
                        concernant. Vous pouvez exercer vos droits et obtenir communication des informations
                        vous concernant, en adressant un courriel à support@eqx-software.com. Pour des motifs
                        légitimes, vous avez également un droit d’opposition au traitement des données vous
                        concernant.
                    </Paragraph>
                    {this.renderSubheading("Divulgation de vos données personnelles")}
                    {this.renderSmallSubheading("Transactions commerciales")}
                    <Paragraph>
                        Si la Société est impliquée dans une fusion, une acquisition ou une vente d'actifs, Vos
                        Données Personnelles peuvent être transférées. Nous vous informerons avant que vos
                        données personnelles ne soient transférées et soumises à une politique de confidentialité
                        différente.
                    </Paragraph>
                    {this.renderSmallSubheading("Forces de l’ordre")}
                    <Paragraph>
                        Dans certaines circonstances, la Société peut être tenue de divulguer vos données
                        personnelles si la loi l'exige ou en réponse à des demandes valables d'autorités publiques
                        (par exemple, un tribunal ou une agence gouvernementale).
                    </Paragraph>
                    {this.renderSmallSubheading("Autres exigences légales")}
                    <Paragraph>
                        La Société peut divulguer vos données personnelles en croyant de bonne foi qu'une telle
                        action est nécessaire pour :
                    </Paragraph>
                    <BulletPoints
                        bulletpoints={[
                            "Se conformer à une obligation légale",
                            "Protéger et défendre les droits ou la propriété de la Société",
                            "Prévenir ou enquêter sur d'éventuels actes répréhensibles en rapport avec le Service",
                            "Protéger la sécurité personnelle des Utilisateurs du Service ou du public",
                            "Protéger contre la responsabilité légale",
                        ]}
                    />
                    {this.renderSmallSubheading("Sécurité de vos données personnelles")}
                    <Paragraph>
                        La sécurité de vos données personnelles est importante pour nous, mais n'oubliez pas
                        qu'aucune méthode de transmission sur Internet ou méthode de stockage électronique n'est
                        sécurisée à 100 %. Bien que nous nous efforcions d'utiliser des moyens commercialement
                        acceptables pour protéger vos données personnelles, nous ne pouvons garantir leur
                        sécurité absolue.
                    </Paragraph>
                </View>

                {this.renderTitle("Informations détaillées sur le traitement de vos données personnelles")}
                <Paragraph>
                    Les prestataires de services que nous utilisons peuvent avoir accès à vos données
                    personnelles. Ces fournisseurs tiers collectent, stockent, utilisent, traitent et transfèrent des
                    informations sur votre activité sur notre service conformément à leurs politiques de
                    confidentialité.
                </Paragraph>
                {this.renderSubheading("Utilisation, Performances et Divers")}
                <Paragraph>
                    Nous pouvons utiliser des fournisseurs de services tiers pour fournir une meilleure
                    amélioration de notre service.
                </Paragraph>

                <Paragraph style={{ fontWeight: "bold" }}>➢ Apple Maps</Paragraph>
                <Paragraph>
                    Synergys utilise Apple Maps afin de fournir une interface de carte géographique
                    permettant à l’utilisateur de marquer une localisation. Celle-ci représente des
                    coordonnées (longitude, latitude), l’ID du lieu, et l’adresse (description) du lieu
                    sélectionné. Ces données ne sont utilisées qu’à des fins commerciales. En effet, nous
                    avons besoin de la précision de l’adresse fournie par nos clients afin que nos
                    techniciens puissent localiser le lieu. Nous pouvons ainsi opérer et réaliser nos
                    prestations de services sur le lieu renseigné (toujours par le consentement du
                    client).
                </Paragraph>
                <Paragraph style={{ fontWeight: "bold" }}>➢ Google APIs</Paragraph>
                <Paragraph>
                    Google Places est un service qui renvoie des informations sur les lieux à
                    l'aide de requêtes HTTP. Il est exploité par Google. Dans l’application Synergys,
                    Google Places est utilisé pour implémenter la fonctionnalité de saisie automatique
                    des adresses.
                    Le service Google Places peut collecter des informations auprès de vous et de votre
                    appareil à des fins de sécurité.
                    Les informations recueillies par Google Places sont conservées conformément à la
                    politique de confidentialité de Google {this.renderLink("https://www.google.com/intl/en/policies/privacy/")}
                    Nous utilisons d'autres API Google en vue de convertir le nom d’une adresse physique en ses
                    coordonnées (latitude, longitude) et vice-versa. Ces données ne sont utilisées qu’à
                    des fins commerciales. En effet, nous avons besoin de la précision de l’adresse
                    fournie par nos clients afin que nos techniciens puissent localiser le lieu. Nous
                    pouvons ainsi opérer et réaliser nos prestations de services sur le lieu renseigné
                    (toujours par le consentement du client).
                </Paragraph>
                <Paragraph style={{ fontWeight: "bold" }}>➢ Firebase Authentication</Paragraph>

                <Paragraph style={{ textDecorationLine: "underline" }}>Données personnelles utilisées :</Paragraph>
                <BulletPoints
                    bulletpoints={[
                        "Mots de passe",
                        "Adresses mail",
                        "Agents utilisateurs",
                        "Adresses IP",
                    ]}
                />
                <Paragraph style={{ textDecorationLine: "underline" }}>Comment les données aident à fournir le service :</Paragraph>
                <Paragraph>
                    {bold("Utilité :")} Firebase Authentication utilise les données pour activer votre
                    authentification de et faciliter la gestion de votre compte. Il utilise également des
                    chaînes d'agent utilisateur et des adresses IP pour fournir une sécurité
                    supplémentaire et empêcher les abus lors de l'inscription et de l'authentification.
                    {bold("Conservation :")} Firebase Authentication conserve les adresses IP enregistrées
                    pendant quelques semaines. Il conserve d'autres informations d'authentification
                    jusqu'à ce que le client Firebase initie la suppression de l'utilisateur associé, après
                    quoi les données sont supprimées des systèmes en direct et de sauvegarde dans les
                    180 jours.
                </Paragraph>


                <Paragraph style={{ fontWeight: "bold" }}>➢ Firebase Crashlytics</Paragraph>

                <Paragraph style={{ textDecorationLine: "underline" }}>Données personnelles utilisées :</Paragraph>
                <BulletPoints
                    bulletpoints={[
                        "Nom et numéro de version du système d'exploitation de l'appareil",
                        "UUID d'installation Crashlytics",
                        "L'identifiant du bundle de l'application et le numéro de version complet",
                        "Le nom du modèle de l'appareil, l'architecture du processeur, la quantité de RAM et d'espace disque",
                        "Données au format Breakpad minidump (Plantages NDK uniquement)",
                    ]}
                />
                <Paragraph style={{ textDecorationLine: "underline" }}>Comment les données aident à fournir le service :</Paragraph>
                <Paragraph>
                    {bold("Utilité :")} Firebase Crashlytics utilise les traces de la pile de plantages pour associer
                    les plantages à un projet, envoyer des alertes par e-mail aux membres du projet et
                    les afficher dans la console Firebase, et nous aider à déboguer les plantages. Il utilise
                    les UUID d'installation Crashlytics pour mesurer le nombre d'utilisateurs touchés
                    par un plantage et les données minidump pour traiter les plantages NDK. Les
                    données du minidump sont stockées pendant le traitement de la session de
                    plantage, puis supprimées. Reportez-vous à la section
                    {this.renderLink("https://firebase.google.com/support/privacy#crash-stored-info")} pour plus de
                    détails sur les types d'informations utilisateur collectées.
                    {bold("Conservation :")} Firebase Authentication conserve les adresses IP enregistrées
                    pendant quelques semaines. Il conserve d'autres informations d'authentification
                    jusqu'à ce que le client Firebase initie la suppression de l'utilisateur associé, après
                    quoi les données sont supprimées des systèmes en direct et de sauvegarde dans les
                    180 jours.
                </Paragraph>
                <Paragraph>
                    Les données que vous saisissez via les formulaires (simulation, live chat, messagerie, projets, etc) ainsi que les
                    photos et documents que vous partagez avec nous sont stockées avec sécurité respectivement dans notre base de
                    donnees et notre serveur de stockage Cloud Firebase. Vos données ne sont utilisées qu'à des fins de réalisation de nos prestation de services à votre egard.
                    Pour plus de détails par rapport à la politique de confidentialité des services de Firebase,
                    veuillez consulter les liens suivants : {this.renderLink("https://firebase.google.com/support/privacy")}
                    {this.renderLink("https://firebase.google.com/docs/ios/app-store-data-collection")}
                </Paragraph>
                {this.renderTitle("Confidentialité des enfants")}
                <Paragraph>
                    Notre service ne s'adresse pas aux personnes de moins de 13 ans. Nous ne collectons pas
                    sciemment d'informations personnellement identifiables auprès de personnes de moins de
                    13 ans. Si vous êtes un parent ou un tuteur et que vous savez que votre enfant nous a fourni
                    des données personnelles, veuillez Nous contacter. Si nous apprenons que nous avons
                    collecté des données personnelles auprès d'une personne de moins de 13 ans sans
                    vérification du consentement parental, nous prenons des mesures pour supprimer ces
                    informations de nos serveurs.
                    Si nous devons nous fier au consentement comme base légale pour le traitement de vos
                    informations et que votre pays exige le consentement d'un parent, nous pouvons exiger le
                    consentement de votre parent avant de collecter et d'utiliser ces informations.
                </Paragraph>
                {this.renderTitle("Liens vers d’autre sites web")}
                <Paragraph>
                    Notre service peut contenir des liens vers d'autres sites Web qui ne sont pas exploités par
                    nous. Si vous cliquez sur un lien tiers, vous serez dirigé vers le site de ce tiers. Nous vous
                    conseillons vivement de consulter la politique de confidentialité de chaque site que vous
                    visitez.
                    Nous n'avons aucun contrôle et n'assumons aucune responsabilité quant au contenu, aux
                    politiques de confidentialité ou aux pratiques des sites ou services tiers.
                </Paragraph>
                {this.renderTitle("Modifications de cette politique de confidentialité")}
                <Paragraph>
                    Nous pouvons mettre à jour notre politique de confidentialité de temps à autre. Nous vous
                    informerons de tout changement en publiant la nouvelle politique de confidentialité sur
                    cette page.
                    Nous vous informerons par e-mail et/ou par un avis visible sur notre service, avant que le
                    changement ne devienne effectif et mettrons à jour la date de « dernière mise à jour » en
                    haut de cette politique de confidentialité.
                    Il vous est conseillé de consulter périodiquement cette politique de confidentialité pour tout
                    changement. Les modifications apportées à cette politique de confidentialité entrent en
                    vigueur lorsqu'elles sont publiées sur cette page.
                </Paragraph>
                {this.renderTitle("Consentement")}
                <Paragraph>
                    En utilisant notre site Web, vous consentez par la présente à notre politique de
                    confidentialité et acceptez ses conditions.
                </Paragraph>
                {this.renderTitle("Nous contacter")}
                <Paragraph>
                    Si vous avez des questions concernant cette politique de confidentialité, vous pouvez nous
                    contacter :{br(1)}
                    ➢ Par email: support@eqx-software.com
                </Paragraph>
            </ScrollView >
        )
    }

    render() {
        return this.renderPrivacyPolicy()
    }

}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    tcContainer: {
        flex: 1
    },
    article: {
        marginBottom: 15
    },
    header: {
        marginBottom: 5
    }
})
