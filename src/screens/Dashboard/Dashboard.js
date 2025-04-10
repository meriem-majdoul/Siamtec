import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import DashboardMenu from '../../components/DashboardMenu'
import { Appbar } from '../../components'
import _ from 'lodash'
import { connect } from 'react-redux'

//import { crashlytics, db } from '../../firebase';

import * as theme from '../../core/theme'
import { requestRESPermission, requestWESPermission } from '../../core/permissions'
import { setProducts } from '../../core/admin-utils';

class Dashboard extends Component {

    // backupOldProducts() {
    //     db.collection("Products").get().then((querysnapshot) => {
    //         querysnapshot.forEach((doc) => {
    //             const product = doc.data()
    //             db.collection("ProductsOld").doc(doc.id).set(product)
    //         })
    //     })
    // }

    // db.collection("Products").get().then((querysnapshot) => {
    //     console.log(querysnapshot.docs.length, '.....')
    // })

    async componentDidMount() {
        requestWESPermission()
        requestRESPermission()
        // setProducts()
    }

    render() {
        return (
            <View style={styles.container}>
                {/* <Appbar menu title="Accueil" titleText="Accueil" /> */}
                <DashboardMenu navigation={this.props.navigation} />
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        currentUser: state.currentUser,
        network: state.network,
        state: state,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(Dashboard)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
        color:theme.colors.gray_dark,
    }
    
})

