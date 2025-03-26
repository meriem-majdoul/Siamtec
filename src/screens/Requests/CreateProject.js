import React, { Component } from 'react';
import CreateRequest from './CreateRequest'

class CreateProject extends Component {

    render() {
        return <CreateRequest requestType='project' navigation={this.props.navigation} />
    }
}

export default CreateProject

