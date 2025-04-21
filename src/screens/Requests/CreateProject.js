import React, { Component } from 'react';
import CreateRequest from './CreateRequest';

class CreateProject extends Component {
    render() {
        const { route, navigation } = this.props;
        const requestId = route?.params?.RequestId || null; // Accès aux paramètres via route.params

        return (
            <CreateRequest
                requestType="project"
                requestId={requestId}
                navigation={navigation}
            />
        );
    }
}

export default CreateProject;
