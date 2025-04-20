import React, { memo } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Image, ScrollView } from "react-native";
import Modal from 'react-native-modal';
import { Title } from 'react-native-paper';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import Button from './Button';
import CustomIcon from './CustomIcon';

import * as theme from "../core/theme";
import { constants } from "../core/constants";
import { SafeAreaView } from "react-native-safe-area-context";

export const ModalForm = ({
  elements,
  elementSize,
  handleSelectElement,
  returnSingleElement,
  autoValidation,
  isReview,
  model = 'Element1'
}) => {

  const selectElement = (element, index) => {
    // Unselect all types
    elements.forEach((element, key) => elements[key].selected = false);

    // Select chosen element
    elements[index].selected = true;

    // Handle update on parent component
    if (returnSingleElement) {
      handleSelectElement(element, index);
    } else {
      handleSelectElement(elements, index); // all elements (selected element has "selected" = true)
    }
  };

  const onPressElement = (element, index) => {
    if (autoValidation) {
      handleSelectElement(element, index); // only the selected element
    } else {
      selectElement(element, index);
    }
  };

  const Element1 = ({ element, index, elementSize }) => {

    const elementStaticStyle = () => {
      return {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.gray_medium,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        margin: elementSize * 0.02,
        width: elementSize,
        height: elementSize,
        backgroundColor: theme.colors.white,
      };
    };

    const elementDynamicStyle = (isSelected) => {
      if (isSelected) {
        return {
          elevation: 0,
          borderWidth: 1,
          borderColor: theme.colors.primary
        };
      }
      return {};
    };

    const { label, selected, icon, image, imageStyle } = element;
    let { iconColor } = element;
    iconColor = selected ? theme.colors.primary : iconColor;
    const textColor = selected ? theme.colors.primary : theme.colors.secondary;

    return (
      <TouchableOpacity
        style={[elementStaticStyle(), elementDynamicStyle(selected)]}
        onPress={() => onPressElement(element, index)}
      >
        <View style={{ height: elementSize * 0.57, justifyContent: 'center' }}>
          {icon && <CustomIcon icon={icon} size={elementSize * 0.3} color={iconColor} />}
          {image && <Image style={[{ width: elementSize * 0.2, height: elementSize * 0.2 / (1200 / 1722) }, imageStyle]} source={image} />}
        </View>
        <View style={{ height: elementSize * 0.43, paddingHorizontal: elementSize * 0.05 }}>
          <Text style={[theme.customFontMSsemibold.caption, { textAlign: 'center', color: textColor }]}>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const Element2 = ({ element, index, elementSize }) => {

    const elementStyle = {
      borderRadius: 20,
      justifyContent: 'flex-end',
      marginBottom: elementSize * 0.12,
      width: elementSize,
      height: elementSize,
      backgroundColor: element.colors.primary,
      ...theme.style.shadow
    };


    const iconSize = element.icon && element.icon.iconName === "user-alt" ? elementSize * 0.13 : elementSize * 0.16;

    const iconContainer = {
      borderRadius: elementSize * 0.4 / 2,
      size: elementSize * 0.4
    };

    return (
      <TouchableOpacity style={elementStyle} onPress={() => onPressElement(element, index)}>
        <View style={{
          position: "absolute",
          right: 0,
          top: 0,
          backgroundColor: element.colors.secondary,
          borderBottomRightRadius: iconContainer.borderRadius,
          borderBottomLeftRadius: iconContainer.borderRadius,
          borderTopLeftRadius: iconContainer.borderRadius,
          borderTopRightRadius: 20,
          width: iconContainer.size,
          height: iconContainer.size,
          justifyContent: "center",
          alignItems: "center"
        }}>
          {element.icon && <CustomIcon icon={element.icon} size={iconSize} color="#fff" />}
        </View>
        <View style={{ paddingHorizontal: elementSize * 0.15, marginBottom: elementSize * 0.13 }}>
          <Text style={[theme.customFontMSbold.h3, { color: theme.colors.white }]}>{element.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const Rate = ({ element, index, length }) => {

    const elementStaticStyle = () => {
      return {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.gray_medium,
        borderRadius: constants.ScreenWidth * 0.075,
        justifyContent: 'center',
        alignItems: 'center',
        margin: elementSize * 0.03,
        width: constants.ScreenWidth * 0.15,
        height: constants.ScreenWidth * 0.15,
        marginBottom: 7,
        backgroundColor: theme.colors.white,
      };
    };

    const elementDynamicStyle = (isSelected) => {
      if (isSelected) {
        return {
          elevation: 0,
          borderWidth: 1,
          borderColor: theme.colors.primary
        };
      }
      return {};
    };

    const iconColor = element.selected ? theme.colors.primary : element.iconColor;
    const numberColor = element.selected ? theme.colors.primary : theme.colors.secondary;
    const titleColor = element.selected ? theme.colors.primary : theme.colors.gray_dark;

    return (
      <View style={{ width: constants.ScreenWidth * 0.17, height: 100, marginBottom: 25 }}>
        <TouchableOpacity style={[elementStaticStyle(), elementDynamicStyle(element.selected)]} onPress={() => onPressElement(element, index)}>
          <Text style={[theme.customFontMSregular.header, { textAlign: 'center', color: numberColor }]}>{element.label}</Text>
        </TouchableOpacity>
        {index === 0 && <Text style={[theme.customFontMSregular.small, { textAlign: 'center', color: titleColor }]}>Pas du tout satisfait</Text>}
        {index === (length - 1) && <Text style={[theme.customFontMSregular.small, { textAlign: 'center', color: titleColor }]}>Très satisfait</Text>}
      </View>
    );
  };

  const containerStyle = { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingHorizontal: elementSize * 0.04 };

  if (isReview)
    return (
      <View style={[containerStyle, { justifyContent: 'space-around' }]}>
        {elements.map((element, index) =>
          <Rate
            key={index.toString()}
            element={element}
            index={index}
            length={elements.length}
          />)
        }
      </View>
    );

  else return (
    <ScrollView contentContainerStyle={[containerStyle, { justifyContent: elements.length > 1 ? 'space-between' : 'center' }]}>
      {elements.map((element, index) => {
        if (model === 'Element1')
          return (
            <Element1
              key={index.toString()}
              element={element}
              index={index}
              elementSize={elementSize}
            />
          )
        else if (model === 'Element2')
          return (
            <Element2
              key={index.toString()}
              element={element}
              index={index}
              elementSize={elementSize}
            />
          )
      })}
    </ScrollView>
  );

};

const ModalOptions = ({
  title, columns = 3, isVisible, toggleModal, handleCancel, handleConfirm,
  elements, handleSelectElement, returnSingleElement, autoValidation, hideCancelButton, isLoading, modalStyle, isReview, ...props }) => {

  let elementSize;

  if (columns === 1)
    elementSize = constants.ScreenWidth * 0.5;

  if (columns === 2)
    elementSize = constants.ScreenWidth * 0.45;

  else if (columns >= 3)
    elementSize = constants.ScreenWidth * 0.31;

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackdropPress={!isLoading ? toggleModal : () => console.log('No action...')}
      style={[styles.modal, modalStyle]}
    >
      {isLoading ?
        <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={[theme.customFontMSregular.title, { marginBottom: 100 }]}>Traitement en cours...</Text>
          <ActivityIndicator color={theme.colors.primary} size={50} />
        </View>
        :
        <SafeAreaView style={styles.container}>
          <TouchableOpacity style={{ zIndex: 1, position: 'absolute', top: theme.padding, right: theme.padding, justifyContent: 'center', alignItems: 'center' }} onPress={() => console.log('hello')}>
            <CustomIcon icon={faTimes} color={theme.colors.gray_dark} onPress={toggleModal} />
          </TouchableOpacity>
          <Title style={[theme.customFontMSmedium.header, { color: theme.colors.gray_dark, marginBottom: 35, textAlign: 'center', paddingHorizontal: theme.padding * 3 }]}>
            {title}
          </Title>

          <ModalForm
            elements={elements}
            elementSize={elementSize}
            handleSelectElement={handleSelectElement}
            returnSingleElement={returnSingleElement}
            autoValidation={autoValidation}
            isReview={isReview}
          />

          {!autoValidation &&
            <View style={[styles.buttonsContainer, { justifyContent: autoValidation ? "space-between" : 'flex-end' }]}>
              {!hideCancelButton && <Button mode="outlined" onPress={handleCancel}>Annuler</Button>}
              <Button mode="contained" onPress={handleConfirm}>Confirmer</Button>
            </View>
          }
        </SafeAreaView>
      }
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    width: constants.ScreenWidth,
    marginTop: constants.ScreenHeight * 0.58,
    marginHorizontal: 0,
    marginBottom: 0,
    borderTopLeftRadius: constants.ScreenWidth * 0.03,
    borderTopRightRadius: constants.ScreenWidth * 0.03,
  },
  container: {
    flex: 1,
    paddingTop: theme.padding / 1.5,
    backgroundColor: '#fff',
    borderTopLeftRadius: constants.ScreenWidth * 0.03,
    borderTopRightRadius: constants.ScreenWidth * 0.03,
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.padding,
    alignItems: 'flex-end'
  },
  column: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default memo(ModalOptions);
