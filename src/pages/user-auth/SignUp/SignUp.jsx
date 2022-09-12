import React from "react";
import {Navigate} from "react-router-dom";
import {Form, Button, Row, Col} from "react-bootstrap";
import {toast} from "react-toastify";

import authClient from "api/auth";
import SpinLoader from "components/SpinLoader/SpinLoader";
import ErrorBox from "components/ErrorBox/ErrorBox";

import "./SignUp.scss";

import {setTitle} from "helpers/setTitle";
import {log} from "helpers/logger";

export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      email: "",
      password: "",
      password_confirm: "",
      submitted: false,
      errors: null,
      redirect: false,
    };
    setTitle("Sign Up");
  }
  updateSubmitted(bool) {
    this.setState({submitted: bool});
  }
  updateErrors(newErrors) {
    this.setState({errors: {errors: newErrors}});
  }

  submitHandler(e) {
    e.preventDefault();
    if (this.state.submitted) {
      log("Already submitted. Please wait for response.");
      return false;
    }
    this.updateSubmitted(true);

    const data = this.state;
    const parent = this;
    toast
      .promise(authClient.signUp(data), {
        pending: {
          render() {
            return "Signing up...";
          },
        },
        success: {
          render() {
            parent.setState({redirect: true});
            return "Account Signed Up.";
          },
        },
        error: {
          render({data}) {
            parent.updateErrors(data.response.data);
            return "Sign Up Failed.";
          },
        },
      })
      .finally(() => this.updateSubmitted(false));
  }

  render() {
    const {errors, redirect} = this.state;
    const LEFT_COL = 5;
    const RIGHT_COL = 12 - LEFT_COL;

    if (redirect) return <Navigate to="/sign-in" />;

    return (
      <Form
        className="sign-up-form shadow rounded"
        onSubmit={e => this.submitHandler(e)}
      >
        <fieldset
          className="disabled-on-submit-wrapper"
          disabled={this.state.submitted}
        >
          <h4 className="mb-3">Sign Up</h4>
          <ErrorBox errors={errors} />
          <Form.Group
            as={Row}
            className="mb-2 "
            controlId="formPlaintextUsername"
          >
            <Form.Label column lg={LEFT_COL} className="required">
              {" "}
              Username{" "}
            </Form.Label>
            <Col lg={RIGHT_COL}>
              <Form.Control
                type="input"
                placeholder="Enter your Username"
                required
                onChange={e => this.setState({username: e.target.value})}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-2" controlId="formPlaintextEmail">
            <Form.Label column lg={LEFT_COL} className="required">
              {" "}
              Email{" "}
            </Form.Label>
            <Col lg={RIGHT_COL}>
              <Form.Control
                type="email"
                placeholder="Enter your Email"
                required
                onChange={e => this.setState({email: e.target.value})}
              />
            </Col>
          </Form.Group>

          <Form.Group
            as={Row}
            className="mb-2"
            controlId="formPlaintextPassword"
          >
            <Form.Label column lg={LEFT_COL} className="required">
              {" "}
              Password{" "}
            </Form.Label>
            <Col lg={RIGHT_COL}>
              <Form.Control
                type="password"
                placeholder="Enter your Password"
                required
                onChange={e => this.setState({password: e.target.value})}
              />
            </Col>
          </Form.Group>

          <Form.Group
            as={Row}
            className="mb-3"
            controlId="formPlaintextPasswordConfirm"
          >
            <Form.Label column lg={LEFT_COL} className="required">
              {" "}
              Password Confirmation{" "}
            </Form.Label>
            <Col lg={RIGHT_COL}>
              <Form.Control
                type="password"
                placeholder="Re-enter your Password"
                required
                onChange={e =>
                  this.setState({password_confirm: e.target.value})
                }
              />
            </Col>
          </Form.Group>

          <div className="d-inline">
            <Button variant="dark" className="submit-btn" type="submit">
              {"Sign Up"}
            </Button>
            {this.state.submitted ? (
              <SpinLoader size={20} margin="0 10px" />
            ) : (
              <></>
            )}
          </div>
        </fieldset>
      </Form>
    );
  }
}
