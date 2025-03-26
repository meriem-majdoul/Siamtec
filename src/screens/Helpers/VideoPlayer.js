// At the top where our imports are...
import React, { Component } from 'react'
import { View, StyleSheet, Text } from 'react-native'
// import Video from 'react-native-video-controls'

import Toast from '../../components/Toast'
import { constants } from '../../core/constants'
import { downloadFile, setToast } from '../../core/utils'

import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

export default class VideoPlayer extends Component {
    constructor(props) {
        super(props)
        this.videoUrl = this.props.navigation.getParam('videoUrl', '')

        this.state = {
            toastMessage: '',
            toastType: ''
        }
    }

    handleDownload() {
        setToast(this, 'i', 'Début du téléchargement...')
        downloadFile(`video_${moment().format('DD_MM_YYYY_HH_mm')}`, this.videoUrl)
    }

    render() {

        const { toastMessage, toastType } = this.state

        return (
            <View style={styles.container}>
                {/* <Video
                    source={{ uri: this.videoUrl }}
                    navigator={this.props.navigation}
                    pause={true}
                    disableVolume={true}
                    disableBack={true}
                    disableDownload={false}
                    handleDownload={this.handleDownload.bind(this)}
                /> */}
<Text>Cette fonctionnalité va bientôt mettre à jour</Text>
                <Toast
                    containerStyle={{ bottom: constants.ScreenWidth * 0.6 }}
                    message={toastMessage}
                    type={toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})