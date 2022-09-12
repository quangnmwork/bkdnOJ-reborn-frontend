import React from "react";
import {toast} from "react-toastify";
import {Navigate} from "react-router-dom";
import {Form, Row, Col, Button} from "react-bootstrap";

import contestAPI from "api/contest";
import {setTitle} from "helpers/setTitle";
import {ErrorBox} from "components";

import "./Details.scss";

const CONTEST_PROPS = ["key", "name", "start_time", "end_time", "time_limit"];

class AdminContestNew extends React.Component {
  constructor(props) {
    super(props);
    let data = {};
    this.state = {data};
  }

  componentDidMount() {
    setTitle(`Admin | New Contest`);
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

  getTime(key) {
    const data = this.state.data;
    if (data && data[key]) {
      let time = new Date(data[key]);
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
    let cleanedData = {};
    CONTEST_PROPS.forEach(key => {
      const v = this.state.data[key];
      cleanedData[key] = v;
    });

    contestAPI
      .createContest({data: cleanedData})
      .then(res => {
        toast.success(`OK Created.`);
        this.setState({redirectUrl: `/admin/contest/${res.data.key}`});
      })
      .catch(err => {
        toast.error(`Cannot create. (${err.response.status})`);
        const data = err.response.data;
        let errors = {...data};
        this.setState({errors});
      });
  }

  render() {
    if (this.state.redirectUrl)
      return <Navigate to={`${this.state.redirectUrl}`} />;

    const {data} = this.state;

    return (
      <div className="admin contest-panel wrapper-vanilla">
        <h4 className="contest-title">
          <div className="panel-header">
            <span className="title-text">Creating Contest</span>
            <span></span>
          </div>
        </h4>
        <hr />
        <div className="contest-details">
          <ErrorBox errors={this.state.errors} />
          <Form id="contest-general" onSubmit={e => this.formSubmitHandler(e)}>
            <Row>
              <Form.Label column="sm" sm={3} className="required">
                {" "}
                Contest Key{" "}
              </Form.Label>
              <Col>
                {" "}
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Mã định danh cho Contest"
                  id="key"
                  value={data.key || ""}
                  onChange={e => this.inputChangeHandler(e)}
                  required
                />
              </Col>
            </Row>
            <Row>
              <Form.Label column="sm" md={3} className="required">
                {" "}
                Name{" "}
              </Form.Label>
              <Col>
                {" "}
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Contest Name"
                  id="name"
                  value={data.name || ""}
                  onChange={e => this.inputChangeHandler(e)}
                  required
                />
              </Col>
            </Row>

            <Row>
              <Form.Label column="sm" md={2} className="required">
                {" "}
                Start Time{" "}
              </Form.Label>
              <Col md={4}>
                {" "}
                <Form.Control
                  size="sm"
                  type="datetime-local"
                  id="start_time"
                  value={this.getTime("start_time") || ""}
                  required
                  onChange={e => this.setTime(e.target.id, e.target.value)}
                />
              </Col>
              <Form.Label column="sm" md={2} className="required">
                {" "}
                End Time{" "}
              </Form.Label>
              <Col md={4}>
                {" "}
                <Form.Control
                  size="sm"
                  type="datetime-local"
                  id="end_time"
                  value={this.getTime("end_time") || ""}
                  required
                  onChange={e => this.setTime(e.target.id, e.target.value)}
                />
              </Col>
              <Col xl={12}>
                <sub>
                  Giới hạn thời gian làm bài cho tham dự chính thức (Live
                  Participation).
                </sub>
              </Col>
            </Row>

            {/* <Row>
              <Form.Label column="sm" md={3}> Time Limit </Form.Label>
              <Col md={9}> <Form.Control size="sm" id="time_limit"
                      value={data.time_limit || ''} onChange={(e)=>this.inputChangeHandler(e)}
              />
              </Col>
              <Col xl={12}>
                <sub>
                  Giới hạn thời gian làm bài cho mỗi lần tham dự. Nếu nhập một số nguyên,
                  mỗi lần tham dự thí sinh chỉ được làm bài từ Thời gian Tham dự cộng <code>time_limit</code>.
                  Option này chủ yếu dành cho Virtual Participation (chưa triển khai).
                </sub>
              </Col>
            </Row> */}

            <hr className="m-2" />

            <Row>
              <Col lg={10}>
                <sub>
                  Contest sẽ mặc định là Private khi tạo ra. Sau khi tạo, bạn sẽ
                  có thể chỉnh sửa thêm nhiều lựa chọn hơn.
                </sub>
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

let wrappedPD = AdminContestNew;
// wrappedPD = withParams(wrappedPD);
// const mapStateToProps = state => {
//   return { user : state.user.user }
// }
// wrappedPD = connect(mapStateToProps, null)(wrappedPD);
export default wrappedPD;
