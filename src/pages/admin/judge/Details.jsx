import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";
import {Navigate} from "react-router-dom";
import {Form, Row, Col, Button} from "react-bootstrap";
import {FaRegTrashAlt} from "react-icons/fa";

import judgeAPI from "api/judge";
import {SpinLoader, ErrorBox} from "components";
import {withParams} from "helpers/react-router";
import {setTitle} from "helpers/setTitle";

import "./Details.scss";
import {qmClarify} from "helpers/components";

const JUDGE_PROPS = ["name", "auth_key", "description", "is_blocked"];

class AdminJudgeDetails extends React.Component {
  constructor(props) {
    super(props);
    const {id} = this.props.params;
    this.id = id;
    this.state = {
      loaded: false,
      errors: null,
      data: undefined,
    };
  }

  refetch() {
    judgeAPI
      .getJudgeDetails({id: this.id})
      .then(res => {
        this.setState({
          data: res.data,
          loaded: true,
        });
        setTitle(`Admin | Judge. ${res.data.name}`);
      })
      .catch(err => {
        this.setState({
          loaded: true,
          errors: {errors: err.response.data},
        });
      });
  }

  componentDidMount() {
    setTitle(`Admin | Judge#${this.id}`);
    this.refetch();
  }

  getStartTime() {
    if (this.state.data && this.state.data.start_time) {
      let time = new Date(this.state.data.start_time);
      time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
      return time.toISOString().slice(0, 16);
    }
    return null;
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

  formSubmitHandler(e) {
    e.preventDefault();
    const id = this.id;
    let cleanedData = {};

    JUDGE_PROPS.forEach(key => {
      const v = this.state.data[key];
      cleanedData[key] = v;
    });

    this.setState({errors: null});
    judgeAPI
      .adminEditJudge({id, data: cleanedData})
      .then(() => {
        toast.success(`OK Edited.`);
        this.refetch();
      })
      .catch(err => {
        toast.error(`Cannot edit. (${err})`);
        const data = err.response.data;
        let errors = {...data};
        this.setState({errors: {errors}});
      });
  }

  deleteObjectHandler() {
    this.setState({errors: null});

    let conf = window.confirm(
      "Những bài đang chấm sẽ chuyển trạng thái thành IE và bị hủy chấm, " +
        "vì vậy hãy block máy chấm tối thiểu 1 phút để tránh hiện tượng này. Bạn có muốn xóa?"
    );
    if (conf) {
      judgeAPI
        .adminDeleteJudge({id: this.id})
        .then(() => {
          toast.success("OK Deleted.");
          this.setState({redirectUrl: "/admin/judge/"});
        })
        .catch(err => {
          toast.error(`Cannot delete. (${err})`);
          const data = err.response.data;
          let errors = {...data};
          this.setState({errors: {errors}});
        });
    }
  }

  render() {
    if (this.state.redirectUrl)
      return <Navigate to={`${this.state.redirectUrl}`} />;

    const {loaded, errors, data} = this.state;

    return (
      <div className="admin judge-panel wrapper-vanilla">
        <h4 className="judge-title">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          {loaded && (
            <div className="panel-header">
              <span className="title-text">{`Judge | ${
                data ? data.name : this.id
              }`}</span>
              {!errors && (
                <span>
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
          )}
        </h4>
        <hr />
        <div className="judge-details">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          {loaded && (
            <>
              <ErrorBox errors={errors} />
              {!errors && (
                <>
                  <Form
                    id="judge-general"
                    onSubmit={e => this.formSubmitHandler(e)}
                  >
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
                          placeholder="Judge id"
                          id="id"
                          value={data.id || ""}
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
                          placeholder="Description"
                          id="description"
                          value={data.description || ""}
                          onChange={e => this.inputChangeHandler(e)}
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Form.Label column="sm" sm={4}>
                        {" "}
                        Online status{" "}
                      </Form.Label>
                      <Col sm={2}>
                        {" "}
                        <Form.Control
                          size="sm"
                          type="checkbox"
                          id="online"
                          checked={data.online || false}
                          // onChange={(e)=>this.inputChangeHandler(e, {isCheckbox: true})}
                          disabled
                        />
                      </Col>
                      <Form.Label column="sm" sm={4}>
                        <span
                          className="d-inline"
                          style={{whiteSpace: "nowrap"}}
                        >
                          Chặn máy chấm này
                          {qmClarify(
                            "Máy chấm bị chặn sẽ không nhận submission nữa."
                          )}
                        </span>
                      </Form.Label>
                      <Col sm={2}>
                        {" "}
                        <Form.Control
                          size="sm"
                          type="checkbox"
                          id="is_blocked"
                          checked={data.is_blocked || false}
                          onChange={e =>
                            this.inputChangeHandler(e, {isCheckbox: true})
                          }
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
                          value={this.getStartTime() || ""}
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
                          value={JSON.stringify(data.problems || "")}
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
                          value={JSON.stringify(data.runtimes || "")}
                          readOnly
                          disabled
                        />
                      </Col>
                    </Row>

                    <hr className="m-2" />

                    <Row>
                      <Col lg={10}></Col>
                      <Col>
                        <Button
                          variant="dark"
                          size="sm"
                          type="submit"
                          className="w-100"
                        >
                          Save
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </>
              )}
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
