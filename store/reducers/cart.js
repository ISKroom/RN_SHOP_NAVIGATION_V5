import { ADD_TO_CART, REMOVE_FROM_CART } from "../actions/cart";
import { ADD_ORDER } from "../actions/orders";
import { DELETE_PRODUCT } from "../actions/products";
import CartItem from "../../models/cart-item";

const initialState = {
  items: {},
  totalAmount: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
    // カートに商品を追加する際のアクション
    case ADD_TO_CART:
      // カートに入れようとしている商品の情報を取得
      const addedProduct = action.product;
      const prodPrice = addedProduct.price;
      const prodTitle = addedProduct.title;

      let updatedOrNewCartitem;

      // 既に同商品がカートに入っている場合
      if (state.items[addedProduct.id]) {
        updatedOrNewCartitem = new CartItem(
          state.items[addedProduct.id].quantity + 1,
          prodPrice,
          prodTitle,
          state.items[addedProduct.id].sum + prodPrice
        );
      } else {
        // まだ同商品がカートに入っていない場合
        updatedOrNewCartitem = new CartItem(1, prodPrice, prodTitle, prodPrice);
      }

      // 新しい State をリターン
      return {
        ...state,
        items: {
          ...state.items,
          [addedProduct.id]: updatedOrNewCartitem, // dynamic property, []内の値をKeyとして新しいオブジェクトを作成する
        },
        totalAmount: state.totalAmount + prodPrice,
      };

    // カートから商品を削除する
    case REMOVE_FROM_CART:
      const selectedCartItem = state.items[action.pid];
      const currentQty = selectedCartItem.quantity;
      let updatedCartItems;
      if (currentQty > 1) {
        // 商品数が2以上だったらマイナス1する
        const updatedCartItem = new CartItem(
          selectedCartItem.quantity - 1,
          selectedCartItem.productPrice,
          selectedCartItem.productTitle,
          selectedCartItem.sum - selectedCartItem.productPrice
        );
        updatedCartItems = { ...state.items, [action.pid]: updatedCartItem };
      } else {
        // 商品数が1だったら商品を削除する
        updatedCartItems = { ...state.items };
        delete updatedCartItems[action.pid];
      }
      return {
        ...state,
        items: updatedCartItems,
        totalAmount: Math.abs(
          state.totalAmount - selectedCartItem.productPrice
        ),
      };

    // 注文時のアクション（カート内の商品を削除する）
    case ADD_ORDER:
      return initialState;

    // 商品が削除された際にカートから該当の商品を削除する
    case DELETE_PRODUCT:
      // カートに該当の商品が入ってない場合は何もしない
      if (!state.items[action.pid]) {
        return state;
      }
      // カートから該当の商品を削除する
      const updatedItems = { ...state.items };
      const itemTotal = state.items[action.pid].sum;
      delete updatedItems[action.pid];
      return {
        ...state,
        items: updatedItems,
        totalAmount: state.totalAmount - itemTotal,
      };

    default:
      return state;
  }
};
