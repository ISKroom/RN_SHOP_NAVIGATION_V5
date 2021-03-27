import PRODUCTS from "../../data/dummy-data";
import {
  DELETE_PRODUCT,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  SET_PRODUCTS,
} from "../actions/products";
import Product from "../../models/product";

const initialState = {
  availableProducts: [],
  userProducts: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_PRODUCTS:
      return {
        availableProducts: action.products,
        userProducts: action.userProducts,
      };
    // 商品の追加
    case CREATE_PRODUCT:
      const newProduct = new Product(
        action.productData.id,
        action.productData.ownerId,
        action.productData.title,
        action.productData.imageUrl,
        action.productData.description,
        action.productData.price
      );
      return {
        ...state,
        availableProducts: state.availableProducts.concat(newProduct),
        userProducts: state.userProducts.concat(newProduct),
      };
    // 商品の更新
    case UPDATE_PRODUCT:
      const productIndex = state.userProducts.findIndex(
        (prod) => prod.id === action.pid
      );
      const updatedProduct = new Product(
        action.pid,
        state.userProducts[productIndex].ownerId,
        action.productData.title,
        action.productData.imageUrl,
        action.productData.description,
        state.userProducts[productIndex].price
      );
      // ユーザー商品の更新
      const updatedUserProducts = [...state.userProducts];
      updatedUserProducts[productIndex] = updatedProduct;
      const availableProductIndex = state.availableProducts.findIndex(
        (prod) => prod.id === action.pid
      );
      // 商品一覧の更新
      const updatedAvailableProducts = [...state.availableProducts];
      updatedAvailableProducts[availableProductIndex] = updatedProduct;
      return {
        ...state,
        availableProducts: updatedAvailableProducts,
        userProducts: updatedUserProducts,
      };
    // 商品の削除
    case DELETE_PRODUCT:
      return {
        ...state,
        userProducts: state.userProducts.filter(
          (product) => product.id !== action.pid
        ),
        availableProducts: state.availableProducts.filter(
          (product) => product.id !== action.pid
        ),
      };
  }
  return state;
};
