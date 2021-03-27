import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector, useDispatch } from "react-redux";
import HeaderButton from "../../components/UI/HeaderButton";
import * as productsActions from "../../store/actions/products";
import Input from "../../components/UI/Input";
import Colors from "../../constants/Colors";

const FORM_INPUT_UPDATE = "FORM_INPUT_UPDATE";

// Reducerを定義（Reduxとは何の関係もない）
// 第一引数の state は更新前の state を指す
const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value, // dynamic key
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid, // dynamic key
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      // 一つでも updatedValidities[key] が false なら formIsValide は false
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      formIsValid: updatedFormIsValid,
      inputValues: updatedValues,
      inputValidities: updatedValidities,
    };
  }
  return state;
};

// コンポーネント
const EditProductScreen = (props) => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const prodId = props.route.params ? props.route.params.productId : null;
  const editedProduct = useSelector((state) =>
    state.products.userProducts.find((prod) => prod.id === prodId)
  );

  // Redux の dispatcher を使用する
  const dispatch = useDispatch();

  // useReducer でコンポーネント外で定義されたReducerを読み込む（Reactの機能）（Reduxとは何の関係もない）
  // useReducer の第二引数は initial state
  // formState は更新後の State の値を指す
  // dispatchFormState は Reducer に対して action を dispatch できる関数
  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      title: editedProduct ? editedProduct.title : "",
      imageUrl: editedProduct ? editedProduct.imageUrl : "",
      description: editedProduct ? editedProduct.description : "",
      price: "",
    },
    inputValidities: {
      title: editedProduct ? true : false,
      imageUrl: editedProduct ? true : false,
      description: editedProduct ? true : false,
      price: editedProduct ? true : false,
    },
    formIsValid: editedProduct ? true : false,
  });

  useEffect(() => {
    if (error) {
      Alert.alert("An error occureed!", error, [{ text: "Okay" }]);
    }
  }, [error]);

  // 商品情報の Submit (この最終的なアクションは Redux の dispatcher を使用している)
  // useCallback を使い毎回のリレンダー時に関数が再び作成されるのを防いでいる
  // callback関数内の第二引数のアレイ内にある dependencies が変更されると中身がリビルドされる（useEffectも同様）
  const submitHandler = useCallback(async () => {
    if (!formState.formIsValid) {
      Alert.alert("Wrong input", "Please check the errors in the form", [
        { text: "Okay" },
      ]);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      if (editedProduct) {
        await dispatch(
          productsActions.updateProduct(
            prodId,
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imageUrl
          )
        );
      } else {
        await dispatch(
          productsActions.createProduct(
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imageUrl,
            +formState.inputValues.price
          )
        );
      }
      props.navigation.goBack();
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  }, [dispatch, prodId, formState]);

  // コンポーネント外の navigationOptions に submitHandler を渡す
  // 第二引数の[submitHandler]は変化することがないのでuseEffect内の処理が実行されるのは実質一度だけ
  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <HeaderButtons HeaderButtonComponent={HeaderButton}>
          <Item
            title="Save"
            iconName={
              Platform.OS === "android" ? "md-checkmark" : "ios-checkmark"
            }
            onPress={submitHandler}
          />
        </HeaderButtons>
      ),
    });
  }, [submitHandler]);

  // input の更新
  // この callback 関数は子コンポーネント内で実行されている（そこで引数も渡されている）
  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier,
      });
    },
    [dispatchFormState] // dispatchFormState が更新された時だけリビルド（つまりリビルドはない）
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={20}>
      <ScrollView>
        <View style={styles.form}>
          <Input
            id="title"
            label="Title"
            errorText="Please enter a valid Title!"
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.title : ""}
            initiallyValid={!!editedProduct}
            required
          />
          <Input
            id="imageUrl"
            label="Image Url"
            errorText="Please enter a valid Image Url!"
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.imageUrl : ""}
            initiallyValid={!!editedProduct}
            required
          />

          {editedProduct ? null : (
            <Input
              id="price"
              label="Price"
              onInputChange={inputChangeHandler}
              errorText="Please enter a valid Price!"
              keyboardType="decimal-pad"
              required
              min={0.1}
            />
          )}
          <Input
            id="description"
            label="Descriptino"
            errorText="Please enter a valid Description!"
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.description : ""}
            initiallyValid={!!editedProduct}
            multiline
            numberOfLines={3} // android only!
            required
            minLength={5}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const screenOptions = (navData) => {
  // params は何もパラメータがなければ undefined なのでその状態で params.submit とアクセスしようとするとエラー
  const routeParams = navData.route.params ? navData.route.params : {};
  return {
    headerTitle: routeParams.productId ? "Edit Product" : "Add Product",
  };
};

export default EditProductScreen;

const styles = StyleSheet.create({
  form: {
    margin: 20,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});

// useReducer は redux と何の関係もない
// → state の数が多い場合に一括管理したい時に使われる
