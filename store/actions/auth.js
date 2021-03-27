import { AsyncStorage } from "react-native";

// export const SIGNUP = "SIGNUP";
// export const LOGIN = "LOGIN";
export const AUTHENTICATE = "AUTHENTICATE";
export const LOGOUT = "LOGOUT";
export const SET_DID_TRY_AL = "SET_DID_TRY_AL";

// token失効監視用
let timer;

export const setDidTryAL = () => {
  return { type: SET_DID_TRY_AL };
};

export const authenticate = (userId, token, expiryTime) => {
  return (dispatch) => {
    dispatch(setLogoutTimer(expiryTime));
    dispatch({ type: AUTHENTICATE, userId: userId, token: token });
  };
};

export const signup = (email, password) => {
  return async (dispatch) => {
    const response = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDU6Y8fgqQJ9PEKqwwVss8s08Ef0OGZinI",
      {
        method: "POST",
        header: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    // バリデーション
    if (!response.ok) {
      let message = "Something went wrong!";
      const errorResData = await response.json();
      const errorId = errorResData.error.message;
      if (errorId === "EMAIL_EXISTS") {
        message = "This email exists already!";
      }
      throw new Error(message);
    }

    const resData = await response.json();
    dispatch(
      authenticate(
        resData.localId,
        resData.idToken,
        parseInt(resData.expiresIn) * 1000
      )
    );

    // timestamp型で token が失効する日時を取得
    // .getTime() で現在時刻の ms を取得している
    const expirationDate = new Date(
      new Date().getTime() + parseInt(resData.expiresIn) * 1000
    );
    saveDataToStorage(resData.idToken, resData.localId, expirationDate);
  };
};

export const login = (email, password) => {
  return async (dispatch) => {
    const response = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDU6Y8fgqQJ9PEKqwwVss8s08Ef0OGZinI",
      {
        method: "POST",
        header: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    // バリデーション
    if (!response.ok) {
      let message = "Something went wrong!";
      const errorResData = await response.json();
      const errorId = errorResData.error.message;
      if (errorId === "EMAIL_NOT_FOUND") {
        message = "This email could not be found!";
      } else if (errorId === "INVALID_PASSWORD") {
        message = "This password is not valid!";
      }
      throw new Error(message);
    }

    const resData = await response.json();
    dispatch(
      authenticate(
        resData.localId,
        resData.idToken,
        parseInt(resData.expiresIn) * 1000
      )
    );

    // timestamp型で token が失効する日時を取得
    // .getTime() で現在時刻の ms を取得している
    const expirationDate = new Date(
      new Date().getTime() + parseInt(resData.expiresIn) * 1000
    );
    saveDataToStorage(resData.idToken, resData.localId, expirationDate);
  };
};

// ログアウト処理なのでわざわざ await してない
export const logout = () => {
  clearLogoutTimer();
  AsyncStorage.removeItem("userData");
  return { type: LOGOUT };
};

// 自動ログアウトのタイマーを削除する
// clearTimeout は javascriptのビルトイン関数
const clearLogoutTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
};

// token が失効したら自動でログアウト処理を行う
// setTimeout は javascriptのビルトイン関数
// expiryTime 経過したら自動でログアウト処理をする
const setLogoutTimer = (expirationTime) => {
  return (dispatch) => {
    timer = setTimeout(() => {
      dispatch(logout());
    }, expirationTime);
  };
};

// ローカルのメモリに情報を保存する（アプリを落としても消えない情報となる）
const saveDataToStorage = (token, userId, expirationDate) => {
  AsyncStorage.setItem(
    "userData",
    JSON.stringify({
      token: token,
      userId: userId,
      expiryDate: expirationDate.toISOString(), // .toISOString() を Timestamp から String に変換
    })
  );
};

// Setting a timer for a long period of time, i.e.... みたいな警告が出たら以下参考
// Go to node_modules/react-native/Libraries/Core/Timer/JSTimers.js
// Look for the variable MAX_TIMER_DURATION_MS
// Change 60 * 1000 to 10000 * 1000 , needed for firebase
