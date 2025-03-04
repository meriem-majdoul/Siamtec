import React, { Component } from 'react';
import { View, Button } from 'react-native';
import notifee, { EventType, TimestampTrigger, TriggerType } from '@notifee/react-native'

export default class template extends Component {
    constructor(props) {
        super(props)
        this.onDisplayNotification = this.onDisplayNotification.bind(this)
        this.updateNotification = this.updateNotification.bind(this)

        this.state = {
            channelId: {}
        }
    }


    componentDidMount() {
        this.createNotificationListeners()
    }

    createNotificationListeners() {
        this.unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.ACTION_PRESS && detail.pressAction.id) {
                console.log('User pressed an action with the id: ', detail.pressAction.id);
            }

            switch (type) {
                case EventType.DISMISSED:
                    console.log('User dismissed notification', detail.notification);
                    break
                case EventType.PRESS:
                    console.log('User pressed notification', detail.notification);
                    break
            }
        })
    }

    async onDisplayNotification() {
        // // Create a channel
        // const channelId = await notifee.createChannel({
        //     id: 'default',
        //     name: 'Default Channel',
        // })

        // // Display a notification
        // await notifee.displayNotification({
        //     title: 'New message',
        //     body: 'You have a new message from Sarah!',
        //     android: {
        //       channelId: 'messages',
        //       actions: [
        //         {
        //           title: 'Reply',
        //           icon: 'https://my-cdn.com/icons/reply.png',
        //           pressAction: {
        //             id: 'reply',
        //           },
        //           input: true, // enable free text input
        //         },
        //       ],
        //     },
        //   })

        const date = new Date(Date.now());
        date.setHours(20);
        date.setMinutes(39);
    
        // Create a time-based trigger
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: date.getTime(), // fire at 11:10am (10 minutes before meeting)
        };
    
        // Create a trigger notification
        await notifee.createTriggerNotification(
          {
            title: 'Meeting with Jane',
            body: 'Today at 11:20am',
            android: {
              channelId: 'your-channel-id',
            },
          },
          trigger,
        );
    }

    async updateNotification() {
        // Sometime later...
        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
        })

        await notifee.displayNotification({
            id: '123',
            title: 'Updated Notification Title',
            body: 'Updated main body content of the notification',
            android: {
                channelId,
            },
        })
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
                <Button title="Display Notification" onPress={this.onDisplayNotification} />
                <Button title="Update Notification" onPress={this.updateNotification} />
            </View>
        )
    }
}
