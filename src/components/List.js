import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'; // Import du hook useNavigation
import MyFAB from './MyFAB';
import { fetchDocuments } from '../api/firestore-api';
import * as theme from '../core/theme';
import { constants } from '../core/constants';

const CustomList = ({ query, itemLabel, renderItem, fabIcon, creationScreen }) => {
    const navigation = useNavigation(); // Utilisation du hook useNavigation
    const [list, setList] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const documents = await fetchDocuments(query);
            setList(documents);
            setCount(documents.length);
        };
        fetchData();
    }, [query]);

    let s = count > 1 ? 's' : '';

    return (
        <View style={styles.container}>
            {count > 0 && <List.Subheader>{count} {itemLabel}{s}</List.Subheader>}
            <FlatList
                style={styles.root}
                contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.1 }}
                data={list}
                extraData={list}
                keyExtractor={(item) => item.id}
                renderItem={(item) => renderItem(item)}
            />
            <MyFAB icon={fabIcon} onPress={() => navigation.navigate(creationScreen)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    root: {
        backgroundColor: "#fff",
    }
});

export default CustomList;
