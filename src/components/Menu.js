
import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { List } from 'react-native-paper';
import * as theme from '../core/theme';
import { constants } from '../core/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu as PopupMenu, MenuOptions, MenuOption, MenuTrigger, } from 'react-native-popup-menu'
import { faEllipsisV } from 'react-native-fontawesome'

import CustomIcon from './CustomIcon'

const Menu = ({ options, functions, menuTrigger, ...props }) => (
  <PopupMenu>
    <MenuTrigger style={{ padding: 5 }}>
      {menuTrigger || <CustomIcon  style={{ paddingLeft: 4 }} />}
    </MenuTrigger>

    <MenuOptions>
      {options.map((option, index) => {
        return (
          <MenuOption key={index.toString()} onSelect={() => functions[option.id]()}
            style={{ flexDirection: 'row', padding: constants.ScreenWidth * 0.03 }}>
            <Text style={[theme.customFontMSregular.body, { color: theme.colors.secondary }]}>{option.title}</Text>
          </MenuOption>
        )
      })
      }
    </MenuOptions>
  </PopupMenu>
)

export default Menu