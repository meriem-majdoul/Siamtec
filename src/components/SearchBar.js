import React, { memo } from "react";
import { StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faBars, faTimes, faSearch, faArrowLeft, faCheck, faFilter } from "@fortawesome/free-solid-svg-icons";
import { Searchbar } from "react-native-paper";
import * as theme from "../core/theme";
import { isTablet } from "../core/constants";
import { useNavigation } from "@react-navigation/native";

const SearchBar = ({
  menu = true,
  close,
  main,
  placeholder,
  showBar,
  title,
  titleText,
  searchInput = "",
  searchUpdated,
  handleSearch,
  magnifyStyle,
  check,
  handleSubmit,
  filterComponent,
  style,
  ...props
}) => {
  const navigation = useNavigation();

  const showMenu = () => navigation.openDrawer();
  const navBack = () => navigation.pop();

  const AppBarIcon = ({ icon, onPress, style }) => (
    <Appbar.Action
      icon={() => <FontAwesomeIcon icon={icon} size={24} />}
      onPress={onPress}
      style={[styles.icon, style]}
    />
  );

  const renderLeftIcon = () => {
    const icon = showBar ? faArrowLeft : menu ? faBars : faTimes;
    const handleAction = showBar ? handleSearch : menu ? showMenu : navBack;
    return <AppBarIcon icon={icon} onPress={handleAction} />;
  };

  return (
    <Appbar.Header style={[styles.header, style]}>
      {renderLeftIcon()}
      {title && (
        <Appbar.Content
          title={titleText}
          titleStyle={[styles.title, { marginLeft: 10,color:'#000'}]}
        />
      )}
      {showBar && (
        <Searchbar
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray_dark}
          onChangeText={searchUpdated}
          value={searchInput}
          inputStyle={[styles.input, { color: theme.colors.secondary }]}
          style={styles.searchbar}
          theme={{ colors: { placeholder: "#fff", text: "#fff" } }}
        />
      )}
      {!showBar && <AppBarIcon icon={faSearch} onPress={handleSearch} />}
      {!showBar && filterComponent}
      {check && !showBar && <AppBarIcon icon={faCheck} onPress={handleSubmit} />}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.appBar,
    elevation: 0,
  },
  title: {
    ...theme.customFontMSregular.header,
    letterSpacing: 1,
    fontSize:18
  },
  searchbar: {
    backgroundColor: theme.colors.appBar,
    elevation: 0,
  },
  input: {
    ...theme.customFontMSregular.h3,
  },
  icon: {
    color: "black",
  },
});

export default memo(SearchBar);
