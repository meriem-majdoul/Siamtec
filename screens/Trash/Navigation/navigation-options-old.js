//Icons: Back
const navOptionsBack = ({ navigation }) => ({
    title: navigation.getParam('title', ''),
    //Theme options
    headerTintColor: '#333',
    headerTitleStyle: [theme.customFontMSmedium.title],
    headerStyle: {
        backgroundColor: '#fff',
        elevation: 0
    },
})

//Icons: Back
const navOptionsBackColor = ({ navigation }) => ({
    title: navigation.getParam('title', ''),
    //Theme options
    headerTintColor: '#fff',
    headerTitleStyle: [theme.customFontMSmedium.title],
    headerStyle: {
        backgroundColor: theme.colors.primary,
        elevation: 0
    },
})

//Icons: Menu
const navOptionsMenu = ({ navigation }) => ({
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
    title: navigation.getParam('title', ''),
    //Theme options
    headerTintColor: '#fff',
    headerTitleStyle: [theme.customFontMSmedium.title],
    headerStyle: {
        backgroundColor: theme.colors.primary,
        elevation: 0
    },
})

//2 Icons: Back + controllers
const navOptionsBackCheck = ({ navigation }) => ({
    headerRight: (navigation.getParam('rightmenu', '')),
    title: navigation.getParam('title', ''),
    //Theme options
    headerTintColor: '#fff',
    headerTitleStyle: [theme.customFontMSmedium.title],
    headerStyle: {
        backgroundColor: theme.colors.primary,
        elevation: 0
    },
})

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
                onPress={navigation.getParam('submit')}
            />
        </View>
    ),
    title: navigation.getParam('title', ''),
    //Theme options
    headerTintColor: '#fff',
    headerTitleStyle: [theme.customFontMSmedium.title],
    headerStyle: {
        backgroundColor: theme.colors.primary,
        elevation: 0
    },
})
