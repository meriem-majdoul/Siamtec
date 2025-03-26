import React, { Component } from 'react'
import { TouchableOpacity } from 'react-native'
import { Card } from 'native-base'
import Icon1 from 'react-native-vector-icons/Entypo'
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import PropTypes from 'prop-types'

import Email from './Email'
import Separator from './Separator'
import Tel from '../../Profile/Tel'
import * as theme from '../../../core/theme'
import firebase from '@react-native-firebase/app'

class Profile extends Component {

  renderHeader = () => {
    const {
      avatar,
      avatarBackground,
      name,
      // address: { city, country },
    } = this.props

    return (
      <View style={styles.headerContainer}>
        <ImageBackground
          style={styles.headerBackgroundImage}
          blurRadius={10}
          source={require('../../assets/ProfileBackground.jpg')}>
          <View style={styles.headerColumn}>
            <Image
              style={styles.userImage}
              source={require('../../assets/avatar.png')}
            />
            <Text style={styles.userNameText}>{name}</Text>
            <View style={styles.userAddressRow}>
            </View>
            <View style={styles.userCityRow}>
              <Text style={styles.userCityText}>Directeur commercial</Text>
            </View>

          </View>

        </ImageBackground>
      </View>
    )
  }


  renderField(iconName, value) {
    return (
      <View style={[fieldStyles.container]}>
        <View style={fieldStyles.iconRow}>
          {iconName === 'location-pin' || iconName === 'user' ?
            <Icon1
              name={iconName}
              size={19}
            />
            :
            <Icon2
              name={iconName}
              size={19}
            />
          }
        </View>

        <View style={fieldStyles.fieldRow}>
          <View style={fieldStyles.fieldColumn}>
            <Text style={fieldStyles.fieldText}>{value}</Text>
          </View>
        </View>
      </View>
    )
  }

  render() {
    return (
      <ScrollView style={styles.scroll}>
        <View style={styles.container}>
          {this.renderHeader()}
            <Card style={{ marginLeft: 13, marginTop: 13, marginRight: 13, padding: 10, paddingLeft: 20 }} containerStyle={styles.cardContainer}>
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: theme.colors.primary }}>Informations générales</Text>
              </View>
              <Separator/>
              {this.renderField('user',  firebase.auth().currentUser.uid)}
              <Separator width={'77%'} />
              {this.renderField('email', 'rose@gmail.com')}
              <Separator width={'77%'} />
              {this.renderField('phone', '+33-621581718')}
              <Separator width={'77%'} />
              {this.renderField('location-pin', '2, Rue de la soie, Paris')}
              <Separator width={'77%'} />
              {this.renderField('lock', 'Modifier le mot de passe')}
            </Card>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFF',
    borderWidth: 0,
    flex: 1,
    margin: 0,
    padding: 0,
  },
  container: {
    flex: 1,
  },
  emailContainer: {
    backgroundColor: '#FFF',
    flex: 1,
    paddingTop: 30,
  },
  headerBackgroundImage: {
    paddingBottom: 19,
    paddingTop: 19,
  },
  headerContainer: {},
  headerColumn: {
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        alignItems: 'center',
        elevation: 1,
        marginTop: -1,
      },
      android: {
        alignItems: 'center',
      },
    }),
  },
  placeIcon: {
    color: 'white',
    fontSize: 26,
  },
  scroll: {
    backgroundColor: '#FFF',
  },
  telContainer: {
    backgroundColor: '#FFF',
    flex: 1,
    paddingTop: 30,
  },
  userAddressRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  userCityRow: {
    backgroundColor: 'transparent',
  },
  userCityText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  userImage: {
    borderColor: '#FFF',
    borderRadius: 85,
    borderWidth: 3,
    height: 120,
    marginBottom: 15,
    width: 120,
  },
  userNameText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    paddingBottom: 8,
    textAlign: 'center',
  },
})

const fieldStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 20,
  },
  fieldColumn: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 5,
  },
  emailIcon: {
    color: 'gray',
    fontSize: 30,
  },
  emailNameColumn: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  emailNameText: {
    color: 'gray',
    fontSize: 14,
    fontWeight: '200',
  },
  fieldRow: {
    flex: 8,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  fieldText: {
    fontSize: 14,
  },
  iconRow: {
    flex: 2,
    justifyContent: 'center',
  },
})

export default Profile
