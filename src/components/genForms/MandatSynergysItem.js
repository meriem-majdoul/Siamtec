import React from 'react';
import FormItem from './FormItem';
import { useNavigation } from '@react-navigation/native'; // Importation du hook useNavigation

const MandatSynergysItem = ({ mandat, onPress, ...props }) => {
    const navigation = useNavigation(); // Utilisation du hook pour obtenir l'objet navigation

    const { clientFirstName, clientLastName } = mandat;
    const nameClient1 = `${clientFirstName} ${clientLastName}`;

    return (
        <FormItem
            item={mandat}
            onPress={onPress}
            navigation={navigation} // Passage de l'objet navigation à FormItem
            nameClient1={nameClient1}
            nameClient2=""
        />
    );
};

export default MandatSynergysItem;
