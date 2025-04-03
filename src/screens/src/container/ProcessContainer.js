import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importer le hook useNavigation
import _ from 'lodash';
import PhaseComponent from '../components/PhaseComponent';
import StepComponent from '../components/StepComponent';
import { constants } from '../../../core/constants';
import * as theme from '../../../core/theme';
import Action from '../../Process/components/Action';

const ProcessContainer = (props) => {
  const [currentPage, setCurrentPage] = useState(0); // Utilisation du hook useState pour gérer l'état

  const navigation = useNavigation(); // Obtenez l'objet navigation via le hook useNavigation

  const { phaseLabels, phaseStatuses, stepsData } = props;

  return (
    <View style={{ flex: 1 }}>
      {phaseLabels.length > 0 && (
        <PhaseComponent
          labels={phaseLabels}
          status={phaseStatuses}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage} // Mettez à jour le state via le setter de useState
        />
      )}

      <View style={{ flex: 1, marginTop: theme.padding }}>
        <ScrollView>
          {stepsData.length > 0 &&
            stepsData[currentPage].reverse().map((item, index) => {
              return (
                <View key={index.toString()}>
                  <StepComponent
                    title={item.title}
                    progress={item.progress}
                    instructions={item.instructions}
                    children={
                      <View
                        style={{
                          marginLeft: constants.ScreenWidth * 0.035,
                          paddingBottom: 15,
                          borderLeftWidth:
                            index !== stepsData[currentPage].length - 1 ? 2 : 0,
                          borderLeftColor: theme.colors.gray_light,
                        }}
                      >
                        {item.actions.map((action, index) => {
                          return (
                            <Action
                              key={index}
                              isProcessHistory={true}
                              action={action}
                              actionTheme={{
                                mainColor: theme.colors.gray_dark,
                                textFont: theme.customFontMSregular.caption,
                                marginVertical: 50,
                              }}
                              style={{ marginVertical: theme.padding / 2 }}
                              loading={props.loadingAction}
                              loadingMessage={props.loadingMessageAction}
                            />
                          );
                        })}
                      </View>
                    }
                  />
                </View>
              );
            })}
        </ScrollView>
      </View>
    </View>
  );
};

export default ProcessContainer;
