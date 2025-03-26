import React, { Component } from 'react'
import ListRequests from './ListResquests'
import { withNavigation } from 'react-navigation'

class ListProjects extends Component {
    render() {
        return (
            <ListRequests
                searchInput={this.props.searchInput}
                requestType='project'
                creationScreen='CreateProjectReq'
                offLine={this.props.offLine}
                permissions={this.props.permissions} 
                role= {this.props.role}/>
        )
    }
}

export default withNavigation(ListProjects)