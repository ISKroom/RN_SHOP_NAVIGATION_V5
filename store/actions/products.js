import Product from "../../models/product";

export const DELETE_PRODUCT = "DELETE_PRODUCT";
export const CREATE_PRODUCT = "CREATE_PRODUCT";
export const UPDATE_PRODUCT = "UPDATE_PRODUCT";
export const SET_PRODUCTS = "SET_PRODUCTS";

export const fetchProducts = () => {
  return async (dispatch, getState) => {
    const userId = getState().auth.userId;
    try {
      // FirebaseにHTTPリクエスト
      const response = await fetch(
        "https://rn-complete-guide-7bcca-default-rtdb.firebaseio.com/products.json"
      );

      // .ok は responseオブジェクトのメソッドで 200 status か判定する
      // レスポンスがあっても想定外のレスポンスに対してはエラー扱いする
      if (!response.ok) {
        throw new Error("Something went wrong!!!");
      }

      // Firebase がDBに保存したデータをjson形式にする
      const resData = await response.json();
      // Redux が受け取れる形にデータを成形する
      const loadedProducts = [];
      for (const key in resData) {
        loadedProducts.push(
          new Product(
            key, // Firebaseの形式上 key が id に当たる
            resData[key].ownerId,
            resData[key].title,
            resData[key].imageUrl,
            resData[key].description,
            resData[key].price
          )
        );
      }
      // アプリ内のReduxStoreに対してアクションをディスパッチする
      dispatch({
        type: SET_PRODUCTS,
        products: loadedProducts,
        userProducts: loadedProducts.filter((prod) => prod.ownerId === userId),
      });
    } catch (err) {
      throw err;
    }
  };
};

export const deleteProduct = (productId) => {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    // Firebase内のデータを更新
    const response = await fetch(
      `https://rn-complete-guide-7bcca-default-rtdb.firebaseio.com/products/${productId}.json?auth=${token}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Something went wrong!!!");
    }

    // Redux内のデータを更新
    dispatch({ type: DELETE_PRODUCT, pid: productId });
  };
};

export const createProduct = (title, description, imageUrl, price) => {
  return async (dispatch, getState) => {
    const userId = getState().auth.userId;
    const token = getState().auth.token;
    // FirebaseにHTTPリクエスト
    const response = await fetch(
      `https://rn-complete-guide-7bcca-default-rtdb.firebaseio.com/products.json?auth=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          price,
          ownerId: userId,
        }),
      }
    );

    // Firebase がDBに保存したデータをjson形式にする
    const resData = await response.json();

    // アプリ内のReduxStoreに対してアクションをディスパッチする
    dispatch({
      type: CREATE_PRODUCT,
      productData: {
        id: resData.name, // Firebaseから帰ってくる"name"がDBで言うところのidとなっている
        title,
        description,
        imageUrl,
        price,
        ownerId: userId,
      },
    });
  };
};

export const updateProduct = (id, title, description, imageUrl) => {
  return async (dispatch, getState) => {
    // getState は Redux の State を指す
    // Firebaseのルールを利用してログインしたユーザーだけ許可している
    const token = getState().auth.token;
    // Firebase内のデータを更新
    const response = await fetch(
      `https://rn-complete-guide-7bcca-default-rtdb.firebaseio.com/products/${id}.json?auth=${token}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
        }),
      }
    );
    // Error Handling
    if (!response.ok) {
      throw new Error("Something went wrong!!!");
    }

    // Redux内のデータを更新
    dispatch({
      type: UPDATE_PRODUCT,
      pid: id,
      productData: {
        title,
        description,
        imageUrl,
      },
    });
  };
};
