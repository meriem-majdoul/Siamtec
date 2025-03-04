import React, { Component } from 'react';
import { connect } from 'react-redux'
import CreateRequest from './CreateRequest'

class CreateTicket extends Component {

    render() {
        return <CreateRequest requestType='ticket' navigation={this.props.navigation} />
    }
}


const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(CreateTicket)

