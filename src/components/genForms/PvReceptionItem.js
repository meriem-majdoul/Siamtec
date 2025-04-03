import React from 'react';
import FormItem from './FormItem';
import { useNavigation } from '@react-navigation/native'; // Importation du hook useNavigation

const PvReceptionItem = ({ pv, onPress, projectOwner, ...props }) => {
    const navigation = useNavigation(); // Utilisation du hook pour obtenir l'objet navigation

    return (
        <FormItem 
            item={pv}
            onPress={onPress} 
            navigation={navigation} // Passage de l'objet navigation à FormItem
            nameClient1={projectOwner}
            nameClient2=""
        />
    );
}

export default PvReceptionItem;
