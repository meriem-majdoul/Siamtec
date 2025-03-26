
import React from 'react'
import { View, Text, TouchableHighlight, TextInput, StyleSheet, Dimensions } from 'react-native'

import firebase from '@react-native-firebase/app'

const functions = firebase.functions()

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default class CustomClaims extends React.Component {
    constructor(props) {
        super(props);
        // this.addAdminRole = this.addAdminRole.bind(this);
        // this.setCustomUid = this.setCustomUid.bind(this);
        this.setAdminClaims = this.setAdminClaims.bind(this);

        this.state = {
            email: '',
            errorMessage: '',
            synuid: ''
        }
    }

    async componentDidMount() {
        await firebase.firestore().collection('Users').where('email', '==', 'salimlyoussi1@gmail.com').get()
            .then((querysnapshot) => {
                if (!querysnapshot.empty) {
                    let synuid = querysnapshot.docs[0].id
                    this.setState({ synuid })
                }
            })
    }

    // addAdminRole() {
    //     console.log('Adding admin role')
    //     const addAdminRole = functions.httpsCallable('addAdminRole')
    //     addAdminRole({ email: 'salimlyoussi1@gmail.com' }).then(result => {
    //         console.log(result)
    //         firebase.auth().currentUser.getIdToken(true)
    //             .then(() => firebase.auth().currentUser.getIdTokenResult().then((IdToken) => {
    //                 console.log('admin: ' + IdToken.claims.admin)
    //                 console.log('synuid: ' + IdToken.claims.synuid)
    //             }))
    //     }).catch(err => console.error(err))
    // }

    // setCustomUid() {
    //     console.log('Setting custom uid')
    //     const setCustomUid = functions.httpsCallable('setCustomUid')
    //     setCustomUid({ synuid: this.state.synuid, email: 'salimlyoussi1@gmail.com' }).then(result => {
    //         console.log(result)
    //         firebase.auth().currentUser.getIdToken(true)
    //             .then(() => firebase.auth().currentUser.getIdTokenResult().then((IdToken) => {
    //                 console.log('admin: ' + IdToken.claims.admin)
    //                 console.log('synuid: ' + IdToken.claims.synuid)
    //             }))
    //     }).catch(err => console.error(err))
    // }

    setAdminClaims() {
        console.log('Setting custom uid')
        const setAdminClaims = functions.httpsCallable('setAdminClaims')
        setAdminClaims({ synuid: this.state.synuid, email: 'salimlyoussi1@gmail.com' }).then(result => {
            console.log(result)
            firebase.auth().currentUser.getIdToken(true)
                .then(() => firebase.auth().currentUser.getIdTokenResult().then((IdToken) => {
                    console.log('admin: ' + IdToken.claims.admin)
                    console.log('synuid: ' + IdToken.claims.synuid)
                }))
        }).catch(err => console.error(err))
    }

    render() {
        console.log(this.state)
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>salimlyoussi1@gmail.com</Text>
                    {/* <TouchableHighlight
                        onPress={this.addAdminRole}>
                        <Text style={styles.buttonText}> Add Admin Role </Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        onPress={this.setCustomUid}>
                        <Text style={styles.buttonText}> Add Custom UID </Text>
                    </TouchableHighlight> */}
                    <TouchableHighlight
                        onPress={this.setAdminClaims}>
                        <Text style={styles.buttonText}> Add Admin role and Custom UID </Text>
                    </TouchableHighlight>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    buttonText: {
        textAlign: 'center',
        margin: SCREEN_WIDTH * 0.025,
        marginBottom: 50,
        backgroundColor: 'transparent',
    }
});

