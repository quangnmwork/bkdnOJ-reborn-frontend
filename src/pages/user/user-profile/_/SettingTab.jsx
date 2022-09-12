import React from "react";
import {toast} from "react-toastify";
import {Row, Col, Form, Button, Container} from "react-bootstrap";

import {ErrorBox} from "components";
import profileClient from "api/profile";

class SettingTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      data: null,

      displayMode: "user",
      pw: "",
      pw2: "",
    };
  }

  changePasswordHandler() {
    this.setState({errors: null});

    const {pw, pw2} = this.state;
    if (pw !== pw2) {
      alert("Hai mật khẩu khác nhau.");
      return;
    }
    profileClient
      .changePassword({password: pw, password_confirm: pw2})
      .then(() => {
        toast.success("OK Password changed.");
      })
      .catch(err => {
        this.setState({errors: {errors: err.response.data}});
      });
  }

  render() {
    return (
      <div className="section setting-wrapper">
        <h5>Password Change</h5>
        <ErrorBox errors={this.state.errors} />
        <Container>
          <Row>
            <Form.Label column="sm" lg={3}>
              {" "}
              New Password{" "}
            </Form.Label>
            <Col>
              {" "}
              <Form.Control
                size="sm"
                type="password"
                id="pw"
                onChange={e => this.setState({pw: e.target.value})}
                value={this.state.pw}
              />
            </Col>
          </Row>
          <Row>
            <Form.Label column="sm" lg={3}>
              {" "}
              Confirm New Password{" "}
            </Form.Label>
            <Col>
              {" "}
              <Form.Control
                size="sm"
                type="password"
                id="pw2"
                onChange={e => this.setState({pw2: e.target.value})}
                value={this.state.pw2}
              />
            </Col>
          </Row>
          <Row>
            <Col className="mt-1">
              <Button
                size="sm"
                className="btn-svg"
                variant="dark"
                onClick={() => this.changePasswordHandler()}
              >
                Change Password
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default SettingTab;
