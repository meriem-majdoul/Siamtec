import React from 'react';
import { StyleSheet, View, Dimensions, Alert } from 'react-native';
import firebase from '@react-native-firebase/app'
import Geocoder from 'react-native-geocoding'
import MapView, { Marker, ProviderPropType, PROVIDER_GOOGLE } from 'react-native-maps';

import AddressSearch from '../../components/AddressSearch'
import Appbar from '../../components/Appbar'
import Loading from "../../components/Loading"

import * as theme from "../../core/theme"
import { constants } from '../../core/constants'

Geocoder.init("AIzaSyDKYloIbFHpaNh5QWGa7CWjKr8v-3aiu80", { language: "fr" })

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 43.184277; //Narbonne
const LONGITUDE = 3.003078;  //Narbonne
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01

const db = firebase.firestore()

class MarkerTypes extends React.Component {
    constructor(props) {
        super(props)
        this.getCurrentPosition = this.getCurrentPosition.bind(this)
        this.onRegionChange = this.onRegionChange.bind(this)
        this.onChangePosition = this.onChangePosition.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.prevScreen = this.props.navigation.getParam('prevScreen', '')
        this.userId = this.props.navigation.getParam('userId', '')
        this.currentAddress = this.props.navigation.getParam('currentAddress', '')

        this.state = {
            region: {
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            },
            marker: {
                latitude: LATITUDE + SPACE,
                longitude: LONGITUDE + SPACE,
            },
            address: { description: '', place_id: '' },
            showInput: false,

            loading: false
        }
    }

    componentDidMount() {
        this.getCurrentPosition()
    }

    getCurrentPosition() {
        if (this.currentAddress.description) {
            let marker = {
                latitude: this.currentAddress.marker.latitude,
                longitude: this.currentAddress.marker.longitude
            }

            let region = marker
            region.latitudeDelta = 0.0143
            region.longitudeDelta = 0.0134

            const address = { description: this.currentAddress.description, place_id: this.currentAddress.place_id }

            this.setState({ region, marker, address })
        }
    }

    onRegionChange(region) {
        this.setState({ region })
    }

    handleSubmit() {
        if(this.state.loading) return
    
        const { address, marker } = this.state

        address.marker = marker

        if (address.description === '') {
            Alert.alert('Veuillez choisir une adresse correcte.')
            return
        }

        this.setState({ loading: true })

        if (this.prevScreen === 'Profile') {

            if (address.description !== this.currentAddress.description)
                db.collection('Users').doc(this.userId).update({ address: address })
                    .then(() => this.props.navigation.goBack())
                    .catch((e) => Alert.alert(e))
                    .finally(() => this.setState({ loading: false }))

            else Alert.alert("Veuillez modifier votre adresse actuelle avant de valider.")
        }

        else {
            this.props.navigation.state.params.onGoBack(address)
            this.props.navigation.goBack()
        }

        this.setState({ loading: false })
    }

    onChangePosition(e) {
        const lat = e.nativeEvent.coordinate.latitude
        const lng = e.nativeEvent.coordinate.longitude

        Geocoder.from(lat, lng)
            .then(json => {
                var addressComponent = json.results[0]
                const address = { description: addressComponent.formatted_address, place_id: addressComponent.place_id }
                this.setState({ address })
            })
            .catch(error => console.warn(error))

        this.setState({ marker: e.nativeEvent.coordinate })
    }

    render() {
        let { showInput, loading } = this.state

        return (
            <View style={{ flex: 1 }}>

                {showInput ?
                    <AddressSearch
                        main={this}
                        handleSubmit={this.handleSubmit}
                        showInput={showInput}
                        hideInput={() => this.setState({ showInput: false })} />
                    :
                    <Appbar back={!loading} close title titleText="Modifier l'adresse" check={!loading} handleSubmit={this.handleSubmit} search={!showInput && !loading} handleSearch={() => this.setState({ showInput: true })} />
                }

                {!loading  ?
                    <View style={{ flex: 1 }}>
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: LATITUDE,
                                longitude: LONGITUDE,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA,
                            }}
                            region={this.state.region}
                            onRegionChange={(region) => console.log(region)}
                            onRegionChangeComplete={(region) => this.setState({ region })}
                            ref={ref => this.map = ref}
                            onPress={e => this.onChangePosition(e)} //update marker
                        >
                            <Marker
                                coordinate={this.state.marker}
                                onDragEnd={(e) => this.onChangePosition(e)}
                                draggable>
                            </Marker>
                        </MapView>
                    </View>
                   
                   :
                    <Loading size='large' />
                }

            </View>
        )
    }
}

MarkerTypes.propTypes = {
    provider: ProviderPropType,
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default MarkerTypes;