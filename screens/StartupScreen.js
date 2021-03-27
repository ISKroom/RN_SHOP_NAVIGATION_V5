import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  AsyncStorage,
} from "react-native";
import Colors from "../constants/Colors";
import { useDispatch } from "react-redux";
import * as authActions from "../store/actions/auth";

const StartupScreen = (props) => {
  const dispatch = useDispatch();

  // App起動時に最初に実行される
  // AsyncStorageからユーザー情報の取得を試みる
  useEffect(() => {
    const tryLogin = async () => {
      const userData = await AsyncStorage.getItem("userData");

      // ユーザー情報が存在しなかったらAuth画面に遷移
      if (!userData) {
        // props.navigation.navigate("Auth");
        dispatch(authActions.setDidTryAL());
        return;
      }

      const transformedData = JSON.parse(userData); // String を Object/Array に変換
      const { token, userId, expiryDate } = transformedData;
      const expirationDate = new Date(expiryDate);

      // token が既に失効していたら（もしくは token や userId が存在しなかったら）Auth画面に遷移
      if (expirationDate <= new Date() || !token || !userId) {
        // props.navigation.navigate("Auth");
        dispatch(authActions.setDidTryAL());
        return;
      }

      // Tokenの有効期限 - 現在の日時 = Token失効までの残り時間
      const expirationTime = expirationDate.getTime() - new Date().getTime();

      // props.navigation.navigate("Shop");
      dispatch(authActions.authenticate(userId, token, expirationTime));
    };
    tryLogin();
  }, [dispatch]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" coors={Colors.primary} />
    </View>
  );
};
export default StartupScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
