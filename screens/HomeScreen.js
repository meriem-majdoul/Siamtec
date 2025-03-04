import React, { Component, memo } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, StyleSheet } from 'react-native'
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import Paragraph from "../components/Paragraph";
import LinearGradient from 'react-native-linear-gradient'
import * as theme from '../core/theme';
import { constants } from '../core/constants';

class HomeScreen extends Component {

  render() {
    return (

      <View style={styles.background}>
        <Logo />

        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={() => this.props.navigation.navigate("LoginScreen")}>
          <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#09a500', '#69b300', '#9fbc00']} style={styles.linearGradient}>
            <Text style={[theme.customFontMSbold.header, { color: '#fff' }]}>CONNECTION</Text>
          </LinearGradient>
        </TouchableOpacity>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff'
  },
  linearGradient: {
    height: 33,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 25,
    width: constants.ScreenWidth * 0.8,
    borderRadius: 5
  },
})


export default memo(HomeScreen);

















// import React, { memo, useEffect } from "react";
// import Background from "../components/Background";
// import Logo from "../components/Logo";
// import Header from "../components/Header";
// import Button from "../components/Button";
// import Paragraph from "../components/Paragraph";

// const HomeScreen = ({ navigation }) => {

//   useEffect(() => {
//  //   navigation.setParams({ title: 'Bienvenue' })
//   })

//   return (
//     <Background>
//       <Logo />
//       <Header>Firebase Login</Header>

//       <Paragraph>
//         This template supports Firebase authorization out of the box.
//     </Paragraph>
//       <Button mode="contained" onPress={() => navigation.navigate("LoginScreen")}>
//         Login
//     </Button>
//       <Button
//         mode="outlined"
//         onPress={() => navigation.navigate("RegisterScreen")}
//       >
//         Sign Up
//     </Button>
//     </Background>
//   );
// };

// export default memo(HomeScreen);

