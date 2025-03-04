// screens/ViewNews.js
import React, { Component } from 'react'
import { View, StyleSheet, SafeAreaView, ScrollView, Dimensions, } from 'react-native'
import HTML from 'react-native-render-html'

import Appbar from '../../components/Appbar'

import { constants } from '../../core/constants'

export default class ViewNews extends Component {

    constructor(props) {
        super(props);
        this.newspost = this.props.navigation.getParam('newspost', {})

        this.state = {
            newspost: [],
        }
    }

    onLinkPress(href) {
        console.log(href)
    }

    render() {
        const regex = /[!@#$%^&*<>0-9;]/g
        console.log(this.newspost.postContent)

        return (
            <SafeAreaView style={styles.safeArea}>
                <Appbar back title titleText={this.newspost.postTitle} />

                <ScrollView>
                    {
                        <View style={{ paddingHorizontal: 20, marginTop: -constants.ScreenHeight * 0.04 }}>
                            <HTML
                                // tagsStyles={{
                                //     // h1: { fontSize: 50 },
                                //     // body: { fontSize: 20 },
                                //     // p: { fontSize: 20, fontWeight: "normal" },
                                //     // strong: { fontSize: 20, },
                                //     // blockquote: { fontSize: 20 },
                                //     // a: { fontSize: 20, color: "#000" },
                                //     // em: { fontSize: 20, },
                                //     img: { height: constants.ScreenHeight * 0.25, width: constants.ScreenWidth * 0.9 },
                                // }}
                                //styleName="paper md-gutter multiline"
                                source={{ html: this.newspost.postContent }}
                                // imagesMaxWidth={Dimensions.get('window').width * 0.5}
                                // ignoredStyles={['width', 'height', 'video']}
                                // onLinkPress={(evt, href) => this.onLinkPress(href)}
                            />
                            {/* <Divider styleName="line" /> */}
                        </View>
                    }
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // 1:1
        flexDirection: 'column',
        backgroundColor: '#fff'
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff'
    },
})