import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import TextInput from './TextInput'
import Button from './Button'
import { ThemeColors } from 'react-navigation';
import * as theme from '../core/theme'
import { sum } from 'pdf-lib';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      balance: 0,
      amount: 0,
    }
  }


  updateBalance() {
    const balance = Number(this.state.balance) + Number(this.state.amount)
    this.setState({ balance })
  }

  render() {
    const { balance, amount } = this.state

    return (
      <View style={{ flex: 1, paddingTop: 75 }}>

        <View style={{ borderWidth: 1, borderColor: theme.colors.primary, width: 333, alignSelf: 'center', paddingVertical: 20 }}>
          <Text style={[theme.customFontMSbold.h3, { color: theme.colors.primary, textAlign: 'center', letterSpacing: 1 }]}>INSTAWALLET</Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={theme.customFontMSbold.body}>Balance:</Text>
            <Text style={theme.customFontMSbold.body}>{balance} $</Text>
          </View>

          <Text>{this.state.counter}</Text>
          <TextInput
            label={"Montant à transférer"}
            value={this.state.amount}
            onChangeText={amount => this.setState({ amount })}
            multiline={true}
          />
          <Button mode="contained" onPress={this.updateBalance.bind(this)} style={{ width: 333, marginTop: 50 }}>Transfer</Button>

          <Text style={[theme.customFontMSregular.caption, { color: 'gray', position: 'absolute', bottom: 20, left: 60 }]}>* Pay one bitcoin to withraw your balance</Text>
        </View>

      </View>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 20,
  },
  item: {
    backgroundColor: '#6495ED',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 25,
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
  itemText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

