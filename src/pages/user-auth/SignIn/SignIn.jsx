import React from "react";
import {connect} from "react-redux";

import {Navigate} from "react-router-dom";
import {Form, Button, Row, Col} from "react-bootstrap";
import {toast} from "react-toastify";

import {updateUser, clearUser} from "redux/User/actions";

import authClient from "api/auth";
import SpinLoader from "components/SpinLoader/SpinLoader";
import ErrorBox from "components/ErrorBox/ErrorBox";

import "./SignIn.scss";

import {
  __ls_set_access_token,
  __ls_set_refresh_token,
  __ls_set_auth_user,
} from "helpers/localStorageHelpers";

import {setTitle} from "helpers/setTitle";
import {log} from "helpers/logger";

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      submitted: false,
      errors: null,
      redirect: false,
    };
    setTitle("Sign In");
  }

  usernameChangeHandler(newUsername) {
    this.setState({username: newUsername});
  }
  passwordChangeHandler(newPassword) {
    this.setState({password: newPassword});
  }
  updateSubmitted(bool) {
    this.setState({submitted: bool});
  }
  updateErrors(newErrors) {
    this.setState({errors: newErrors});
  }

  submitHandler(e) {
    e.preventDefault();
    if (this.state.submitted) {
      log("Already submitted. Please wait for response.");
      return false;
    }
    this.updateSubmitted(true);

    const data = {username: this.state.username, password: this.state.password};
    const parent = this;
    toast
      .promise(authClient.signIn(data), {
        pending: {
          render() {
            return "Signing in...";
          },
        },
        success: {
          render({data}) {
            __ls_set_access_token(data.data.access);
            __ls_set_refresh_token(data.data.refresh);
            __ls_set_auth_user(data.data.user);
            parent.props.updateUser(data.data.user);
            return "Welcome back.";
          },
        },
        error: {
          render({data}) {
            parent.updateErrors(data.response.data);
            return "Sign-in Failed!";
          },
        },
      })
      .finally(() => this.updateSubmitted(false));
  }

  render() {
    const {errors} = this.state;
    const LEFT_COL = 3;
    const RIGHT_COL = 12 - LEFT_COL;

    if (this.props.user) return <Navigate to="/profile" replace />;

    return (
      <Form
        className="sign-in-form shadow rounded"
        onSubmit={e => this.submitHandler(e)}
      >
        <fieldset
          className="disabled-on-submit-wrapper"
          disabled={this.state.submitted}
        >
          <h4>Sign In</h4>
          <ErrorBox errors={errors} />
          <Form.Group
            as={Row}
            className="mb-2"
            controlId="formPlaintextUsername"
          >
            <Form.Label column sm={LEFT_COL} className="required">
              Username
            </Form.Label>
            <Col sm={RIGHT_COL}>
              <Form.Control
                type="input"
                placeholder="Enter your Username"
                required
                onChange={e => this.usernameChangeHandler(e.target.value)}
              />
            </Col>
          </Form.Group>

          <Form.Group
            as={Row}
            className="mb-3"
            controlId="formPlaintextPassword"
          >
            <Form.Label column sm={LEFT_COL} className="required">
              Password
            </Form.Label>
            <Col sm={RIGHT_COL}>
              <Form.Control
                type="password"
                placeholder="Enter your Password"
                required
                onChange={e => this.passwordChangeHandler(e.target.value)}
              />
            </Col>
          </Form.Group>
          <div className="d-inline">
            <Button variant="dark" className="submit-btn" type="submit">
              {"Sign In"}
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

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: user => dispatch(updateUser({user})),
    clearUser: () => dispatch(clearUser()),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
