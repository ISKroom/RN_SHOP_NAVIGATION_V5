import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { HeaderButtons, Item } from "react-navigation-header-buttons";

import HeaderButton from "../../components/UI/HeaderButton";
import ProductItem from "../../components/shop/ProductItem";
import * as cartActions from "../../store/actions/cart";
import * as productsActions from "../../store/actions/products";
import Colors from "../../constants/Colors";

const ProductsOverviewScreen = (props) => {
  // control for non-pull-to-refresh spinner
  const [isLoading, setIsLoading] = useState(false);
  // control for pull-to-refresh spinner (FlatListのデフォルト機能として存在するスピナー)
  const [isRefreshing, setIsRefreshing] = useState(false);
  // error state
  const [error, setError] = useState();

  // useSelector で redux の state にアクセスできる
  const products = useSelector((state) => state.products.availableProducts);
  // useDispatch で redux の dispatcher にアクセスできる
  const dispatch = useDispatch();

  // 商品一覧のロードが完了するまでロードスピナーを表示する
  // この関数自体は pull-to-refresh spinner のみ考慮している
  const loadProducts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 商品一覧のロード
      await dispatch(productsActions.fetchProducts());
    } catch (err) {
      // このエラーは　~/actions/products.js で上がってくるエラーに当たる
      setError(err.message);
    }
    setIsRefreshing(false);
  }, [dispatch, setIsLoading, setError]);

  // コンポーネントが最初にロードされた際の一度だけ実行
  // useEffect に async をつけることはできないので useEffect 内で async つきの関数を実行する
  useEffect(() => {
    setIsLoading(true);
    loadProducts();
    setIsLoading(false);
  }, [dispatch]);

  // Drawer で遷移するとコンポーネントは保持されるが StackNavigator で遷移すると再ロードされるらしい
  // なのでナビゲーション遷移でこのコンポーネントがFocusされる度に最新の情報をフェッチするためにリスナーを作成して商品の再ロードを行う
  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", loadProducts);
    // クリーンアップ関数
    return () => {
      unsubscribe();
    };
  }, [loadProducts]);

  const selectItemHandler = (id, title) => {
    props.navigation.navigate("ProductDetail", {
      productId: id,
      productTitle: title,
    });
  };

  // エラーハンドリング
  if (error) {
    return (
      <View style={styles.centered}>
        <Text>An Error Occured.</Text>
        <Button title="Try Again" onPress={() => {}} /> //好きに設定してください
      </View>
    );
  }

  // 商品一覧のロードが完了するまでロードスピナーを表示する
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // 商品一覧に商品が存在しない場合はテキストを表示する
  if (!isLoading && products.length == 0) {
    return (
      <View style={styles.centered}>
        <Text>No products found. Maybe start adding some!</Text>
      </View>
    );
  }

  return (
    <FlatList
      onRefresh={loadProducts} // Pull to Refresh 機能を追加
      refreshing={isRefreshing} // Pull to Refresh 機能を追加
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={(itemData) => (
        <ProductItem
          image={itemData.item.imageUrl}
          title={itemData.item.title}
          price={itemData.item.price}
          onSelect={() => {
            selectItemHandler(itemData.item.id, itemData.item.title);
          }}
        >
          <Button
            color={Colors.primary}
            title="View Details"
            onPress={() => {
              selectItemHandler(itemData.item.id, itemData.item.title);
            }}
          />
          <Button
            color={Colors.primary}
            title="Cart"
            onPress={() => {
              dispatch(cartActions.addToCart(itemData.item));
            }}
          />
        </ProductItem>
      )}
    />
  );
};

// ShopNavigator.js で使用する
export const screenOptions = (navData) => {
  return {
    headerTitle: "All Products",
    headerLeft: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Menu"
          iconName={Platform.OS === "android" ? "md-menu" : "ios-menu"}
          onPress={() => {
            navData.navigation.toggleDrawer();
          }}
        />
      </HeaderButtons>
    ),
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Cart"
          iconName={Platform.OS === "android" ? "md-cart" : "ios-cart"}
          onPress={() => {
            navData.navigation.navigate("Cart");
          }}
        />
      </HeaderButtons>
    ),
  };
};

export default ProductsOverviewScreen;

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});

// 以下トラブルシューティング
// エラー：TypeError: (0, _native.useTheme) is not a function. (In '(0, _native.useTheme)()', '(0, _native.useTheme)' is undefined)
// 解決法以下
// What helped me was to run npm install react-navigation-header-buttons@6 to install 6.3.1, initially I had 7.1 some thing, somehow not compatible.
// One IMPORTANT thing, every time You update your packages, don't forget to clear cache by running expo start --clear command.
