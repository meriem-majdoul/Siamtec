import React, { Component } from 'react';
import { StatusBar, SafeAreaView } from 'react-native';
import { connect } from 'react-redux'

class MyStatusBar extends Component {

    render() {
        const { statusBar, children } = this.props
        const { backgroundColor, barStyle } = statusBar

        return (
            <SafeAreaView style={{ flex: 1, backgroundColor }}>
                <StatusBar
                    backgroundColor={backgroundColor}
                    barStyle={barStyle}
                />
                {children}
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        statusBar: state.statusBar
    }
}

export default connect(mapStateToProps)(MyStatusBar)
