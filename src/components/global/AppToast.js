import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import { constants } from '../../core/constants'
import Toast from '../Toast'


class AppToast extends Component {

    dismissToast() {
        const action = {
            type: "TOAST",
            value: { message: "", type: "" }
        }
        this.props.dispatch(action)
    }

    render() {

        return (
            <Toast
                containerStyle={{ bottom: constants.ScreenWidth * 0.6 }}
                message={this.props.toast.message}
                type={this.props.toast.type}
                onDismiss={() => this.dismissToast()} />
        )
    }
}

const mapStateToProps = (state) => {
    return {
        toast: state.toast,
    }
}

export default connect(mapStateToProps)(AppToast)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

