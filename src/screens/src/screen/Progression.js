import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import ProcessAction from '../../../screens/Process/container/ProcessAction';
import { Appbar } from '../../../components';
import * as theme from '../../../core/theme'

export default class Progression extends Component {

  constructor(props) {
    super(props);
    const { route } = this.props;
    this.process = route.params?.process ?? '';
    this.project = route.params?.project ?? '';
    this.clientId = route.params?.clientId ?? '';
    this.step = route.params?.step ?? '';
    this.canUpdate = route.params?.canUpdate ?? '';
    this.role = route.params?.role ?? '';
}


  render() {

    return (
      <View style={styles.container} >
        <Appbar back title titleText='Progression' />
        <ProcessAction
          process={this.process}
          project={this.project}
          clientId={this.clientId}
          step={this.step}
          canUpdate={this.canUpdate}
          role={this.role}
          isAllProcess={true}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
});
