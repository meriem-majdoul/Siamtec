import React, { memo } from 'react';
import { Image, StyleSheet } from 'react-native';
import { constants } from '../core/constants'

const ratio = 332 / 925
const width =  constants.ScreenWidth * 0.65
const height = width * ratio
// const width = constants.ScreenWidth * 0.32

const Logo = ({ style, ...props }) => (
  <Image source={require('../assets/logo1.png')} style={[styles.image,style]} />
);

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
    width:'60%',
    resizeMode: "contain",
  },
});

export default memo(Logo);
