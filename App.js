import React, { useState } from "react";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import AppLoading from "expo-app-loading";
import * as Font from "expo-font";
import { LogBox } from "react-native";
import ReduxThunk from "redux-thunk";

import productsReducer from "./store/reducers/products";
import cartReducer from "./store/reducers/cart";
import authReducer from "./store/reducers/auth";
import ordersReducer from "./store/reducers/orders";
import AppNavigator from "./navigation/AppNavigator";

// 無視していいけど表示が鬱陶しいので警告を非表示
LogBox.ignoreLogs([
  "Your project is accessing the following APIs from a deprecated global rather than a module import: Constants (expo-constants).",
]);

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer,
  auth: authReducer,
});

const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

const fetchFonts = () => {
  return Font.loadAsync({
    "open-sans": require("./assets/fonts/OpenSans-Regular.ttf"),
    "open-sans-bold": require("./assets/fonts/OpenSans-Bold.ttf"),
  });
};

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  // カスタムフォントのローディング
  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => {
          setFontLoaded(true);
        }}
        onError={(err) => console.log(err)}
      />
    );
  }

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}

// fontFamily “ionicons” is not a system font... みたいなエラーが出たらプロジェクトフォルダで以下実行（"open-sans"の場合も同様）
// rm -rf ./node_modules/expo/node_modules/expo-font/
