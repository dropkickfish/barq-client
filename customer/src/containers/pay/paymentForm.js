import React, { Component } from 'react';
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
} from 'react-stripe-elements';
import axios from 'axios';

import Loader from '../../ui/loader';
import Footer from '../../ui/footer';

class PaymentForm extends Component {
  readyCounter = 0;

  buttonStates = {
    loading: {
      title: 'Loading',
      clickable: false,
      type: 'neutral',
    },
    paying: {
      title: 'Paying...',
      clickable: false,
      type: 'neutral',
    },
    success: {
      title: 'Track order!',
      clickable: true,
      type: 'success',
    },
    failed: {
      title: 'Try Again',
      clickable: true,
      type: 'danger',
    },
    ready: {
      title: 'Submit',
      clickable: true,
      type: 'success',
    },
  }

  state = {
    paid: false,
    button: this.buttonStates.loading,
  };

  getStripeToken = async () => {
    const { stripe } = this.props;
    const { token } = await stripe.createToken({ name: 'test' });
    if (!token) throw new Error('Failed');
    return token;
  }

  createOrderData = async (total, order) => {
    const token = await this.getStripeToken();
    return {
      stripe: {
        amount: Number((total * 100).toFixed(0)),
        currency: 'eur',
        description: 'Drinks order',
        source: token.id,
        statement_descriptor: 'Drinks order',
      },
      order: {
        items: order,
      },
    };
  }

  handleSubmit = async (e) => {
    const { button: { clickable } } = this.state;
    const {
      total, order, updateOrder, updatePage,
    } = this.props;

    e.preventDefault();
    if (!clickable) return;

    try {
      const { paying, success } = this.buttonStates;
      this.setState({ button: paying });
      const orderData = await this.createOrderData(total, order);
      const { data } = await axios.post(`${window.location.pathname}/pay`, orderData);
      if (data.status === 'paid') {
        window.localStorage.setItem('order', JSON.stringify(data));
        updateOrder(data);
        this.setState({
          paid: true,
          button: success,
        });
        updatePage('QUEUE');
      }
    } catch (err) {
      const { failed } = this.buttonStates;
      this.setState({ button: failed });
    }
  }

  handleBlur = () => null;

  handleChange = () => null;

  handleFocus = () => null;

  handleReady = () => {
    this.readyCounter += 1;
    if (this.readyCounter === 4) {
      this.setState({ button: this.buttonStates.ready });
    }
  };

  createOptions = fontSize => ({
    style: {
      base: {
        fontSize,
        color: 'white',
        letterSpacing: '0.025em',
        fontFamily: 'Source Code Pro, monospace',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  });

  render() {
    const {
      button: { title, type, clickable },
      paid,
    } = this.state;
    const { updatePage } = this.props;
    return (
      <>
        {
          title === 'Loading'
          && <Loader />
        }
        <form
          className={`pay__form${title === 'Loading' ? '--invisible' : ''}`}
          onSubmit={this.handleSubmit}
        >
          <label className="pay__number">
            Card number
            <CardNumberElement
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              onFocus={this.handleFocus}
              onReady={this.handleReady}
              {...this.createOptions('16px')}
            />
          </label>
          <label className="pay__expiry">
            Expiration date
            <CardExpiryElement
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              onFocus={this.handleFocus}
              onReady={this.handleReady}
              {...this.createOptions('16px')}
            />
          </label>
          <div>
            <label className="pay__cvc">
              CVC
              <CardCVCElement
                onBlur={this.handleBlur}
                onChange={this.handleChange}
                onFocus={this.handleFocus}
                onReady={this.handleReady}
                {...this.createOptions('16px')}
              />
            </label>
            <label className="pay__postal">
              Postal code
              <PostalCodeElement
                onBlur={this.handleBlur}
                onChange={this.handleChange}
                onFocus={this.handleFocus}
                onReady={this.handleReady}
                {...this.createOptions('16px')}
              />
            </label>
          </div>
          <Footer
            primaryButtonName={title}
            primaryButtonType={type}
            primaryButtonClickable={clickable}
            secondaryButtonName={paid ? null : 'Back'}
            onSecondaryClick={paid ? null : () => updatePage('CHECKOUT')}
          />
        </form>
      </>
    );
  }
}

export default injectStripe(PaymentForm);