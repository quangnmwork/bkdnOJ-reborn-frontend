import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";
import {Navigate} from "react-router-dom";
import {Form, Row, Col, Button} from "react-bootstrap";
import {FaRegTrashAlt, FaCogs} from "react-icons/fa";
import {VscRefresh} from "react-icons/vsc";

import userAPI from "api/user";
import {SpinLoader, ErrorBox} from "components";
import {withParams} from "helpers/react-router";
import {setTitle} from "helpers/setTitle";
import {randomString} from "helpers/random";

import "./Details.scss";

class AdminJudgeDetails extends React.Component {
  constructor(props) {
    super(props);
    const {id} = this.props.params;
    this.id = id;
    this.state = {
      loaded: false,
      errors: null,
      data: undefined,

      password: "",
    };
  }

  fetch() {
    userAPI
      .getUser({id: this.id})
      .then(res => {
        this.setState({
          data: res.data,
          loaded: true,
        });
        setTitle(`Admin | User. ${res.data.username}`);
      })
      .catch(err => {
        this.setState({
          loaded: true,
          errors: err,
        });
      });
  }

  componentDidMount() {
    setTitle(`Admin | User#${this.id}`);
    this.fetch();
  }

  inputChangeHandler(event, params = {isCheckbox: null}) {
    const isCheckbox = params.isCheckbox || false;

    let newData = this.state.data;
    if (!isCheckbox) newData[event.target.id] = event.target.value;
    else {
      newData[event.target.id] = !newData[event.target.id];
    }
    this.setState({data: newData});
  }

  deleteObjectHandler() {
    let conf = window.confirm(
      "Hãy hủy kích hoạt (De-activate) User này thay vì xóa. " +
        "Nếu xóa, mọi tài nguyên liên quan sẽ bị ảnh hưởng. Bạn có chắc không?"
    );
    if (conf) {
      userAPI
        .adminDeleteUser({id: this.id})
        .then(() => {
          toast.success("OK Deleted.");
          this.setState({redirectUrl: "/admin/user/"});
        })
        .catch(err => {
          toast.error(`Cannot delete. (${err})`);
        });
    }
  }

  getTime(key) {
    if (this.state.data && this.state.data[key]) {
      let time = new Date(this.state.data[key]);
      time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
      return time.toISOString().slice(0, 16);
    }
    return "";
  }
  setTime(key, v) {
    let time = new Date(v);
    const data = this.state.data;
    this.setState({data: {...data, [key]: time.toISOString()}});
  }

  formSubmitHandler(e) {
    e.preventDefault();
    this.setState({errbox_errors: null});

    let sendData = {...this.state.data};
    delete sendData.url;
    delete sendData.id;
    userAPI
      .adminEditUser({id: this.id, data: sendData})
      .then(() => {
        toast.success("OK Updated.");
        this.fetch();
      })
      .catch(err => {
        const data = err.response.data;
        toast.error(`Cannot update. (${err.response.status})`);
        this.setState({errbox_errors: {errors: data}});
      });
  }

  resetPassword() {
    this.setState({errbox_errors: null});

    const pw = this.state.password;
    const data = {password: pw, password_confirm: pw};

    userAPI
      .adminResetPassword({id: this.id, data})
      .then(() => {
        toast.success("OK Password Reset.");
      })
      .catch(err => {
        toast.error(`Password change failed. ${err.response.status}`);
        this.setState({errbox_errors: {errors: err.response.data}});
      });
  }

  render() {
    if (this.state.redirectUrl)
      return <Navigate to={`${this.state.redirectUrl}`} />;

    const {loaded, errors, data} = this.state;

    return (
      <div className="admin user-panel wrapper-vanilla">
        <h4 className="user-title">
          <div className="panel-header">
            <span className="title-text">
              {`User | ${data ? data.username : this.id}`}
              {!loaded && (
                <span>
                  <SpinLoader /> Loading...
                </span>
              )}
            </span>
            {loaded && (
              <span className="d-flex">
                <Button
                  className="btn-svg"
                  size="sm"
                  variant="danger"
                  onClick={() => this.deleteObjectHandler()}
                >
                  <FaRegTrashAlt />
                  <span className="d-none d-md-inline">Delete</span>
                </Button>
              </span>
            )}
          </div>
        </h4>
        <hr />
        <div className="user-details">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          <ErrorBox errors={this.state.errbox_errors} />
          {loaded && !errors && (
            <>
              <Row className="mt-2">
                <Form.Label column="sm" lg={2}>
                  {" "}
                  New Password{" "}
                </Form.Label>
                <Col lg={7} className="d-inline-flex">
                  <Form.Control
                    size="sm"
                    type="text"
                    onChange={e => this.setState({password: e.target.value})}
                    value={this.state.password}
                  />
                  <Button
                    size="sm"
                    variant="dark"
                    className="btn-svg ml-1 mr-1"
                    style={{flexShrink: 10, minWidth: "100px"}}
                    onClick={() => this.setState({password: randomString()})}
                  >
                    <VscRefresh />
                    <span>Gen</span>
                  </Button>
                </Col>
                <Col lg={3}>
                  <Button
                    size="sm"
                    variant="warning"
                    className="btn-svg"
                    onClick={() => this.resetPassword()}
                  >
                    <FaCogs />
                    <span>Reset Password</span>
                  </Button>
                </Col>
              </Row>

              <hr className="m-2"></hr>

              <Form id="user-general" onSubmit={e => this.formSubmitHandler(e)}>
                <Row>
                  <Form.Label column="sm" lg={1}>
                    {" "}
                    ID{" "}
                  </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="text"
                      placeholder="User ID"
                      id="id"
                      value={data.id || ""}
                      disabled
                      readOnly
                    />
                  </Col>
                  <Form.Label column="sm" lg={1}>
                    {" "}
                    Username{" "}
                  </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="text"
                      placeholder="Username"
                      id="username"
                      value={data.username || ""}
                      disabled
                      readOnly
                    />
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm"> Active </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="checkbox"
                      id="is_active"
                      checked={data.is_active || false}
                      onChange={e =>
                        this.inputChangeHandler(e, {isCheckbox: true})
                      }
                    />
                  </Col>
                  <Form.Label column="sm"> Staff Status </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="checkbox"
                      id="is_staff"
                      checked={data.is_staff || false}
                      onChange={e =>
                        this.inputChangeHandler(e, {isCheckbox: true})
                      }
                    />
                  </Col>
                  <Form.Label column="sm"> Superuser Status </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="checkbox"
                      id="is_superuser"
                      checked={data.is_superuser || false}
                      onChange={e =>
                        this.inputChangeHandler(e, {isCheckbox: true})
                      }
                    />
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" md={2}>
                    {" "}
                    Date Joined{" "}
                  </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="datetime-local"
                      id="date_joined"
                      value={this.getTime("date_joined")}
                      onChange={e =>
                        this.setTime("date_joined", e.target.value)
                      }
                    />
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" lg={1}>
                    {" "}
                    First Name{" "}
                  </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="text"
                      id="first_name"
                      onChange={e => this.inputChangeHandler(e)}
                      value={data.first_name}
                    />
                  </Col>

                  <Form.Label column="sm" lg={1}>
                    {" "}
                    Last Name{" "}
                  </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="text"
                      id="last_name"
                      onChange={e => this.inputChangeHandler(e)}
                      value={data.last_name}
                    />
                  </Col>

                  <Form.Label column="sm" lg={1}>
                    {" "}
                    Email{" "}
                  </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="text"
                      id="email"
                      onChange={e => this.inputChangeHandler(e)}
                      value={data.email}
                    />
                  </Col>
                </Row>
                {/* <Row>
                <Form.Label column="sm" md={2}> Last Login </Form.Label>
                <Col> <Form.Control size="sm" type="datetime-local" id="last_login"
                        value={this.getTime('last_login')}
                        onChange={(e)=>this.setTime('last_login', e.target.value)}
                /></Col>
              </Row> */}
                <hr className="m-2" />

                <Row>
                  <Col lg={10}>
                    {/* <sub>**Các thiết lập khác sẽ được thêm sau.</sub> */}
                  </Col>
                  <Col>
                    <Button variant="dark" size="sm" type="submit" className="">
                      Save
                    </Button>
                  </Col>
                </Row>
              </Form>
            </>
          )}
        </div>
      </div>
    );
  }
}

let wrappedPD = AdminJudgeDetails;
wrappedPD = withParams(wrappedPD);
const mapStateToProps = state => {
  return {user: state.user.user};
};
wrappedPD = connect(mapStateToProps, null)(wrappedPD);
export default wrappedPD;
