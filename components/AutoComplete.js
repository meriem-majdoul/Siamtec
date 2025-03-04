import Autocomplete from 'react-native-autocomplete-input';
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API = 'https://swapi.co/api';
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

class AutoComplete extends Component {

  static renderItem(item) {
    const { name } = item

    return (
      <View>
        <Text style={styles.titleText}>{name}</Text>
      </View>
    )
  }

  constructor(props) {
    super(props);
    this.state = {
      query: ''
    }
  }


  render() {
    const { query } = this.state;
    const suggestions = this.props.suggestions
    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim()

    return (
      <View style={styles.container}>
        <Autocomplete
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.autocompleteContainer}
          data={suggestions.length === 1 && comp(query, suggestions[0].title) ? [] : suggestions}
          //   data={suggestions.length === 1 && comp(query, suggestions[0].title) ? [] : suggestions}
          defaultValue={query}
          onChangeText={text => this.setState({ query: text })}
          placeholder="Enter Star Wars film title"
          renderItem={({ name }) => (
            <TouchableOpacity onPress={() => this.setState({ query: name })}>
              <Text style={styles.itemText}>
                {name}
              </Text>
            </TouchableOpacity>
          )}
        />
        {/* <View style={styles.descriptionContainer}>
          {suggestions.length > 0 ? (
            AutoComplete.renderFilm(suggestions[0])
          ) : (
            <Text style={styles.infoText}>
              Enter Title of a Star Wars movie
            </Text>
          )}
          </View> */}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    flex: 1,
    paddingTop: 25
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1
  },
  itemText: {
    fontSize: 15,
    margin: 2
  },
  descriptionContainer: {
    // `backgroundColor` needs to be set otherwise the
    // autocomplete input will disappear on text input.
    backgroundColor: '#F5FCFF',
    marginTop: 25
  },
  infoText: {
    textAlign: 'center'
  },
  titleText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center'
  },
  directorText: {
    color: 'grey',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center'
  },
  openingText: {
    textAlign: 'center'
  }
});

export default AutoComplete;