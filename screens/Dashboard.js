//Conditionnal rendering depending on USER ROLE

import React, { memo } from "react"
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions, PermissionsAndroid } from 'react-native'
import * as theme from '../core/theme'
import Appbar from "../components/Appbar"
import Button from "../components/Button"

import { constants } from "../core/constants"

import firebase from '@react-native-firebase/app'

const functions = firebase.functions()

class Dashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      email: '',
      errorMessage: '',
      synuid: '',

      test: ''
    }
  }

  componentDidMount() {
    this.requestWESPermission()
    this.requestRESPermission()
  }


  requestWESPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "WRITE_EXTERNAL_STORAGE permission",
          message:
            "Would you allow the app to" +
            "download files to your device.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("WRITE_EXTERNAL_STORAGE GRANTED");
      } else {
        console.log(" WRITE_EXTERNAL_STORAGE denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }

  requestRESPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "READ_EXTERNAL_STORAGE permission",
          message:
            "Would you allow the app to" +
            "upload files from your device.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("READ_EXTERNAL_STORAGE GRANTED");
      } else {
        console.log("READ_EXTERNAL_STORAGE denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Appbar menu title titleText='Accueil' />
        <View style={{ flex: 1, justifyContent: 'space-evenly', alignItems: 'center' }}>
          <View style= {{ justifyContent: 'center', alignItems: 'center', marginTop: 33}}>
            <Text style={theme.customFontMSbold.h2}>Tableau de bord Admin</Text>
            <Text style={[theme.customFontMSsemibold.header, { marginTop: 15 }]}>{firebase.auth().currentUser.displayName}</Text>
          </View>

          <Button
            mode="contained"
            onPress={() => firebase.auth().signOut()}
            backgroundColor='#ff5153'
            style={{ width: constants.ScreenWidth * 0.75, alignSelf: 'center' }}>
            Se déconnecter
          </Button>
        </View>
      </View >
    )
  }
}

export default Dashboard

















// import React, { memo } from "react";
// import Background from "../components/Background";
// import Logo from "../components/Logo";
// // import Header from "../components/Header";
// import Paragraph from "../components/Paragraph";
// import Button from "../components/Button";
// import { logoutUser } from "../api/auth-api";
// import Tab1 from './Agenda';
// import Tab2 from './Agenda2';
// // import Tab1 from './Notifications';
// import Tab3 from './Messages';
// import firebase from '@react-native-firebase/app'

// import { Container, Header, Tab, Tabs, ScrollableTab } from 'native-base';

// //Render dashboard depending on user role
// getUserRole() {
//   // firebase.auth().onAuthStateChanged(user => {
//   const user = firebase.auth().currentUser

//   if (user) {
//     this.setState({ isLoggedIn: true })

//     user.getIdTokenResult().then(idTokenResult => {
//       if (idTokenResult.claims.admin) {
//         this.setState({ isAdmin: true })
//         this.setRole('isAdmin')
//       }

//       else if (idTokenResult.claims.poseur) {
//         this.setState({ isPoseur: true })
//         this.setRole('isPoseur')
//       }

//       else if (idTokenResult.claims.com) {
//         this.setState({ isPoseur: true })
//         this.setRole('isCommercial')
//       }

//       else if (idTokenResult.claims.dircom) {
//         this.setState({ isDirCom: true })
//         this.setRole('isPoseur')
//       }

//       else if (idTokenResult.claims.resptech) {
//         this.setState({ isResTech: true })
//         this.setRole('isPoseur')
//       }

//       else if (typeof (idTokenResult.claims.admin) === 'undefined'
//         && typeof (idTokenResult.claims.poseur) === 'undefined')
//               && typeof (idTokenResult.claims.com) === 'undefined')
//       && typeof (idTokenResult.claims.dircom) === 'undefined')
//               && typeof (idTokenResult.claims.resptech) === 'undefined') {

//       this.setState({ isClient: true })
//       this.setRole('isClient')
//     }

//   })
// }

//     else {
//   this.setState({ isLoggedIn: false, isAdmin: undefined, isDoctor: undefined, isPatient: false }) //Guest
//   this.setRole('')
// }
// }

// const Dashboard = ()

// setDashboard() {
//   switch (this.state.role) {
//     case 'isAdmin':
//       Dashboard = () => (
//         <Container>
//           <Header hasTabs />
//           <Tabs>
//             <Tab heading="Agenda1">
//               <Tab1 />
//             </Tab>
//             <Tab heading="Agenda2">
//               <Tab2 />
//             </Tab>
//           </Tabs>
//         </Container>
//       );
//       break;

//     case 'isPoseur':
//       Dashboard = () => (
//         <Container>
//           <Header hasTabs />
//           <Tabs>
//             <Tab heading="Agenda1">
//               <Tab1 />
//             </Tab>
//             <Tab heading="Messages">
//               <Tab3 />
//             </Tab>
//           </Tabs>
//         </Container>
//       );

//     default:
//       console.log(`Sorry, we are out of.`);
//   }
// }

// // Dashboard = () => (
// //     <Container>
// //       <Header hasTabs />
// //       <Tabs>
// //         <Tab heading="Agenda1">
// //           <Tab1 />
// //         </Tab>
// //         <Tab heading="Agenda2">
// //           <Tab2 />
// //         </Tab>
// //         <Tab heading="Messages">
// //           <Tab3 />
// //         </Tab>
// //       </Tabs>
// //     </Container>
// // );

// export default memo(Dashboard);
