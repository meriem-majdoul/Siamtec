import { PermissionsAndroid, Platform } from 'react-native'

export const checkPermission = async () => {

    if (Platform.OS === 'ios') {
        downloadImage()
    }

    else {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission Required',
                    message: 'This app needs access to your storage to download Photos',
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                //Once user grant the permission start downloading
                console.log('Storage Permission Granted.');
                downloadImage();
            } else {
                //If permission denied then show alert 'Storage Permission Not Granted'
                alert('Storage Permission Not Granted');
            }
        } catch (err) {
            //To handle permission related issue
            console.warn(err);
        }
    }
}

export const requestWESPermission = async () => {

    if (Platform.OS === "ios")
        return
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
        // if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //     console.log("WRITE_EXTERNAL_STORAGE GRANTED");
        // } else {
        //     console.log(" WRITE_EXTERNAL_STORAGE denied");
        // }
    } catch (err) {
        console.warn(err);
    }
};

export const requestRESPermission = async () => {
    if (Platform.OS === "ios")
        return
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
};