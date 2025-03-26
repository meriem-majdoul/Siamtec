//Conditionnal rendering depending on USER ROLE

import React, { memo } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native'
import { FAB } from 'react-native-paper'
import Animated from 'react-native-reanimated';

import Appbar from './Appbar'
import TabView from './TabView'

import ListUsers from '../screens/Users/ListUsers';
import ListTeams from '../screens/Users/ListTeams';
import Icon3 from 'react-native-vector-icons/Entypo';
import { SceneMap } from 'react-native-tab-view';


import * as theme from "../core/theme";
import { constants } from "../core/constants";

const initialLayout = { width: constants.ScreenWidth }

class TwoTabs extends React.Component {

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Appbar menu title= {this.props.title} titleText = {this.props.titleText} search= {!this.props.showInput} searchBar= {this.props.showInput} handleSearch= {this.props.handleSearch}/>
                <TabView
                    renderScene={this.renderScene}
                    routes={[
                        { key: 'first', title: this.props.firstTitle },
                        { key: 'second', title: this.props.secondTitle },
                    ]}
                    Tab1={this.props.Tab1}
                    Tab2={this.props.Tab2} />
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        //paddingTop: Constants.statusBarHeight,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
    },
});

export default TwoTabs













//PASSING PROPS
// const renderScene = ({ route }) => {
//     switch (route.key) {
//       case 'first':
//         return <FirstRoute foo={this.props.foo} />;
//       case 'second':
//         return <SecondRoute />;
//       default:
//         return null;
//     }
//   };






