import React, { Component } from 'react';
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
} from 'react-stripe-elements';
import axios from 'axios';

import Loader from '../../ui/loader'; // eslint-disable-line
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

  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      this.setState({
        button: this.buttonStates.paying,
      });
      const { token } = await this.props.stripe.createToken({ name: 'test' });
      if (!token) throw new Error('Failed');
      const orderData = {
        stripe: {
          amount: this.props.totals.total,
          currency: 'eur',
          description: 'Drinks order',
          source: token,
          statement_descriptor: '',
        },
        order: {
          items: this.props.order,
        },
      };
      const { data } = await axios.post('https://private-anon-cdc859ad92-barq.apiary-mock.com/barId/pay', orderData);
      if (data.status === 'paid') {
        this.props.updateOrder(data);
        this.setState({
          paid: true,
          button: this.buttonStates.success,
        });
        this.props.updatePage('QUEUE');
      }
    } catch (err) {
      console.log(err);
      this.setState({
        button: this.buttonStates.failed,
      });
    }
  }

  handleBlur = () => null;

  handleChange = () => null;

  handleFocus = () => null;

  handleReady = () => {
    this.readyCounter += 1;
    if (this.readyCounter === 4) {
      this.setState({
        button: this.buttonStates.ready,
      });
    }
  };

  createOptions = (fontSize, padding) => ({
    style: {
      base: {
        fontSize,
        color: '#424770',
        letterSpacing: '0.025em',
        fontFamily: 'Source Code Pro, monospace',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding,
      },
      invalid: {
        color: '#9e2146',
      },
    },
  });

  render() {
    return (
      <form className="pay__form" onSubmit={this.handleSubmit}>
        <label>
          Card number
          <CardNumberElement
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onReady={this.handleReady}
            {...this.createOptions(this.props.fontSize)}
          />
        </label>
        <label>
          Expiration date
          <CardExpiryElement
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onReady={this.handleReady}
            {...this.createOptions(this.props.fontSize)}
          />
        </label>
        <label>
          CVC
          <CardCVCElement
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onReady={this.handleReady}
            {...this.createOptions(this.props.fontSize)}
          />
        </label>
        <label>
          Postal code
          <PostalCodeElement
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onReady={this.handleReady}
            {...this.createOptions(this.props.fontSize)}
          />
        </label>
        <Footer
          primaryButtonName={this.state.button.title}
          primaryButtonType={this.state.button.type}
          primaryButtonClickable={this.state.button.clickable}
          secondaryButtonName={this.state.paid ? null : 'Back'}
          onSecondaryClick={this.state.paid ? null : () => this.props.updatePage('CHECKOUT')}
        />
      </form>
    );
  }
}

export default injectStripe(PaymentForm);
