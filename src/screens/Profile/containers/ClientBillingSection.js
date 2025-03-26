import React, { Component } from 'react'
import { StyleSheet, TouchableOpacity, View, Text, Keyboard } from 'react-native'
import _ from 'lodash'
import { faPlusCircle } from 'react-native-vector-icons/FontAwesome5'
import { faCheck, faMoneyBill, faTimes } from 'react-native-vector-icons/FontAwesome5'
import { connect } from 'react-redux'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import TimeslotForm from '../../../components/TimeslotForm'
import CustomIcon from '../../../components/CustomIcon'
import FormSection from '../../../components/FormSection'
import MyInput from '../../../components/TextInput'
import Loading from "../../../components/Loading"

import firebase, { db, auth } from '../../../firebase'
import * as theme from "../../../core/theme"
import { constants, errorMessages } from '../../../core/constants'
import { displayError, load, nameValidator } from '../../../core/utils'
import { setAppToast } from '../../../core/redux'


const defaultState = {
    newPayment: {
        date: { value: moment().format(), error: "" },
        payer: { value: "", error: "" },
        amount: { value: "", error: "" },
    }
}

class ClientBillingSection extends Component {

    constructor(props) {
        super(props)
        this.resetForm = this.resetForm.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.isCurrentUserBackOffice = this.props.role.id === "admin" //##task: change to backoffice
        this.queryPayments = db.collection("Clients").doc(this.props.ClientId).collection("Payments")
        this.initialState = {}
        this.state = {
            newPayment: defaultState.newPayment,
            payments: [
                // { date: "03-06-2022", payer: "Didier Prune", amount: 4000 },
                // { date: "02-06-2022", payer: "Didier Prune", amount: 2000 },
            ],
            isFormVisible: false,
            loading: true,
        }
    }

    componentDidMount() {
        //Fetch payments
        this.fetchPayments()
        load(this, false)
    }

    fetchPayments() {
        let payments = []
        this.queryPayments.orderBy("date", "desc").get().then((querySnapshot) => {
            for (const doc of querySnapshot.docs) {
                const payment = doc.data()
                payments.push(payment)
            }
            this.setState({ payments })
        })
    }

    handleSubmit() {
        try {
            Keyboard.dismiss()
            if (this.state.loading || _.isEqual(this.state, this.initialState)) return
            load(this, true)
            //Validation
            const isValid = this.validateInputs()
            if (!isValid) {
                const errorToast = { message: errorMessages.fields.empty, type: "error" }
                setAppToast(this, errorToast)
                return
            }
            //Format data
            let { newPayment, payments } = this.state
            const payment = {
                date: moment(newPayment.date.value).format("DD-MM-YYYY"),
                payer: newPayment.payer.value,
                amount: newPayment.amount.value
            }
            //Persist
            this.queryPayments.doc().set(payment, { merge: true })

            //Handlers
            this.fetchPayments()
            this.setState(payments)
            this.resetForm()
            const successToast = { message: "Paiement ajouté avec succès", type: "success" }
            setAppToast(this, successToast)
        }
        catch (e) {
            displayError({ message: "Erreur inattendue, veuillez réessayer..." })
        }
        finally {
            load(this, false)
        }
    }

    validateInputs() {
        let payerError = ''
        let amountError = ''
        const { newPayment } = this.state
        payerError = nameValidator(newPayment.payer.value, '"Payeur"')
        amountError = nameValidator(newPayment.amount.value, '"Montant"')
        if (payerError || amountError) {
            newPayment.payer.error = payerError
            newPayment.amount.error = amountError
            this.setState({ newPayment })
            return false
        }
        return true
    }

    resetForm() {
        this.setState({
            isFormVisible: false,
            newPayment: {
                date: { value: moment().format(), error: "" },
                payer: { value: "", error: "" },
                amount: { value: "", error: "" },
            }
        })
    }

    renderClientPaymentForm() {
        let { newPayment } = this.state

        return (
            <View style={{ flex: 1, marginBottom: theme.padding, elevation: 1 }}>
                <TimeslotForm
                    isSingleDate={true}
                    canWrite={this.props.canUpdate}
                    startDate={newPayment.date.value}
                    hideEndDate={true}
                    //startDateError = "Le champs 'Date' est obligatoire."
                    setParentState={
                        (mode, dateId, value) => {
                            const newDate = moment(value).format()
                            newPayment.date.value = newDate
                            this.setState({ newPayment })
                        }
                    }
                />
                <MyInput
                    label="Payeur *"
                    value={newPayment.payer.value}
                    onChangeText={payer => {
                        newPayment.payer.value = payer
                        this.setState({ newPayment })
                    }}
                    error={newPayment.payer.error}
                    errorText={newPayment.payer.error}
                    editable={this.props.canUpdate}
                />
                <MyInput
                    label="Montant *"
                    returnKeyType="done"
                    keyboardType="numeric"
                    value={newPayment.amount.value.toString()}
                    onChangeText={(amount) => {
                        newPayment.amount.value = amount
                        this.setState({ newPayment })
                    }}
                    error={!!newPayment.amount.error}
                    errorText={newPayment.amount.error}
                />
            </View>
        )
    }

    renderHeader(isFormVisible) {
        return (
            <View style={styles.container}>
                {isFormVisible ?
                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                        <CustomIcon onPress={this.resetForm}
                            icon={faTimes}
                            color={theme.colors.error}
                            style={{ marginRight: theme.padding / 1.8 }}
                        />
                        <CustomIcon
                            onPress={this.handleSubmit}
                            icon={faCheck}
                            color={theme.colors.primary}
                        />
                    </View>
                    :
                    <TouchableOpacity
                        onPress={() => this.setState({ isFormVisible: true })}
                        style={{ flexDirection: "row", marginBottom: 5 }}
                    >
                        <CustomIcon
                            icon={faPlusCircle}
                            color={theme.colors.primary}
                        />
                        <Text style={[theme.customFontMSbold.body, { color: theme.colors.primary, marginLeft: 10 }]}>
                            Reporter un paiement
                        </Text>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    renderPayment(payment, index) {
        const { date, payer, amount } = payment
        const textStyle = theme.customFontMSregular.body
        return (
            <TouchableOpacity
                key={index.toString()}
                style={styles.clientPaymentRow}
            >
                <Text style={[textStyle, { flex: 3, flexWrap: "wrap" }]}>{date}</Text>
                <Text style={[textStyle, { flex: 4, flexWrap: 'wrap', textAlign: "center" }]}>{payer}</Text>
                <Text style={[textStyle, { flex: 3, flexWrap: "wrap", textAlign: "right" }]}>€ {amount}</Text>
            </TouchableOpacity>
        )
    }

    renderClientPayments() {
        const { payments, loading, isFormVisible } = this.state
        const textStyle = theme.customFontMSregular.body
        return (
            <View style={{ flex: 1 }}>
                <FormSection
                    sectionTitle={`Facturation`}
                    sectionIcon={faMoneyBill}
                    formContainerStyle={{ paddingTop: theme.padding }}
                    containerStyle={{ width: constants.ScreenWidth, alignSelf: 'center', marginBottom: 2 }}
                    isExpanded={this.props.isExpanded}
                    onPressSection={() => this.props.toggleSection()}
                    form={
                        loading ?
                            <Loading style={{ marginTop: 33 }} />
                            :
                            <View style={{ flex: 1 }}>
                                {this.renderHeader(isFormVisible)}
                                {isFormVisible && this.renderClientPaymentForm()}
                                <View style={styles.clientPaymentContainer}>
                                    <View style={styles.clientPaymentHeader}>
                                        <Text style={[textStyle, { flex: 3, flexWrap: "wrap" }]}>Date</Text>
                                        <Text style={[textStyle, { flex: 4, flexWrap: 'wrap', textAlign: "center" }]}>Payeur</Text>
                                        <Text style={[textStyle, { flex: 3, flexWrap: "wrap", textAlign: "right" }]}>Montant</Text>
                                    </View>
                                    {payments.length > 0 ?
                                        payments.map((payment, index) => {
                                            return this.renderPayment(payment, index)
                                        })
                                        :
                                        <Text style={[textStyle, { textAlign: "center", paddingVertical: theme.padding, color: theme.colors.gray_dark }]}>Aucun paiement</Text>
                                    }
                                </ View>
                            </View>
                    }
                />

            </View>
        )
    }

    render() {
        return (
            this.isCurrentUserBackOffice && this.renderClientPayments()
        )
    }
}

const mapStateToProps = (state) => {

    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        currentUser: state.currentUser
        //fcmToken: state.fcmtoken
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    clientPaymentContainer: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        marginTop: 12,
        ...theme.style.shadow
    },
    clientPaymentHeader: {
        flexDirection: 'row',
        padding: theme.padding,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        justifyContent: 'space-between',
        backgroundColor: '#EAF7F1'
    },
    clientPaymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // alignItems:"center",
        padding: theme.padding,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.gray_light,
    }
})


export default connect(mapStateToProps)(ClientBillingSection)