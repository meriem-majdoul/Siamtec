
import React, { Component } from 'react'
import { StyleSheet, Alert, View, Text } from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import Geocoder from 'react-native-geocoding'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import * as theme from "../core/theme"
import { constants } from '../core/constants'

Geocoder.init("AIzaSyDKYloIbFHpaNh5QWGa7CWjKr8v-3aiu80", { language: "fr" })

export default class AddressSearch extends Component {

    constructor(props) {
        super(props)
        this.state = {
            address: { description: '', place_id: '' },
            showInput: false
        }
    }


    getMapSearchStyle() {
        return {
            textInputContainer: {
                backgroundColor: 'rgba(0,0,0,0)',
                borderTopWidth: 0,
                borderBottomWidth: 0,
            },
            textInput: {
                marginLeft: 0,
                marginRight: 0,
                height: 38,
                color: '#5d5d5d',
                fontSize: 16,
            },
            predefinedPlacesDescription: {
                color: '#1faadb',
            },
        }
    }

    render() {

        const SearchInputStyle = this.getMapSearchStyle()
        let address = this.state.address
        let main = this.props.main

        return (
            <View style={{ flex: 1, zIndex: 1000, backgroundColor: "#fff" }}>

                {this.props.showInput &&
                    <GooglePlacesAutocomplete
                        placeholder='Recherchez une adresse'
                        //autoFocus 
                        autoFocus={true}
                        onPress={(data, details = null) => {
                            //'details' are provided when fetchDetails = true (it costs higher)
                            // console.log(data, details)
                            address.description = data.description
                            address.place_id = data.place_id

                            Geocoder.from(address.description)
                                .then(json => {
                                    let location = json.results[0].geometry.location
                                    // {"lat": 43.184277, "lng": 3.003078}
                                    let marker = { latitude: '', longitude: '' }
                                    let region = marker
                                    region.latitudeDelta = 0.0143
                                    region.longitudeDelta = 0.0134

                                    marker.latitude = location.lat
                                    marker.longitude = location.lng

                                    main.setState({ address, marker, region, showInput: false })
                                })
                                .catch(error => console.warn(error))
                        }}
                        onFail={(err) => {
                            console.error(err)
                            address.error = error
                            main.setState({ address })
                        }}
                        query={{
                            key: 'AIzaSyDKYloIbFHpaNh5QWGa7CWjKr8v-3aiu80',
                            language: 'fr',
                        }}

                        // styles={SearchInputStyle}
                        styles={{
                            textInputContainer: {
                                backgroundColor: '#fff',
                                borderTopWidth: 0,
                                borderBottomWidth: 0,
                                //width: constants.ScreenWidth * 0.9
                            },
                            // textInput: {
                            //     marginLeft: 0,
                            //     marginRight: 0,
                            //     marginTop: 0,
                            //    // height: 38,
                            //     color: '#5d5d5d',
                            //     fontSize: 16
                            // },
                            predefinedPlacesDescription: {
                                color: '#1faadb'
                            },
                        }}
                        renderRightButton={() => <Icon name='close' size={21} style={{ backgroundColor: '#fff', alignSelf: 'center', padding: 10 }} onPress={this.props.hideInput} />}
                    />
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({

})

