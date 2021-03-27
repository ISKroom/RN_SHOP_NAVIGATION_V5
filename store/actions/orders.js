import Order from "../../models/order";

export const ADD_ORDER = "ADD_ORDER";
export const SET_ORDERS = "SET_ORDERS";

export const fetchOrders = () => {
  return async (dispatch, getState) => {
    const userId = getState().auth.userId;
    try {
      const response = await fetch(
        `https://rn-complete-guide-7bcca-default-rtdb.firebaseio.com/orders/${userId}.json`,
        {
          method: "GET",
        }
      );
      const resData = await response.json();
      const loadedOrders = [];
      for (const key in resData) {
        loadedOrders.push(
          new Order(
            key,
            resData[key].cartItems,
            resData[key].totalAmount,
            new Date(resData[key].date)
          )
        );
      }
      dispatch({ type: SET_ORDERS, orders: loadedOrders });
    } catch (err) {
      throw err;
    }
  };
};

export const addOrder = (cartItems, totalAmount) => {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    const userId = getState().auth.userId;
    // 日時を取得
    const date = new Date();

    // FirebaseにHTTPリクエスト
    const response = await fetch(
      `https://rn-complete-guide-7bcca-default-rtdb.firebaseio.com/orders/${userId}.json?auth=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems,
          totalAmount,
          date: date.toISOString(),
        }),
      }
    );
    // Error Handling
    if (!response.ok) {
      throw new Error("Something went wrong!!!");
    }

    // Firebase がDBに保存したデータをjson形式にする
    const resData = await response.json();

    // Redux内のデータを更新
    dispatch({
      type: ADD_ORDER,
      orderData: {
        id: resData.name,
        items: cartItems,
        amount: totalAmount,
        date: date,
      },
    });
  };
};
