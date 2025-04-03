import React from 'react';
import FormItem from './FormItem';
import { useNavigation } from '@react-navigation/native'; // Utilisation du hook useNavigation

const MandatMPRItem = ({ mandat, onPress, applicantName, ...props }) => {
    const navigation = useNavigation(); // Récupération de l'objet navigation avec le hook

    return (
        <FormItem
            item={mandat}
            onPress={onPress}
            navigation={navigation} // Passage de l'objet navigation à FormItem
            nameClient1={applicantName}
            nameClient2=""
        />
    );
};

export default MandatMPRItem;
