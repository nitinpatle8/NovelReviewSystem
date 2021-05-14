import axios from "axios";
import * as orderConstants from "../constants/orderConstants";
import * as cartConstants from "../constants/cartConstants";

export const createOrder = (orderData) => async (dispatch, getState) => {
  try {

    // localStorage.removeItem("cartItems");
    // localStorage.removeItem("shippingAddress");
    // localStorage.removeItem("paymentMethod");
    console.log("in orderAction in Actions ", orderData);
    console.log("in create order actions/orderActions.js");
    dispatch({ type: orderConstants.CREATE_ORDER_START });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.post("/api/v1/order/", orderData, config).then((resp) => {
      const data = resp.data.data;

      dispatch({
        type: orderConstants.CREATE_ORDER_SUCCESS,
        payload: data,
      });
    });

    localStorage.removeItem("cartItems");
    localStorage.removeItem("shippingAddress");
    localStorage.removeItem("paymentMethod");
    dispatch({
      type: cartConstants.CART_RESET,
    });
  } catch (error) {
    console.log("error in create order actions/orderActions.js");
    dispatch({
      type: orderConstants.CREATE_ORDER_FAIL,
      payload:
        error.response && error.response.data.error
          ? error.response.data.error
          : error.message,
    });
  }
};

export const getOrder = (orderId, initialLoading) => async (
  dispatch,
  getState
) => {
  try {
    console.log("in get order in actions/orderActions.js");
    if (initialLoading) {
      dispatch({ type: orderConstants.GET_ORDER_START });
    }

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.get(`/api/v1/order/${orderId}`, config).then((resp) => {
      const data = resp.data.data;

      dispatch({
        type: orderConstants.GET_ORDER_SUCCESS,
        payload: data,
      });
    });
  } catch (error) {
    console.log("error in get order in actions/orderActions.js");
    dispatch({
      type: orderConstants.GET_ORDER_FAIL,
      payload:
        error.response && error.response.data.error
          ? error.response.data.error
          : error.message,
    });
  }
};

export const payOrder = (orderId, paymentResult) => async (
  dispatch,
  getState
) => {
  try {
    console.log("in pay order in actions/orderActions");
    dispatch({
      type: orderConstants.ORDER_PAY_START,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios
      .post(`/api/v1/order/${orderId}/pay`, paymentResult, config)
      .then((resp) => {
        const message = resp.data.message;

        dispatch({
          type: orderConstants.ORDER_PAY_SUCCESS,
          payload: message,
        });
      });
  } catch (error) {
    console.log("error in pay order in actions/orderActions");
    dispatch({
      type: orderConstants.ORDER_PAY_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const deliverOrder = (orderId) => async (dispatch, getState) => {
  try {
    console.log("in deliver order in actions/orderActions");
    dispatch({
      type: orderConstants.ORDER_DILIVERD_START,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios
      .post(`/api/v1/order/${orderId}/deliver`, {}, config)
      .then((resp) => {
        const data = resp.data.data;

        dispatch({
          type: orderConstants.ORDER_DILIVERD_SUCCESS,
          payload: data,
        });
      });
  } catch (error) {
    console.log("error in deliver order in actions/orderActions");
    dispatch({
      type: orderConstants.ORDER_DILIVERD_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const authOrder = () => async (dispatch, getState) => {
  try {
    console.log("in auth order in actions/orderActions");
    dispatch({
      type: orderConstants.AUTH_ORDER_FETCH_START,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.get(`/api/v1/order/authOrders`, config).then((resp) => {
      const data = resp.data.data;
      const count = resp.data.count;

      dispatch({
        type: orderConstants.AUTH_ORDER_FETCH_SUCCESS,
        payload: data,
        total: count,
      });
    });
  } catch (error) {
    console.log("error in auth order in actions/orderActions");
    dispatch({
      type: orderConstants.AUTH_ORDER_FETCH_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const listOrders = () => async (dispatch, getState) => {
  try {
    console.log("in list orders in actions/orderActions");
    dispatch({
      type: orderConstants.ORDERLIST_FETCH_START,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.get(`/api/v1/order/`, config).then((resp) => {
      const data = resp.data.results;
      const totalOrders = resp.data.count;

      dispatch({
        type: orderConstants.ORDERLIST_FETCH_SUCCESS,
        payload: {
          data,
          totalOrders,
        },
      });
    });
  } catch (error) {
    console.log("error in list orders in actions/orderActions");
    dispatch({
      type: orderConstants.ORDERLIST_FETCH_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
