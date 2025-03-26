import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFS from 'react-native-fs'

import firebase, { db } from '../firebase'
import { setToast } from "../core/utils"
import { onUploadProgressStart, onUploadProgressChange, onUploadProgressEnd } from '../core/redux'

//Used by CreateProduct.js
export async function uploadFile(attachment, storageRefPath, showProgress, metadata) {

    const promise = new Promise((resolve, reject) => {

        const { path, ref } = attachment
        const storageRef = firebase.storage().ref(storageRefPath)
        this.uploadTask = storageRef.putFile(path, { customMetadata: metadata || {} })
        let update = {}

        this.uploadTask
            .on('state_changed', async function (tasksnapshot) {
                var progress = Math.round((tasksnapshot.bytesTransferred / tasksnapshot.totalBytes) * 100)
                //console.log('Upload attachment ' + progress + '% done')

                if (showProgress) {
                    attachment.progress = progress / 100
                    update[ref] = attachment
                    this.setState(update)
                }

            }.bind(this))

        this.uploadTask
            .then(async (res) => {
                attachment.downloadURL = await storageRef.getDownloadURL()
                attachment.generation = 'upload'
                //delete attachment.progress
                delete attachment.ref
                update[ref] = attachment
                this.setState(update, () => resolve(attachment))
            })
            .catch(err => {
                attachment.progress = 0
                update[ref] = attachment
                this.setState(update)
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

    const promise = new Promise(async (resolve, reject) => {

        const storageRef = firebase.storage().ref(storageRefPath)
        const uploadTask = storageRef.putFile(attachment.path)

        var payload = { ...attachment }
        payload.storageRefPath = storageRefPath
        payload.DocumentId = DocumentId

        if (!rehydrated) {
            await onUploadProgressStart(this, payload)
        }

        uploadTask
            .on('state_changed', async function (tasksnapshot) {
                var progress = Math.round((tasksnapshot.bytesTransferred / tasksnapshot.totalBytes) * 100)
                console.log('Upload attachment ' + progress + '% done')
                payload.progress = progress / 100
                onUploadProgressChange(this, payload) //dispatch action to update attachment progress with id = DocumentId
            }.bind(this))

        uploadTask
            .then(async (res) => {
                console.log('UPLOAD COMPLETED !')
                attachment.downloadURL = await storageRef.getDownloadURL()
                attachment.generation = 'upload'
                attachment.pending = false
                delete attachment.progress

                db.collection('Documents').doc(DocumentId).update({ attachment }).then(() => console.log('FILE UPLOADED TO FIREBASE !'))
                onUploadProgressEnd(this, payload)
                resolve(true)
            })
            .catch((e) => {
                console.error('upload error', e)
                db.collection('Documents').doc(DocumentId).update({ attachment: null }) //Rollback: Remove failed attachment
                onUploadProgressEnd(this, payload)
                reject(false)
            })
    })

    return promise
}


