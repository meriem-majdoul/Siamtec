//Icons: Back
const navOptionsBack = ({ route }) => ({
    title: route.params?.title ?? '', // Utilisation de route.params pour accéder au paramètre
    // Theme options
    headerTintColor: '#333',
    headerTitleStyle: [theme.customFontMSmedium.title],
    headerStyle: {
        backgroundColor: '#fff',
        elevation: 0
    },
});


//Icons: Back
const navOptionsBackColor = ({ route }) => ({
    title: route.params?.title ?? '', // Utilisation de route.params pour accéder au paramètre
    // Theme options
    headerTintColor: '#fff',
    headerTitleStyle: [theme.customFontMSmedium.title],
    headerStyle: {
        backgroundColor: theme.colors.primary,
        elevation: 0
    },
});

//Icons: Menu
const navOptionsMenu = ({ navigation, route }) => ({
    headerLeft: (
        <View style={{ marginLeft: constants.ScreenWidth * 0.025 }}>
            <Icon
                name="menu"
                size={25}
                color="#fff"
                onPress={() => navigation.openDrawer()}
            />
        </View>
    ),
    title: route.params?.title ?? '', // Utilisation de route.params pour accéder au paramètre
    // Theme options
    headerTintColor: '#fff',
    headerTitleStyle: [theme.customFontMSmedium.title],
    headerStyle: {
        backgroundColor: theme.colors.primary,
        elevation: 0
    },
});


//2 Icons: Back + controllers
const navOptionsBackCheck = ({ route }) => ({
    headerRight: route.params?.rightmenu || '', // Utilisation de route.params pour récupérer le paramètre 'rightmenu'
    title: route.params?.title || '', // Utilisation de route.params pour récupérer le paramètre 'title'
    //Theme options
    headerTintColor: '#fff',
    headerTitleStyle: [theme.customFontMSmedium.title],
    headerStyle: {
        backgroundColor: theme.colors.primary,
        elevation: 0
    },
});


//2 Icons: Cross + Check
const navOptionsCrossCheck = ({ navigation }) => ({
    headerLeft: <Icon name={'close'}
        size={24} color='#fff'
        style={{ paddingLeft: constants.ScreenWidth * 0.03 }}
        onPress={() => { navigation.goBack() }} />,

    headerRight: (
        <View style={{ marginRight: constants.ScreenWidth * 0.03 }}>
            <Icon
                name="check"
                size={24}
                color='#fff'
                onPress={route.params?.submit} // Accès au paramètre via route.params
            />
        </View>
    ),
    title: route.params?.title ?? '',
    // Theme options
    headerTintColor: '#fff',
    headerTitleStyle: [theme.customFontMSmedium.title],
    headerStyle: {
        backgroundColor: theme.colors.primary,
        elevation: 0
    },
    
})
