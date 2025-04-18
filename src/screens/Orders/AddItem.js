import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Card, Title, FAB, ProgressBar, List } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';

import { db } from '../../firebase';
import * as theme from '../../core/theme';
import { constants, isTablet } from '../../core/constants';

import Appbar from '../../components/Appbar';
import AutoCompleteProducts from '../../components/AutoCompleteProducts';
import MyInput from '../../components/TextInput';
// import Picker from "../../components/Picker"

import {
  updateField,
  nameValidator,
  arrayValidator,
  positiveNumberValidator,
  setToast,
  load,
} from '../../core/utils';
import { fetchDocs, fetchDocuments } from '../../api/firestore-api';
import { faPlusCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CustomIcon } from '../../components';

class AddItem extends Component {
  constructor(props) {
    super(props);
    this.fetchDocs = fetchDocs.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.refreshProduct = this.refreshProduct.bind(this);
    this.addItem = this.addItem.bind(this);

    const { route } = this.props;

    this.orderLine = route?.params?.orderLine ?? null;
    this.orderKey = route?.params?.orderKey ?? '';
    this.isEdit = this.orderLine ? true : false;

    this.state = {
      item: { id: '', name: '' },
      description: { value: '', error: '' },
      quantity: { value: '', error: '' },
      price: { value: '', error: '' },
      taxe: { name: '', rate: '', value: '' },

      loading: false,
      tagsSelected: [],
      suggestions: [],
    };
  }

  async componentDidMount() {
    if (this.isEdit) {
      let { description, quantity, price, taxe, tagsSelected } = this.state;
      description.value = this.orderLine.description;
      quantity.value = this.orderLine.quantity;
      price.value = this.orderLine.price;
      taxe = this.orderLine.taxe;
      tagsSelected.push(this.orderLine.product);
      this.setState({ description, quantity, price, taxe, tagsSelected });
    }

    load(this, false);
    this.fetchSuggestions();
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async fetchSuggestions() {
    const query = db.collection('Products');
    // this.fetchDocs(query, 'suggestions', '', () => { load(this, false) })
    const suggestions = await fetchDocuments(query);
    this.setState({ suggestions, loading: false });
  }

  validateInputs() {
    let { tagsSelected, tagsSelectedError, quantity, price } = this.state;

    let tagsError = arrayValidator(tagsSelected, `"Article"`);
    let quantityError = nameValidator(quantity.value, `"Quantité"`);
    let priceError = positiveNumberValidator(price.value, `"Prix unitaire"`);

    if (tagsError || quantityError || priceError) {
      Keyboard.dismiss();
      tagsSelectedError = tagsError;
      quantity.error = quantityError;
      price.error = priceError;
      this.setState({ tagsSelected, quantity, price, loading: false });
      return false;
    }

    return true;
  }

  handleSubmit() {
    //Handle Loading or No edit done
    if (this.state.loading) return;

    load(this, true);

    //0. Validate inputs
    const isValid = this.validateInputs();
    if (!isValid) return;

    // 1. ADDING product to firestore
    let { tagsSelected, description, quantity, price, taxe } = this.state;
    const taxeValue = (taxe.rate / 100) * price.value * quantity.value;
    taxe.value = Number(taxeValue).toFixed(2);
    const product = tagsSelected[0];

    let orderLine = {
      product,
      description: description.value,
      quantity: Number(quantity.value),
      price: Number(price.value).toFixed(2),
      taxe,
      priority: product.type === 'produit' ? 0 : 1,
      category: product.category,
    };

    console.log("priority......", product.type)

    this.props.navigation.state.params.onGoBack(orderLine, this.orderKey);
    this.props.navigation.goBack();
  }

  handleDelete() {
    this.setState({ tagsSelected: [], price: { value: '', error: '' } });
  }

  refreshProduct(product) {
    this.setState({
      tagsSelected: [product],
      price: { value: product.price, error: '' },
      quantity: { value: '1', error: '' },
      taxe: { name: product.taxe, rate: Number(product.taxe), value: '' },
    });
  }

  addItem() {
    this.props.navigation.navigate('CreateProduct', {
      onGoBack: this.refreshProduct,
    });
  }

  render() {
    const {
      item,
      description,
      suggestions,
      tagsSelected,
      quantity,
      price,
      taxe,
      loading,
    } = this.state;
    const noItemSelected = tagsSelected.length === 0;
    const { isConnected } = this.props.network;
    const isAdmin = this.props.role.id === 'admin';
    const iconSize = isTablet ? 32 : 21;

    console.log("sug", suggestions)

    return (
      <View style={styles.container}>
        <Appbar
          back={!loading}
          title
          titleText="Ligne de commande"
          check={!loading}
          handleSubmit={this.handleSubmit}
        />

        <View style={{ padding: theme.padding }}>
          <Text
            style={[
              theme.customFontMSsemibold.caption,
              { color: theme.colors.primary },
            ]}>
            Article
          </Text>
          <View
            style={{ flexDirection: 'row', alignItems: 'flex-start', zIndex: 20 }}>
            <View style={{ flex: 0.9 }}>
              <AutoCompleteProducts
                placeholder="Écrivez pour choisir un article"
                suggestions={suggestions}
                tagsSelected={tagsSelected}
                main={this}
                //autoFocus={false}
                showInput={noItemSelected}
                errorText=""
                suggestionsBellow={true}
                role={this.props.role.id}
                showTextInput={tagsSelected.length === 0}
              />
            </View>

            {noItemSelected ? (
              isAdmin && (
                <TouchableOpacity
                  style={styles.plusIcon}
                  onPress={this.addItem}>
                  <CustomIcon
                    icon={faPlusCircle}
                    color={theme.colors.primary}
                    size={iconSize}
                  />
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                style={[styles.plusIcon, { paddingTop: 0 }]}
                onPress={this.handleDelete}>
                <CustomIcon
                  icon={faTimes}
                  color={theme.colors.placeholder}
                  size={iconSize}
                />
              </TouchableOpacity>
            )}
          </View>

          <MyInput
            label="Description"
            returnKeyType="done"
            value={description.value}
            onChangeText={(text) => updateField(this, description, text)}
            error={!!description.error}
            errorText={description.error}
            multiline={true}
          />

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 0.5, paddingRight: 15 }}>
              <MyInput
                label="Quantité"
                returnKeyType="done"
                keyboardType="numeric"
                value={quantity.value.toString()}
                onChangeText={(text) => updateField(this, quantity, text)}
                error={!!quantity.error}
                errorText={quantity.error}
              />
            </View>

            <View style={{ flex: 0.5, paddingLeft: 15 }}>
              <MyInput
                label="Prix unitaire HT"
                returnKeyType="done"
                keyboardType="numeric"
                value={price.value.toString()}
                onChangeText={(text) => updateField(this, price, text)}
                error={!!price.error}
                errorText={price.error}
                editable={isAdmin}
              />
            </View>
          </View>

          <View>
            <MyInput
              label="Taxe (%)"
              returnKeyType="done"
              keyboardType="numeric"
              value={taxe.name.toString()}
              onChangeText={(rate) => {
                let { taxe } = this.state;
                taxe.name = rate;
                taxe.rate = Number(rate);
                this.setState({ taxe });
              }}
              editable={isAdmin}
            />
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    role: state.roles.role,
    network: state.network,
    //fcmToken: state.fcmtoken
  };
};

export default connect(mapStateToProps)(AddItem);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  plusIcon: {
    flex: 0.1,
    padding: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
