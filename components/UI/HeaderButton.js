import React from "react";
import { Platform } from "react-native";
import { HeaderButton } from "react-navigation-header-buttons";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/Colors";

const CustomHeaderButton = (props) => {
  return (
    <HeaderButton
      {...props}
      IconComponent={Ionicons}
      iconSize={23}
      color={Platform.OS === "android" ? "white" : Colors.primary}
    />
  );
};

export default CustomHeaderButton;

// install時に　npm install react-navigation-header-buttons@6.3.1　じゃないとエラーでした
// 一度エラーを起こしてからバージョンを変更したら expo start --clear を忘れずに
