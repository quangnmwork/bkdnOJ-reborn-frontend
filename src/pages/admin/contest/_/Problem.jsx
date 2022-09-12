import React from "react";
import {toast} from "react-toastify";
import {Link} from "react-router-dom";
import {Form, Row, Col, Table, Button, Modal} from "react-bootstrap";

import contestAPI from "api/contest";

import {ErrorBox, SpinLoader} from "components";
import ProblemSelect from "components/SelectSingle/Problem";

import {
  FaQuestionCircle,
  FaRegPlusSquare,
  FaRegSave,
  FaSortAmountDownAlt,
  FaSortNumericDown,
  FaRedo,
} from "react-icons/fa";

import {qmClarify} from "helpers/components";

const INIT_CONT_PROBLEM = {
  points: 1,
  partial: false,
  is_pretested: false,
  max_submissions: null,
};

class RejudgeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      judgeInfo: null,
      fetchingInfo: false,
      confirmRejudge: false,
    };
  }

  fetchRejudgeInfo() {
    const data = {key: this.props.ckey, shortname: this.props.prob.shortname};
    this.setState({fetchingInfo: true}, () => {
      contestAPI
        .infoRejudgeContestProblem(data)
        .then(res => {
          this.setState({judgeInfo: res.data.msg}, () => {
            let conf = window.confirm(res.data.msg + " Proceed?");
            this.setState({confirmRejudge: conf});
          });
        })
        .catch(err => {
          if (err.response.status === 400)
            toast.error("No submissions to rejudge.");
          else toast.error("Cannot get rejudge info.");
        })
        .finally(() => this.setState({fetchingInfo: false}));
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.confirmRejudge === false &&
      this.state.confirmRejudge === true
    ) {
      const data = {key: this.props.ckey, shortname: this.props.prob.shortname};
      contestAPI
        .rejudgeContestProblem(data)
        .then(() => toast.success(`OK Rejudging ${this.props.prob.shortname}.`))
        .catch(() => toast.error("Cannot rejudge at the moment."));
    }
  }

  clickHandler(e) {
    e.preventDefault();
    if (!this.props.prob.id) return;
    if (this.state.confirmRejudge) {
      alert("Please refresh if you want to re-rejudge this problem.");
      return;
    }
    this.fetchRejudgeInfo();
  }

  render() {
    const {fetchingInfo, confirmRejudge} = this.state;
    const {prob} = this.props;

    return (
      <Link
        to="#"
        onClick={e => this.clickHandler(e)}
        style={!prob.id || confirmRejudge ? {color: "gray"} : {}}
      >
        {fetchingInfo ? <SpinLoader margin="0" /> : <span>Rejudge</span>}
      </Link>
    );
  }
}
class HelpModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {show: false};
  }
  render() {
    return (
      <>
        <Button
          variant="light"
          onClick={() => this.setState({show: true})}
          className="btn-svg"
        >
          <FaQuestionCircle />
        </Button>
        <Modal
          show={this.state.show}
          onHide={() => this.setState({show: false})}
        >
          <Modal.Header>
            <Modal.Title>Chú ý | Contest Problem</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Hệ thống phân biệt mỗi problem trong contest với nhau thông qua mã
            problem code (<code>shortname</code>). Khi nhấn SAVE, client sẽ gửi
            mảng Problem chứa các <code>shortname</code> này lên hệ thống, lúc
            này, có 3 trường hợp sẽ xảy ra:
            <ul>
              <li>
                Với các problem code đã tồn tại trong contest, hệ thống cập nhập
                các thuộc tính khác như điểm, order,...
              </li>
              <li>
                Với các problem code chưa có trong contest, hệ thống tạo mới đối
                tượng ContestProblem.
              </li>
              <li>
                Với các problem code có trong contest nhưng không có trong dữ
                liệu gửi lên, hệ thống sẽ xóa chúng.
              </li>
            </ul>
            Như vậy, hệ thống chỉ xóa đối tượng ContestProblem cùng với các tài
            nguyên liên quan CHỈ KHI bạn nhấn Save mà tại giao diện không có một
            Problem mà phía DB đang có. Chính vì thế, một contest có phần
            Problems chỉnh sửa bởi nhiều người có thể gây ra mâu thuẫn đáng
            tiếc. Nhìn chung, tốt nhất không nên đổi/xóa Problem khi Contest
            đang diễn ra.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={() => this.setState({show: false})}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

class Problem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ckey: this.props.ckey,
      problems: [],

      loaded: false,
      errors: null,
    };
  }

  refetch() {
    this.setState({errors: null});
    contestAPI
      .getContestProblems({key: this.state.ckey})
      .then(res => {
        this.setState({
          loaded: true,
          problems: res.data.results,
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          loaded: true,
          errors: [err.response.detail],
        });
      });
  }

  componentDidMount() {
    this.refetch();
  }

  // ---------
  clarifyPopup(msg) {
    return (
      <Link to="#" onClick={() => alert(msg)}>
        ?
      </Link>
    );
  }

  // ---------
  problemChangeHandler(idx, e, params = {}) {
    const problems = this.state.problems;
    let prob = {...problems[idx]};

    const isCheckbox = params.isCheckbox || false;
    const isRawObject = params.rawObject || false;

    if (isRawObject) {
      let valid = true;
      problems.forEach((p, i) => {
        if (i === idx) return;
        if (p.shortname === e.shortname) {
          alert("Problem này đã tồn tại trong contest!");
          valid = false;
        }
      });
      if (!valid) return;
      prob = {...prob, shortname: e.shortname, title: e.title};
    } else if (!isCheckbox) {
      if (e.target.id === "order") prob[e.target.id] = parseInt(e.target.value);
      else prob[e.target.id] = e.target.value;
    } else prob[e.target.id] = !prob[e.target.id];

    this.setState({
      problems: problems.map((p, arridx) => (arridx === idx ? prob : p)),
    });
  }

  // -------- Form Submit
  formSubmitHandler(e) {
    e.preventDefault();

    let conf = window.confirm("Bạn có chắc chắn với thay đổi này?");
    if (conf)
      contestAPI
        .updateContestProblems({
          key: this.state.ckey,
          data: this.state.problems,
        })
        .then(() => {
          toast.success("OK Updated.");
          this.refetch();
        })
        .catch(err => {
          console.log(err);
          this.setState({errors: err.response.data});
        });
  }

  render() {
    const {loaded, errors, problems} = this.state;

    return (
      <>
        <div className="table-wrapper m-2">
          <div className="options mb-1">
            <div className="border d-inline-flex p-1">
              <Button
                size="sm"
                variant="dark"
                onClick={() => {
                  let probs = problems.slice();
                  probs.sort((p1, p2) => {
                    const v1 = isNaN(p1.order) ? 9999 : p1.order;
                    const v2 = isNaN(p2.order) ? 9999 : p2.order;
                    return v1 < v2 ? -1 : 0;
                  });
                  this.setState({problems: probs});
                }}
                className="btn-svg"
              >
                <FaSortAmountDownAlt size={14} />{" "}
                <span className="d-none d-sm-inline">Sắp xếp theo</span>
                <span>Order</span>
              </Button>
            </div>
            <div className="border d-inline-flex p-1">
              <Button
                size="sm"
                variant="dark"
                onClick={() => {
                  let probs = problems.slice(); // Copy array
                  for (let i = 0; i < problems.length; i++) probs[i].order = i;
                  this.setState({problems: probs});
                }}
                className="btn-svg"
              >
                <FaSortNumericDown size={14} />{" "}
                <span className="d-none d-sm-inline">Tự đánh số Order</span>
                <span className="d-inline d-sm-none">Đánh số</span>
              </Button>
            </div>
            <div className="border d-inline-flex p-1">
              <Button
                size="sm"
                variant="dark"
                onClick={() => {
                  this.setState({errors: null});
                  this.refetch();
                }}
                className="btn-svg"
              >
                <FaRedo size={14} /> <span className="d-inline">Refresh</span>
              </Button>
            </div>
          </div>

          <hr className="m-2" />

          <div className="admin-table">
            <ErrorBox errors={errors} />
            <Table
              responsive
              hover
              size="sm"
              striped
              bordered
              className="rounded mb-0"
            >
              <thead>
                <tr>
                  <th style={{whiteSpace: "nowrap"}}>
                    Order{" "}
                    {this.clarifyPopup(
                      "Quyết định thứ tự xuất hiện của các Problem ở trong Contest. " +
                        "Ngoài ra, hệ thống sử dụng giá trị Order để sinh ra nhãn (problem A, problem B,...)."
                    )}
                  </th>

                  <th style={{minWidth: "200px"}}>Problem</th>
                  <th style={{minWidth: "15%"}}>Points</th>
                  <th>
                    <span className="d-none d-lg-inline">Điểm thành phần</span>
                    <span className="d-inline d-lg-none">ĐTP</span>
                    {this.clarifyPopup(
                      "Cho phép điểm thành phần: cho phép người dùng ăn điểm theo số test đúng. " +
                        "Mặc định không tick: Nhận 0đ nếu có ít nhất một test sai."
                    )}
                  </th>
                  {/* <th style={{whiteSpace: "nowrap"}} >
                Pretested {this.clarifyPopup('Chỉ chấm với Pretest.')}
              </th> */}
                  {/* <th style={{whiteSpace: "nowrap"}} >
                Max Subs {this.clarifyPopup('Giới hạn số lần nộp bài tối đa cho phép. Để trống nếu cho phép nộp không giới hạn.')}
              </th> */}
                  <th>
                    Rejudge
                    {qmClarify(
                      "Chấm lại các Submissions của Problem trong Contest này."
                    )}
                  </th>
                  <th></th>
                  {/* <th >
                <Link to="#" onClick={(e) => this.handleDeleteSelect(e)}>Actions</Link>
              </th> */}
                </tr>
              </thead>
              <tbody>
                {!loaded && (
                  <tr>
                    <td colSpan={99}>
                      <SpinLoader margin="20px" />
                    </td>
                  </tr>
                )}
                {loaded && problems.length === 0 && (
                  <tr>
                    <td colSpan={99}>
                      <em>No problems added yet.</em>
                    </td>
                  </tr>
                )}
                {loaded &&
                  problems.length > 0 &&
                  problems.map((prob, ridx) => (
                    <tr key={`ct-pr-${ridx}`}>
                      <td style={{maxWidth: "50px"}}>
                        <Form.Control
                          size="sm"
                          type="number"
                          id="order"
                          value={isNaN(prob.order) ? "" : prob.order}
                          onChange={e => this.problemChangeHandler(ridx, e)}
                        />
                      </td>
                      <td>
                        {/* <Form.Control size="sm" type="text" id="shortname" value={prob.shortname || ''}
                                onChange={(e) => this.problemChangeHandler(ridx, e)} /> */}
                        <ProblemSelect
                          prob={{...prob}}
                          onChange={val =>
                            this.problemChangeHandler(ridx, val, {
                              rawObject: true,
                            })
                          }
                        />
                      </td>
                      <td style={{maxWidth: "50px"}}>
                        <Form.Control
                          size="sm"
                          type="number"
                          id="points"
                          value={prob.points || ""}
                          onChange={e => this.problemChangeHandler(ridx, e)}
                        />
                      </td>
                      <td>
                        {" "}
                        <Form.Control
                          size="sm"
                          type="checkbox"
                          id="partial"
                          checked={prob.partial || false}
                          onChange={e =>
                            this.problemChangeHandler(ridx, e, {
                              isCheckbox: true,
                            })
                          }
                        />
                      </td>
                      {/* <td> <Form.Control size="sm" type="checkbox" id="is_pretested" checked={prob.is_pretested || false}
                                onChange={(e) => this.problemChangeHandler(ridx, e, {isCheckbox: true})} />
                </td> */}
                      {/* <td> <Form.Control size="sm" type="number" id="max_submissions" value={prob.max_submissions || ''}
                                onChange={(e) => this.problemChangeHandler(ridx, e)} />
                </td> */}

                      <td>
                        <RejudgeButton
                          ridx={ridx}
                          prob={prob}
                          ckey={this.state.ckey}
                        />
                      </td>

                      <td>
                        <Link
                          to="#"
                          onClick={e => {
                            e.preventDefault();
                            if (!prob.id) {
                              this.setState({
                                problems: problems.filter((_, i) => i !== ridx),
                              });
                              return;
                            }

                            let conf = window.confirm(
                              "CHÚ Ý: Xóa một đối tượng ContestProblem có sẵn sẽ " +
                                "gây ảnh hưởng đến những tài nguyên khác, nhất là khi Contest đang và đã diễn ra. " +
                                "Hãy suy xét lựa chọn đổi thứ tự chúng thông qua Order thay vì xóa đi tạo lại một Problem. " +
                                "Ở phiên bản hiện tại, một khi nhấn SAVE, sẽ không thể khôi phục lại những gì đã mất."
                            );
                            if (conf)
                              this.setState({
                                problems: problems.filter((_, i) => i !== ridx),
                              });
                          }}
                        >
                          Delete
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>

          <Row className="mt-2">
            <Col className="d-inline-flex">
              <HelpModal />
            </Col>

            <Col xs={8} className="d-inline-flex flex-row-reverse">
              <Button
                size="sm"
                variant="danger"
                className="ml-1 mr-1 btn-svg"
                onClick={e => this.formSubmitHandler(e)}
              >
                <FaRegSave size={16} />{" "}
                <span className="d-none d-sm-inline">Save</span>
              </Button>

              <Button
                size="sm"
                variant="dark"
                className="ml-1 mr-1 btn-svg"
                onClick={() =>
                  this.setState({
                    problems: problems.concat({...INIT_CONT_PROBLEM}),
                  })
                }
              >
                <FaRegPlusSquare size={16} />{" "}
                <span className="d-none d-sm-inline">Add</span>
              </Button>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

let wrapped = Problem;
export default wrapped;
