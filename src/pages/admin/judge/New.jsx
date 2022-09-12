import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";
import {Navigate} from "react-router-dom";
import {Form, Row, Col, Button} from "react-bootstrap";

import judgeAPI from "api/judge";
import {setTitle} from "helpers/setTitle";
import {ErrorBox} from "components";

import "./Details.scss";

const JUDGE_PROPS = ["name", "auth_key", "description", "is_blocked"];
const DEFAULT_JUDGE = {
  name: "",
  auth_key: "",
  description: "",
  is_blocked: false,
};

class AdminJudgeNew extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {...DEFAULT_JUDGE},
    };
  }

  componentDidMount() {
    setTitle(`Admin | New Judge`);
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

  getStartTime() {
    if (this.state.data && this.state.data.start_time) {
      let time = new Date(this.state.data.start_time);
      time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
      return time.toISOString().slice(0, 16);
    }
    return "";
  }
  setStartTime(v) {
    let time = new Date(v);
    const data = this.state.data;
    this.setState({data: {...data, start_time: time.toISOString()}});
  }
  formSubmitHandler(e) {
    e.preventDefault();
    let cleanedData = {};
    JUDGE_PROPS.forEach(key => {
      const v = this.state.data[key];
      cleanedData[key] = v;
    });

    judgeAPI
      .adminCreateJudge({data: cleanedData})
      .then(res => {
        toast.success(`OK Created.`);
        this.setState({redirectUrl: `/admin/judge/${res.data.id}`});
      })
      .catch(err => {
        toast.error(`Create failed. (${err.response.status})`);
        const data = err.response.data;
        this.setState({errors: {errors: data}});
      });
  }

  render() {
    if (this.state.redirectUrl)
      return <Navigate to={`${this.state.redirectUrl}`} />;

    const {data} = this.state;

    return (
      <div className="admin judge-panel wrapper-vanilla">
        <h4 className="judge-title">
          <div className="panel-header">
            <span className="title-text">+ Creating Judge</span>
            <span></span>
          </div>
        </h4>
        <hr />
        <div className="judge-details">
          <ErrorBox errors={this.state.errors} />
          <Form id="judge-general" onSubmit={e => this.formSubmitHandler(e)}>
            <Row>
              <Form.Label column="sm" xs={2}>
                {" "}
                ID{" "}
              </Form.Label>
              <Col>
                {" "}
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Judge ID, will be generated later."
                  id="id"
                  disabled
                  readOnly
                />
              </Col>
            </Row>
            <Row>
              <Form.Label column="sm" lg={2} className="required">
                {" "}
                Name{" "}
              </Form.Label>
              <Col>
                {" "}
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Judge Name"
                  id="name"
                  value={data.name || ""}
                  onChange={e => this.inputChangeHandler(e)}
                  required
                />
              </Col>
              <Form.Label column="sm" lg={2} className="required">
                {" "}
                Auth Key{" "}
              </Form.Label>
              <Col>
                {" "}
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Judge Authentication key"
                  id="auth_key"
                  value={data.auth_key || ""}
                  onChange={e => this.inputChangeHandler(e)}
                  required
                />
              </Col>
              <Form.Label column="sm" xl={12}>
                {" "}
                Description{" "}
              </Form.Label>
              <Col xs={12}>
                {" "}
                <Form.Control
                  size="sm"
                  type="textarea"
                  placeholder="Judge Description"
                  id="description"
                  value={data.description || ""}
                  onChange={e => this.inputChangeHandler(e)}
                />
              </Col>
            </Row>

            <Row>
              <Form.Label column="sm" xs={3}>
                {" "}
                Online{" "}
              </Form.Label>
              <Col xs={3}>
                {" "}
                <Form.Control
                  size="sm"
                  type="checkbox"
                  id="online"
                  checked={data.online || false}
                  // onChange={(e)=>this.inputChangeHandler(e, {isCheckbox: true})}
                  readOnly
                  disabled
                />
              </Col>
              <Form.Label column="sm" xs={4}>
                {" "}
                Chặn máy chấm này?{" "}
              </Form.Label>
              <Col xs={2}>
                {" "}
                <Form.Control
                  size="sm"
                  type="checkbox"
                  id="is_blocked"
                  checked={data.is_blocked || false}
                  onChange={e => this.inputChangeHandler(e, {isCheckbox: true})}
                />
              </Col>
            </Row>
            <Row>
              <Form.Label column="sm" md={2}>
                {" "}
                Start Time{" "}
              </Form.Label>
              <Col>
                {" "}
                <Form.Control
                  size="sm"
                  type="datetime-local"
                  id="start_time"
                  value={this.getStartTime()}
                  // onChange={(e)=>this.setStartTime(e.target.value)}
                  readOnly
                  disabled
                />
              </Col>
              <Form.Label column="sm" md={2}>
                {" "}
                Last IP{" "}
              </Form.Label>
              <Col>
                {" "}
                <Form.Control
                  size="sm"
                  type="text"
                  id="last_ip"
                  value={data.last_ip || ""}
                  // onChange={(e)=>this.inputChangeHandler(e)}
                  readOnly
                  disabled
                />
              </Col>
            </Row>

            <Row>
              <Form.Label column="sm" md={2}>
                {" "}
                Ping{" "}
              </Form.Label>
              <Col>
                {" "}
                <Form.Control
                  size="sm"
                  type="text"
                  id="ping"
                  value={data.ping || ""}
                  // onChange={(e)=>this.inputChangeHandler(e)}
                  readOnly
                  disabled
                />
              </Col>
              <Form.Label column="sm" md={2}>
                {" "}
                Load{" "}
              </Form.Label>
              <Col>
                {" "}
                <Form.Control
                  size="sm"
                  type="text"
                  id="load"
                  value={data.load || ""}
                  // onChange={(e)=>this.inputChangeHandler(e)}
                  readOnly
                  disabled
                />
              </Col>
            </Row>

            <Row>
              <Form.Label column="sm"> Problems </Form.Label>
              <Col xl={12}>
                {" "}
                <Form.Control
                  size="sm"
                  type="text"
                  id="problems"
                  value={JSON.stringify(data.problems || [])}
                  readOnly
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Form.Label column="sm"> Runtimes </Form.Label>
              <Col xl={12}>
                {" "}
                <Form.Control
                  size="sm"
                  type="text"
                  id="runtimes"
                  value={JSON.stringify(data.runtimes || [])}
                  readOnly
                  disabled
                />
              </Col>
            </Row>

            <hr className="m-2" />

            <Row>
              <Col lg={10}>
                <sub>**Các thiết lập khác sẽ được thêm sau.</sub>
              </Col>
              <Col>
                <Button variant="dark" size="sm" type="submit">
                  Save
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}

let wrappedPD = AdminJudgeNew;
// wrappedPD = withParams(wrappedPD);
const mapStateToProps = state => {
  return {user: state.user.user};
};
wrappedPD = connect(mapStateToProps, null)(wrappedPD);
export default wrappedPD;
