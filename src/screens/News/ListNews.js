import React, { Component } from 'react';
import { StyleSheet, SafeAreaView, FlatList, View } from 'react-native'
import { connect } from 'react-redux'

import Appbar from '../../components/Appbar'
import NewsItem from '../../components/NewsItem'
import Loading from '../../components/Loading'
import EmptyList from '../../components/EmptyList'

import { constants, errorMessages } from '../../core/constants'
import { displayError, load } from '../../core/utils'
import { Alert } from 'react-native';
import { firebase } from '@react-native-firebase/app';

class ListNews extends Component {
    constructor(props) {
        super(props)
        this.renderPost = this.renderPost.bind(this)

        this.state = {
            news: [],
            loading: false,
        }
    }

    componentDidMount() {
        const { isConnected } = this.props.network
        if (!isConnected) return
        load(this, true)
        this.fetchWordpressPosts()
    }

    fetchWordpressPosts = async () => {
        const response = await (await fetch("https://groupe-synergys.fr/wp-json/wp/v2/posts?_embed"))
        const json = await response.json().catch((e) => displayError({ message: errorMessages.wordpress.posts }))
        this.setState({ news: json, loading: false })
    }

    renderPost(post) {
        const regex = /(<([^>]+)>)/ig
        const imageUri = post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].link : ''

        let newspost = {
            postId: post.id,
            postDate: post.date,
            postLink: post.guid.rendered,
            postTitle: post.title.rendered,
            postExcerpt: post.excerpt.rendered,
            postContent: post.content.rendered,
            postCategory: post.categories,
            postImageUri: imageUri
        }

        return (
            <NewsItem
                title={post.title.rendered.replace(regex, '')}
                uri={imageUri}
                onPress={() => this.viewNews(newspost)}
                style={{ margin: 10 }} />
        )
    }

    viewNews(newspost) {
      //  console.log(newspost)
       this.props.navigation.navigate('ViewNews', { newspost })
    }

    render() {
      //  const regex = "/(<([^>]+)>)/ig"
        const { news, loading } = this.state
        const newsCount = news.length

        return (

            <SafeAreaView style={styles.container}>
                <Appbar menu={firebase.auth().currentUser} title titleText='Actualités' />

                {loading ?
                    <View style={styles.container}>
                        <Loading size='large' />
                    </View>
                    :
                    <View style={styles.container}>
                        {newsCount > 0 &&
                            <FlatList
                                data={news}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item }) => this.renderPost(item)}
                                contentContainerStyle={{ paddingTop: 10 }} />
                        }
                    </View>
                }

            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(ListNews)


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
})

