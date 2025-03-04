import { NavigationActions } from 'react-navigation';

let _navigator

// function setTopLevelNavigator(navigatorRef: any): void {
//     _navigator = navigatorRef;
// }

// function navigate(routeName: string, params: any = {}): void {
//     _navigator.dispatch(
//         NavigationActions.navigate({
//             routeName,
//             params,
//         })
//     );
// }

export const setTopLevelNavigator = navigatorRef => {
    _navigator = navigatorRef
}


export const navigate = (routeName, params) => {
    console.log('Hey')
    _navigator.dispatch(
        NavigationActions.navigate({
            routeName,
            params,
        })
    )
}

// add other navigation functions that you need and export them

// export default {
//     navigate,
//     setTopLevelNavigator,
// }