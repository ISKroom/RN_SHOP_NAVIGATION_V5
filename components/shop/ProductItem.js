import React from "react";
import {
  View,
  Text,
  Image,
  Button,
  StyleSheet,
  TouchableOpacity,
  TouchableNativeFeedback,
  Platform,
} from "react-native";

import Colors from "../../constants/Colors";
import Card from "../UI/Card";

const ProductItem = (props) => {
  // Android だと TouchableOpacity の onPress が実行された時の
  // エフェクトが汚いので、TouchableNativeFeedback に置換する
  let TouchableCmp = TouchableOpacity;
  if (Platform.OS === "android" && Platform.Version >= 21) {
    TouchableCmp = TouchableNativeFeedback;
  }

  let price = +props.price;
  price = price.toFixed(2);

  // 以下 View-View-TouchableCmp-View の囲いは画像にも正常にリップルエフェクトをつけたいがためにやってる
  // TouchableCmp は Child が一つでなければならない制約があるので children を View だ囲んでいる
  // TouchableCmp の useForeground で画像にもリップルエフェクトを発生させられる
  return (
    <Card style={styles.product}>
      <View style={styles.touchable}>
        <TouchableCmp onPress={props.onSelect} useForeground>
          <View>
            <View style={styles.imageContainer}>
              <Image style={styles.image} source={{ uri: props.image }} />
            </View>
            <View style={styles.details}>
              <Text style={styles.title}>{props.title}</Text>
              <Text style={styles.price}>${price}</Text>
            </View>
            <View style={styles.actions}>{props.children}</View>
          </View>
        </TouchableCmp>
      </View>
    </Card>
  );
};

export default ProductItem;

const styles = StyleSheet.create({
  product: {
    height: 300,
    margin: 20,
  },
  touchable: {
    overflow: "hidden",
    borderRadius: 10,
  },
  imageContainer: {
    width: "100%",
    height: "60%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  details: {
    alignItems: "center",
    height: "17%",
    padding: 10,
  },
  title: {
    fontSize: 18,
    marginVertical: 4,
    fontFamily: "open-sans",
  },
  price: {
    fontFamily: "open-sans-bold",
    fontSize: 14,
    color: "#888",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: "23%",
    paddingHorizontal: 20,
  },
});
