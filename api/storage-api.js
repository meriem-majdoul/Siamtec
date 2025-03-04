import { setToast } from "../core/utils"
import firebase from '@react-native-firebase/app'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { onUploadProgressStart, onUploadProgressChange, onUploadProgressEnd } from '../core/redux'
import RNFS from 'react-native-fs'

const db = firebase.firestore()

//Used by CreateProduct.js
export async function uploadFile(attachment, storageRefPath, showProgress) {

    const promise = new Promise((resolve, reject) => {

        const storageRef = firebase.storage().ref(storageRefPath)
        this.uploadTask = storageRef.putFile(attachment.path)

        this.uploadTask
            .on('state_changed', async function (tasksnapshot) {
                var progress = Math.round((tasksnapshot.bytesTransferred / tasksnapshot.totalBytes) * 100)
                console.log('Upload attachment ' + progress + '% done')

                if (showProgress) {
                    attachment.progress = progress / 100
                    this.setState({ attachment })
                }

            }.bind(this))

        this.uploadTask
            .then(async (res) => {
                attachment.downloadURL = await storageRef.getDownloadURL()
                attachment.generation = 'upload'
                delete attachment.progress
                this.setState({ attachment }, () => resolve(attachment))
            })
            .catch(err => {
                attachment.progress = 0
                this.setState({ attachment })
                reject('failure')
            })
    })

    return promise
}


async function uploadFileJob(main, files, attachment, urls, storageRefPath, isChat, chatId) {

    const promise = new Promise((resolve, reject) => {

        const storageRef = firebase.storage().ref(storageRefPath)
        const fileRef = storageRef.child(attachment.name)
        const uploadTask = fileRef.putFile(attachment.path)

        if (isChat) { //to cancel/pause/resume task
            attachment.uploadTask = uploadTask
            main.setState({ files })
        }

        uploadTask
            .on('state_changed', function (snapshot) {
                var progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                console.log(attachment.name + ': ' + progress + '% done')
                if (!isChat) { //No progress displayed for chat
                    attachment.progress = progress / 100
                    main.setState({ files })
                }
            }.bind(main))

        uploadTask
            .then(async (result) => {
                const downloadURL = await storageRef.child(attachment.name).getDownloadURL()
                attachment.downloadURL = downloadURL
                urls.push(downloadURL) //urls of files stored succesfully
                resolve(attachment)
            })
            .catch(async (e) => {
                console.error(e)
                //Delete failed media message
                if (isChat) {
                    await db.collection('Chats').doc(chatId).collection('Messages').doc(attachment.messageId).delete() //#task: set status to uploadFailed to allow user to retry
                    main.setState({ imageSource: '', videoSource: '', file: {} })
                }
                reject('failure')
            })
    })

    return promise
}

//Chat upload support 
//Used by: NewMessage.js, CreateProject.js, Chat.js
export async function uploadFiles(files, storageRefPath, isChat, chatId) {
    const promises = []
    let urls = [] //in case of failure

    for (let i = 0; i < files.length; i++) {
        const promise = uploadFileJob(this, files, files[i], urls, storageRefPath, isChat, chatId)
        promises.push(promise)
    }

    return Promise.all(promises)
        .then(attachments => { return attachments })
        .catch(async err => {

            //Delete the uploaded files
            if (!isChat)
                for (let i = 0; i < urls.length; i++) {
                    //Delete files from Firebase storage
                    firebase.storage().refFromURL(urls[i]).delete()
                }

            return false
        })
}


//Offline support + Progress handled by app state
//Used by: CreateDocument.js
export async function uploadFileNew(attachment, storageRefPath, DocumentId, rehydrated) { //#task: add showProgress as param

    console.log('3. uploadOfflineBeta')
    console.log('3.1 attachment', attachment)
    console.log('3.2 storageRefPath', storageRefPath)
    console.log('3.3 DocumentId', DocumentId)
    console.log('3.4 rehydrated', rehydrated)

    const promise = new Promise(async (resolve, reject) => {

        const storageRef = firebase.storage().ref(storageRefPath)
        const uploadTask = storageRef.putFile(attachment.path)

        var payload = { ...attachment }
        payload.DocumentId = DocumentId
        payload.storageRefPath = storageRefPath

        if (!rehydrated) {
            await onUploadProgressStart(this, payload)
        }

        uploadTask
            .on('state_changed', async function (tasksnapshot) {
                var progress = Math.round((tasksnapshot.bytesTransferred / tasksnapshot.totalBytes) * 100)
                console.log('Upload attachment ' + progress + '% done')

                //dispatch action to update attachment progress with id = DocumentId
                payload.progress = progress / 100
                onUploadProgressChange(this, payload)

            }.bind(this))

        uploadTask
            .then(async (res) => {
                attachment.downloadURL = await storageRef.getDownloadURL()
                attachment.generation = 'upload'
                attachment.pending = false
                delete attachment.progress

                db.collection('Documents').doc(DocumentId).update({ attachment })
                onUploadProgressEnd(this, payload)
            })
            .catch((e) => {
                console.error('upload error', e)
                console.log('Removing attachment from document with Id: ', DocumentId)

                db.collection('Documents').doc(DocumentId).update({ attachment: null })
                onUploadProgressEnd(this, payload)
            })
    })

    return Promise
}




            // //Build output files
            // for (let i = 0; i < results.length; i++) {
            //     const downloadURL = await storageRef.child(files[i].name).getDownloadURL()
            //     const { name, size, contentType } = results[i].metadata
            //     const attachedFile = { downloadURL, name, size, contentType }

            //     if (isChat) {
            //         attachedFile.messageId = files[i].messageId
            //         //attachedFile.uploadTask =  files[i].uploadTask
            //     }

            //     attachedFiles.push(attachedFile)
            // }

            // this.setState({ attachedFiles })
            // return true


//             //Chat upload support 
// export async function uploadFiles(files, storageRefPath, isChat, chatId) {
//     const promises = []
//     let urls = [] //in case of failure

//     for (let i = 0; i < files.length; i++) {

//         const storageRef = firebase.storage().ref(storageRefPath)
//         const fileRef = storageRef.child(files[i].name)
//         const uploadTask = fileRef.putFile(files[i].path)
//         promises.push(uploadTask)

//         if (isChat) { //to cancel/pause/resume task
//             files[i].uploadTask = uploadTask
//             this.setState({ files })
//         }

//         uploadTask.on('state_changed', function (snapshot) {
//             var progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
//             console.log('Upload file ' + i + ': ' + progress + '% done')
//             if (!isChat) { //No progress displayed for chat
//                 files[i].progress = progress / 100
//                 this.setState({ files })
//             }
//         }.bind(this))

//         uploadTask.then(async (result) => {
//             const downloadURL = await storageRef.child(files[i].name).getDownloadURL()
//             files[i].downloadURL = downloadURL
//             this.setState({ files }, () => console.log('1', this.state.attachments))
//             urls.push(downloadURL) //urls of files stored succesfully
//         })
//     }

//     return Promise.all(promises)
//         .then(results => {
//             console.log('2', this.state.attachments)
//             return true
//         })
//         .catch(async err => {

//             console.error(err)
//             setToast(this, 'e', 'Erreur lors du téléchargement des fichiers, veuillez réessayer.') //L'exportation d'au moins un fichier a échoué.

//             //Delete the uploaded files
//             for (let i = 0; i < urls.length; i++) {
//                 //Delete files from Firebase storage
//                 firebase.storage().refFromURL(urls[i]).delete()

//                 //Delete failed messages
//                 if (isChat) { //#task: do it on Chat component after this promise resolves with failure
//                     await db.collection('Chats').doc(chatId).collection('Messages').doc(files[i].messageId).delete() //#task: set status to uploadFailed to allow user to retry
//                     // await db.collection('Chats').doc(chatId).set(latestMsg, { merge: true }) //#task: keep previous last message to be able to restore it
//                     this.setState({ imageSource: '', videoSource: '', file: {} })
//                 }
//             }

//             return false
//         })
// }