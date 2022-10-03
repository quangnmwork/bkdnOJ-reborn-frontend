import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";
import {Navigate} from "react-router-dom";
import {Form, Row, Col, Button} from "react-bootstrap";
import {FaRegTrashAlt, FaCogs, FaSave} from "react-icons/fa";
import {VscRefresh} from "react-icons/vsc";

import userAPI from "api/user";
import profileAPI from "api/profile";

import {SpinLoader, ErrorBox} from "components";
import {withParams} from "helpers/react-router";
import {setTitle} from "helpers/setTitle";
import {randomString} from "helpers/random";

import "./Details.scss";
import {qmClarify} from "helpers/components";

class AdminJudgeDetails extends React.Component {
  constructor(props) {
    super(props);
    const {username} = this.props.params;
    this.username = username;
    this.state = {
      loaded: false,
      errors: null,
      data: undefined,

      password: "",
    };
    setTitle(`Admin | User. ${username}`);
  }

  fetch() {
    userAPI
      .getUser({username: this.username})
      .then(res => {
        this.setState({
          data: res.data,
          loaded: true,
        });
      })
      .catch(err => {
        this.setState({
          loaded: true,
          errors: err,
        });
      });
  }

  componentDidMount() {
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
        .adminDeleteUser({username: this.username})
        .then(() => {
          toast.success("OK Deleted.");
          this.setState({redirectUrl: "/admin/users/"});
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
      .adminEditUser({username: this.username, data: sendData})
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
      .adminResetPassword({username: this.username, data})
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
            <span className="title-text">{`User | ${this.username}`}</span>
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
          {!loaded ? (
            <div style={{minHeight: "100px"}} className="flex-center">
              <span>
                {" "}
                <SpinLoader /> Loading...{" "}
              </span>
            </div>
          ) : (
            <>
              <div className="border p-1 m-1">
                <strong>Account Settings</strong>
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
                          onChange={e =>
                            this.setState({password: e.target.value})
                          }
                          value={this.state.password}
                        />
                        <Button
                          size="sm"
                          variant="dark"
                          className="btn-svg ml-1 mr-1"
                          style={{flexShrink: 10, minWidth: "100px"}}
                          onClick={() =>
                            this.setState({password: randomString()})
                          }
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

                    <Form
                      id="user-general"
                      onSubmit={e => this.formSubmitHandler(e)}
                    >
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
                        {/* <Form.Label column="sm" lg={1}>
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
                        </Col> */}

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
                      <Row>
                        <Col>
                          {/* <sub>**Các thiết lập khác sẽ được thêm sau.</sub> */}
                        </Col>
                        <Col lg={4}>
                          <Button
                            variant="dark"
                            size="sm"
                            type="submit"
                            className="btn-svg"
                          >
                            <FaSave /> Save Account Settings
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </>
                )}
              </div>
              <div className="border p-1 m-1">
                <strong>Profile Settings</strong>
                <UserProfileSection
                  username={this.username}
                  parentFetch={() => this.fetch()}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}

class UserProfileSection extends React.Component {
  constructor(props) {
    super(props);
    this.username = this.props.username;
    this.state = {
      loaded: false,
      errors: null,
      data: null,
    };
  }

  fetch() {
    this.setState({loaded: false, errors: null});
    profileAPI
      .adminGetProfile({username: this.username})
      .then(res => {
        this.setState({
          loaded: true,
          data: res.data,
        });
      })
      .catch(err => {
        this.setState({
          loaded: true,
          errors: err.response.data,
        });
        console.log(err);
      });
  }

  componentDidMount() {
    this.fetch();
  }

  formSubmitHandler(e) {
    e.preventDefault();
    const data = this.state.data;
    const apiCall = profileAPI.adminEditProfile({
      username: this.username,
      data: data,
    });

    const parent = this;
    toast.promise(apiCall, {
      pending: {
        render() {
          return "Processing...";
        },
      },
      success: {
        render() {
          parent.fetch();
          return "Success.";
        },
      },
      error: {
        render({data}) {
          parent.setState({
            errors: data.response.data,
          });
          return "Update Failed.";
        },
      },
    });
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

  render() {
    const {loaded, data, errors} = this.state;
    return (
      <>
        <ErrorBox errors={errors} />
        {loaded === false && (
          <div className="flex-center" style={{minHeight: "100px"}}>
            <span>
              <SpinLoader />
              Loading
            </span>
          </div>
        )}
        {loaded && (
          <div>
            <Form id="user-profile" onSubmit={e => this.formSubmitHandler(e)}>
              <Row>
                <Form.Label column="sm" md={3}>
                  First Name
                </Form.Label>
                <Col md={9}>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="First name"
                    id="first_name"
                    value={data.first_name || ""}
                    onChange={e => this.inputChangeHandler(e)}
                  />
                </Col>
                <Form.Label column="sm" md={3}>
                  Last Name
                </Form.Label>
                <Col md={9}>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Last name"
                    id="last_name"
                    value={data.last_name || ""}
                    onChange={e => this.inputChangeHandler(e)}
                  />
                </Col>
              </Row>

              <Row>
                <Col xl={12}>
                  <Form.Label column="sm">
                    {" "}
                    Display Name
                    {qmClarify(
                      "Display Name (Tên hiển thị) sẽ được hiển thị thay cho username nếu được set (vd. trên Standing)"
                    )}
                  </Form.Label>
                </Col>
                <Col>
                  <Form.Control
                    size="sm"
                    type="text"
                    id="display_name"
                    placeholder="None"
                    value={data.display_name || ""}
                    onChange={e => this.inputChangeHandler(e)}
                  />
                </Col>
                <Col xl={12}>
                  <Form.Label column="sm"> About </Form.Label>
                </Col>
                <Col>
                  <Form.Control
                    as="textarea"
                    size="sm"
                    id="about"
                    placeholder="Thông tin về người dùng này"
                    value={data.about || ""}
                    onChange={e => this.inputChangeHandler(e)}
                  />
                </Col>
              </Row>

              <Row>
                <Form.Label column="sm" lg={3}>
                  Performance Point{" "}
                  {qmClarify("Điểm đặc biệt, chưa được sử dụng.")}
                </Form.Label>
                <Col>
                  <Form.Control
                    size="sm"
                    type="number"
                    step="0.01"
                    min="0.0"
                    id="performance_points"
                    onChange={e => this.inputChangeHandler(e)}
                    value={data.performance_points}
                  />
                </Col>

                <Form.Label column="sm" lg={3}>
                  Solved Count
                </Form.Label>
                <Col>
                  <Form.Control
                    size="sm"
                    type="number"
                    id="problem_count"
                    min="0"
                    onChange={e => this.inputChangeHandler(e)}
                    value={data.problem_count}
                  />
                </Col>
              </Row>

              <Row>
                <Form.Label column="sm" lg={2}>
                  Points {qmClarify("Điểm đạt được thông qua giải Problem.")}
                </Form.Label>
                <Col>
                  <Form.Control
                    size="sm"
                    type="number"
                    step="0.01"
                    min="0.0"
                    id="points"
                    onChange={e => this.inputChangeHandler(e)}
                    value={data.points}
                  />
                </Col>

                <Form.Label column="sm">Rating</Form.Label>
                <Col>
                  <Form.Control
                    size="sm"
                    type="number"
                    min="0"
                    id="rating"
                    onChange={e => this.inputChangeHandler(e)}
                    value={data.rating}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  {/* <sub>**Các thiết lập khác sẽ được thêm sau.</sub> */}
                </Col>
                <Col lg={4}>
                  <Button
                    variant="dark"
                    size="sm"
                    type="submit"
                    className="btn-svg"
                  >
                    <FaSave /> Save Profile
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        )}
      </>
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
