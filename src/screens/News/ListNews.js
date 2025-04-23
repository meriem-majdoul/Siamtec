import React, { Component } from 'react';
import { StyleSheet, SafeAreaView, FlatList, View } from 'react-native';
import { connect } from 'react-redux';

import Appbar from '../../components/Appbar';
import NewsItem from '../../components/NewsItem';
import Loading from '../../components/Loading';
import EmptyList from '../../components/EmptyList';

import { constants, errorMessages } from '../../core/constants';
import { displayError, load } from '../../core/utils';

const HTML_REGEX = /(<([^>]+)>)/ig;

class ListNews extends Component {
    constructor(props) {
        super(props);

        this.state = {
            news: [],
            loading: false,
        };
    }

    componentDidMount() {
        const { isConnected } = this.props.network;
        if (!isConnected) return;
        load(this, true);
        this.fetchWordpressPosts();
    }

    fetchWordpressPosts = async () => {
        try {
            const response = await fetch("https://siamtec.fr/wp-json/wp/v2/posts?_embed");
            if (!response.ok) throw new Error(errorMessages.wordpress.posts);
            const json = await response.json();
            this.setState({ news: json, loading: false });
        } catch (error) {
            displayError({ message: error.message });
            this.setState({ loading: false });
        }
    };

    renderPost = (post) => {
        const imageUri = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://via.placeholder.com/150';


        const newspost = {
            postId: post.id,
            postDate: post.date,
            postLink: post.guid.rendered,
            postTitle: post.title.rendered,
            postExcerpt: post.excerpt.rendered,
            postContent: post.content.rendered,
            postCategory: post.categories,
            postImageUri: imageUri
        };

        return (
            <NewsItem
                title={post.title.rendered.replace(HTML_REGEX, '')}
                uri={imageUri}
                onPress={() => this.viewNews(newspost)}
                style={{ margin: 10 }} />
        );
    };

    viewNews = (newspost) => {
        this.props.navigation.navigate('ViewNews', { newspost });
    };

    render() {
        const { news, loading } = this.state;

        return (
            <SafeAreaView style={styles.container}>
                {/* <Appbar  titleText='Actualités'
                 style={{color:'#black',backgroundColor:'pink'}} /> */}

                {loading ? (
                    <View style={styles.container}>
                        <Loading size='large' />
                    </View>
                ) : (
                    <View style={styles.container}>
                        <FlatList
                            data={news}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => this.renderPost(item)}
                            contentContainerStyle={{ paddingTop: 10 }}
                            ListEmptyComponent={<EmptyList message="Aucune actualité disponible." />}
                        />
                    </View>
                )}
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => ({
    role: state.roles.role,
    network: state.network,
});

export default connect(mapStateToProps)(ListNews);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
});
