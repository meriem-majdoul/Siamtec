import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {List, Card, Paragraph, Title, Avatar} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

import Button from './Button';

import * as theme from '../core/theme';
import {constants} from '../core/constants';

import {withNavigation} from 'react-navigation';

const OrderItem = ({order, onPress, navigation, ...props}) => {
  const setStateColor = (state) => {
    switch (state) {
      case 'En cours':
        return theme.colors.inProgress;
        break;

      case 'Terminé':
        return theme.colors.valid;
        break;

      case 'Annulé':
        return theme.colors.canceled;
        break;

      default:
        return '#333';
    }
  };

  const sumTaxes = (taxes) => {
    if (taxes.length === 0) return 0;
    var taxeValues = taxes.map((taxe) => taxe.value);
    const sum = taxeValues.reduce((prev, next) => prev + next);
    return sum;
  };

  const {subTotal, discount, taxes, primeCEE, primeRenov, aidRegion} = order;
  const discountedPrice = subTotal - (subTotal * discount) / 100;
  let taxedPrice = discountedPrice + sumTaxes(taxes);
  taxedPrice = Math.round(taxedPrice);
  const netPrice = taxedPrice - primeCEE - primeRenov - aidRegion;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text
          style={[
            theme.customFontMSregular.small,
            {color: theme.colors.gray_medium},
          ]}>
          {order.id}
        </Text>
        <Text style={theme.customFontMSmedium.header}>€ {netPrice}</Text>
      </View>

      <View style={{marginBottom: 15, marginTop: 3}}>
        {order.project && (
          <Text
            numberOfLines={1}
            style={[theme.customFontMSmedium.body, {marginBottom: 5}]}>
            {order.project.name}
          </Text>
        )}
        {order.project && order.project.client && (
          <Text>
            <Text
              style={[
                theme.customFontMSregular.caption,
                {color: theme.colors.gray_dark},
              ]}>
              chez
            </Text>{' '}
            <Text
              style={[
                theme.customFontMSmedium.caption,
                {color: theme.colors.gray_dark},
              ]}>
              {order.project.client.fullName}
            </Text>
          </Text>
        )}
      </View>

      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text
          style={[
            theme.customFontMSregular.caption,
            {color: theme.colors.gray_dark},
          ]}>
          {moment(order.editedAt).format('ll')}
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              width: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 50,
              backgroundColor: setStateColor(order.state),
              padding: 2,
              ...theme.style.shadow,
            }}>
            <Text style={theme.customFontMSregular.caption}>{order.state}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    marginVertical: 5,
    ...theme.style.shadow,
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
  },
  stepContainer: {
    height: 33,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default withNavigation(OrderItem);
