
import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { List } from 'react-native-paper';
import * as theme from '../core/theme';
import { constants } from '../core/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu as PopupMenu, MenuOptions, MenuOption, MenuTrigger, } from 'react-native-popup-menu';

const Menu = ({ options, functions, menuTrigger, ...props }) => (
  <PopupMenu>
    <MenuTrigger style={{ padding: 5 }}>
      {menuTrigger ||
        <Icon
          name={'dots-horizontal'}
          size={22}
          color={'#000'}
          style={{ padding: 4 }} />
      }
    </MenuTrigger>

    <MenuOptions>
      {options.map((option) => {
        return (
          <MenuOption onSelect={() => functions[option.id]()}
            style={{ flexDirection: 'row', padding: constants.ScreenWidth * 0.03 }}>
            <Text style={theme.customFontMSmedium.body}>{option.title}</Text>
          </MenuOption>
        )
      })
      }
    </MenuOptions>
  </PopupMenu>
)

export default Menu