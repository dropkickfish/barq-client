import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import {
  updateBar as updateBarAction,
  updateOrder as updateOrderAction,
  updateStatus as updateStatusAction,
  clearOrder as clearOrderAction,
} from './store/actions/entities';
import { updatePage as updatePageAction } from './store/actions/view';

import Logo from './ui/logo';
import Menu from './containers/menu';
import Checkout from './containers/checkout';
import Pay from './containers/pay';
import Queue from './containers/queue';
import Closed from './containers/closed';

import './App.css';

class App extends Component { // eslint-disable-line
  switch = {
    MENU: () => {
      const {
        updatePage, bar, order, total,
      } = this.props;
      return (
        <Menu
          updatePage={updatePage}
          bar={bar}
          order={order}
          total={total}
          isMenuOpen={this.isMenuOpen}
        />
      );
    },
    CHECKOUT: () => {
      const {
        updatePage, total, order,
      } = this.props;
      return (
        <Checkout
          updatePage={updatePage}
          total={total}
          order={order}
          isMenuOpen={this.isMenuOpen}
        />
      );
    },
    PAY: () => {
      const {
        updatePage, updateOrder, order, total,
      } = this.props;
      return (
        <Pay
          updatePage={updatePage}
          updateOrder={updateOrder}
          order={order}
          total={total}
          isMenuOpen={this.isMenuOpen}
        />
      );
    },
    QUEUE: () => {
      const {
        order, updatePage, orderId, orderStatus, updateStatus, clearOrder,
      } = this.props;
      return (
        <Queue
          order={order}
          updatePage={updatePage}
          orderId={orderId}
          orderStatus={orderStatus}
          updateStatus={updateStatus}
          clearOrder={clearOrder}
          isMenuOpen={this.isMenuOpen}
        />
      );
    },
    CLOSED: () => (
      <Closed />
    ),
  }

  isMenuOpen = () => axios
    .get(`${window.location.pathname}/menu`)
    .then(res => {
      console.log(res.data);
      return res.data.open
    });

  componentDidMount = () => {
    axios.get(`${window.location.pathname}/menu`)
      .then((res) => {
        const {
          updateBar, updatePage, updateOrder,
        } = this.props;
        if (res.data.menu) updateBar(res.data);
        const cachedOrder = window.localStorage.getItem('order');
        if (cachedOrder) updateOrder(JSON.parse(cachedOrder));
        const { orderId, order } = this.props;
        if (orderId) updatePage('QUEUE');
        else if (!res.data.menu || res.data.open === false) updatePage('CLOSED');
        else if (order.length > 0) updatePage('CHECKOUT');
      });
  }

  render() {
    const { bar: { name }, page } = this.props;
    return (
      <div className="App">
        <Logo logoPath="/logo.jpg" barName={name} />
        { this.switch[page]() }
      </div>
    );
  }
}

const getOrderDetails = (order, catalog) => (
  Object.entries(order)
    .filter(([, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => ({ ...catalog[itemId], quantity }))
);

const getOrderTotal = (order, catalog) => {
  const orderDetails = getOrderDetails(order, catalog);
  const total = orderDetails.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);
  return total;
};

const mapStateToProps = state => ({
  bar: state.entities.bar,
  page: state.view.page,
  orderId: state.entities.order.orderId,
  orderStatus: state.entities.order.status,
  order: getOrderDetails(state.entities.order.items, state.entities.bar.catalog),
  total: getOrderTotal(
    state.entities.order.items,
    state.entities.bar.catalog,
  ),
});

const mapDispatchToProps = dispatch => ({
  updateBar: bar => dispatch(updateBarAction(bar)),
  updatePage: page => dispatch(updatePageAction(page)),
  updateOrder: order => dispatch(updateOrderAction(order)),
  updateStatus: status => dispatch(updateStatusAction(status)),
  clearOrder: () => dispatch(clearOrderAction()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
