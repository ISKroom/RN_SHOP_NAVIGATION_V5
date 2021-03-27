import React from "react";
import { useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";

import { ShopNavigator, AuthNavigator } from "./ShopNavigator";
import StartupScreen from "../screens/StartupScreen";

const AppNavigator = (props) => {
  // Redux の State から token の有無を取得
  const isAuth = useSelector((state) => !!state.auth.token);
  const didTryAutoLogin = useSelector((state) => state.auth.didTryAutoLogin);

  // SwitchNavigator の代わりに通常のReactのロジックで完結できる
  return (
    <NavigationContainer>
      {isAuth && <ShopNavigator />}
      {!isAuth && didTryAutoLogin && <AuthNavigator />}
      {!isAuth && !didTryAutoLogin && <StartupScreen />}
    </NavigationContainer>
  );
};

export default AppNavigator;
