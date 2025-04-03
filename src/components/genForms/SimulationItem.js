import React from 'react';
import FormItem from './FormItem';
import { useNavigation } from '@react-navigation/native'; // Importation du hook useNavigation

const SimulationItem = ({ simulation, onPress, nameSir, nameMiss, ...props }) => {
    const navigation = useNavigation(); // Utilisation du hook pour obtenir l'objet navigation

    return (
        <FormItem
            item={simulation}
            onPress={onPress}
            navigation={navigation} // Passage de l'objet navigation à FormItem
            nameClient1={nameSir}
            nameClient2={nameMiss}
        />
    );
}

export default SimulationItem;
