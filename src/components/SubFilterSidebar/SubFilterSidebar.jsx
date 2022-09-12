/* eslint-disable no-unused-vars */
import React from "react";

// Redux
import {connect} from "react-redux";
import {
  setContestParams,
  clearContestParams,
  setPublicParams,
  clearPublicParams,
} from "redux/SubFilter/actions";

import {NO_CONTEST_KEY} from "redux/SubFilter/types";

import {Button, Row, Col} from "react-bootstrap";

import ContestContext from "context/ContestContext";

// Helpers

// Assets
import {FaTimes, FaFilter} from "react-icons/fa";

import "./SubFilterSidebar.scss";

const LANGUAGES = [
  {
    value: "C",
    name: "C",
  },
  {
    value: "C++",
    name: "C++",
  },
  {
    value: "Java",
    name: "Java",
  },
  {
    value: "Pascal",
    name: "Pascal",
  },
  {
    value: "Python",
    name: "Python",
  },
];
const VERDICTS = [
  {
    value: "AC",
    name: "Accepted",
  },
  {
    value: "WA",
    name: "Wrong Answer",
  },
  {
    value: "TLE",
    name: "Time Limit Exceeded",
  },
  {
    value: "MLE",
    name: "Memory Limit Exceeded",
  },
  {
    value: "RTE",
    name: "Runtime Error",
  },
  {
    value: "CE",
    name: "Compile Error",
  },
];
const ORDER_BY = [
  {
    value: "time",
    name: "CPU Time",
  },
  {
    value: "memory",
    name: "Memory Usage",
  },
  {
    value: "date",
    name: "Submit Time",
  },
];
const DATETIME_LOCAL_KEYS = ["date_before", "date_after"];

class ContestSubFilterSidebar extends React.Component {
  static contextType = ContestContext;

  constructor(props) {
    super(props);
    this.state = {
      queryParams: {},
    };
  }

  setParams(key, value) {
    if (value) {
      const oldParams = this.state.queryParams;
      this.setState({queryParams: {...oldParams, [key]: value}});
    } else {
      let newParams = {...this.state.queryParams};
      delete newParams[key];
      this.setState({queryParams: newParams});
    }
  }

  getTime(key) {
    const data = this.state.queryParams;
    if (data && data[key]) {
      let time = new Date(data[key]);
      time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
      return time.toISOString().slice(0, 19);
    }
    return "";
  }

  onFilter() {
    const {contest} = this.context;
    let params = {...this.state.queryParams};

    DATETIME_LOCAL_KEYS.forEach(key => {
      if (params[key]) params[key] = new Date(params[key]).toISOString();
    });

    if (contest) this.props.setContestParams(contest.key, params);
    else this.props.setPublicParams(params);
  }
  onClear() {
    const {contest} = this.context;
    this.setState({queryParams: {}});
    if (contest) this.props.clearContestParams(contest.key);
    else this.props.clearPublicParams();
  }

  initFromRedux() {
    const {contest} = this.context;
    if (contest)
      this.setState({
        queryParams: this.props.subFilter[contest.key] || {},
      });
    else
      this.setState({
        queryParams: this.props.subFilter[NO_CONTEST_KEY] || {},
      });
  }
  componentDidMount() {
    this.initFromRedux();
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.subFilter !== prevProps.subFilter) this.initFromRedux();
  }

  render() {
    const {contest} = this.context;
    const {user} = this.props;

    const problems = contest?.problems || [];

    const isLoggedIn = !!user;
    const isStaff = isLoggedIn && user.is_staff;
    const isSuperuser = isStaff && user.is_superuser;
    const isInContest = !!contest;

    return (
      <div className="wrapper-vanilla" id="sub-filter">
        <h4>Submissions Filter</h4>
        {/* {!contest && <span>Contest is not available.</span>} */}
        {true && (
          <>
            <div className="flex-center-col text-left filter-panel">
              <Row className="m-0 w-100">
                <Col>
                  <label
                    id="user-text-lbl"
                    className="m-0 w-100"
                    htmlFor="user-text"
                    style={{
                      textDecoration: this.state.queryParams.me
                        ? "line-through"
                        : "none",
                    }}
                  >
                    Participant
                  </label>
                  <input
                    id="user-text"
                    className="m-0 w-100"
                    type="text"
                    onChange={e => this.setParams("user", e.target.value)}
                    value={this.state.queryParams.user || ""}
                    style={{fontSize: "12px"}}
                    disabled={!!this.state.queryParams.me}
                  ></input>
                </Col>
              </Row>
              <Row className="m-0 w-100">
                <Col>
                  <label
                    id="problem-select-lbl"
                    className="m-0 w-100"
                    htmlFor="problem-select"
                  >
                    Problem
                  </label>
                  {problems.length > 0 && (
                    <select
                      id="problem-select"
                      className="m-0 w-100"
                      onChange={e => this.setParams("problem", e.target.value)}
                      value={this.state.queryParams.problem || ""}
                    >
                      <option key={`ct-fltr-pr-df`} value="">
                        --
                      </option>
                      {problems.map((p, idx) => (
                        <option
                          key={`ct-fltr-pr-${idx}`}
                          value={p.shortname}
                        >{`${p.label}. ${p.title}`}</option>
                      ))}
                    </select>
                  )}
                  {problems.length === 0 && (
                    <input
                      type="text"
                      id="problem-input"
                      className="m-0 w-100"
                      onChange={e => this.setParams("problem", e.target.value)}
                      value={this.state.queryParams.problem || ""}
                      style={{fontSize: "12px"}}
                    />
                  )}
                </Col>
              </Row>
              <Row className="m-0 w-100">
                <Col xs={4}>
                  <label
                    id="language-select-lbl"
                    className="m-0 w-100"
                    htmlFor="language-select"
                  >
                    Lang
                  </label>
                  <select
                    id="language-select"
                    className="m-0 w-100"
                    onChange={e => this.setParams("language", e.target.value)}
                    value={this.state.queryParams.language || ""}
                  >
                    <option key={`ct-fltr-ln-df`} value="">
                      --
                    </option>
                    {LANGUAGES.map((l, idx) => (
                      <option key={`ct-fltr-ln-${idx}`} value={l.value}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </Col>
                <Col xs={8}>
                  <label
                    id="verdict-select-lbl"
                    className="m-0 w-100"
                    htmlFor="verdict-select"
                  >
                    Verdict
                  </label>
                  <select
                    id="verdict-select"
                    className="m-0 w-100"
                    onChange={e => this.setParams("verdict", e.target.value)}
                    value={this.state.queryParams.verdict || ""}
                  >
                    <option key={`ct-fltr-vd-df`} value="">
                      --
                    </option>
                    {VERDICTS.map((v, idx) => (
                      <option key={`ct-fltr-vd-${idx}`} value={v.value}>
                        {v.name}
                      </option>
                    ))}
                    {isStaff && (
                      <>
                        <option
                          key={`ct-fltr-vd-q`}
                          value={"Q"}
                          className="text-danger"
                        >
                          Not Done Judging
                        </option>
                        <option
                          key={`ct-fltr-vd-ie`}
                          value={"IE"}
                          className="text-danger"
                        >
                          Internal Error
                        </option>
                        <option
                          key={`ct-fltr-vd-sc`}
                          value={"SC"}
                          className="text-danger"
                        >
                          Skipped
                        </option>
                      </>
                    )}
                  </select>
                </Col>
              </Row>
              <Row className="m-0 w-100">
                <Col xs={8}>
                  <label
                    id="order-by-select-lbl"
                    className="m-0 w-100"
                    htmlFor="order-by"
                  >
                    Order By
                  </label>
                  <select
                    id="order-by"
                    className="m-0 w-100"
                    onChange={e => this.setParams("order_by", e.target.value)}
                    value={this.state.queryParams.order_by || ""}
                  >
                    <option key={`ct-fltr-ln-df`} value="">
                      --
                    </option>
                    {ORDER_BY.map((ord, idx) => (
                      <option key={`ct-fltr-ln-${idx}`} value={ord.value}>
                        {ord.name}
                      </option>
                    ))}
                    {isStaff && (
                      <>
                        <option
                          key={`ct-fltr-ln-rjd`}
                          value="rejudged_date"
                          className="text-danger"
                        >
                          Rejudge Date
                        </option>
                      </>
                    )}
                  </select>
                </Col>
                <Col xs={4}>
                  <label
                    id="order-by-ordering-select-lbl"
                    className="m-0 w-100"
                    htmlFor="order-by-ordering"
                  ></label>
                  <select
                    id="order-by-ordering"
                    className="m-0 w-100"
                    onChange={e => this.setParams("dec", e.target.value)}
                    value={this.state.queryParams.dec || ""}
                  >
                    <option key={`ct-fltr-ln-asc`} value="">
                      ASC
                    </option>
                    <option key={`ct-fltr-ln-dec`} value="1">
                      DESC
                    </option>
                  </select>
                </Col>
              </Row>
              <Row className="m-0 w-100">
                <Col>
                  <label
                    id="date-after-lbl"
                    className="m-0 w-100"
                    htmlFor="date-after"
                  >
                    Submitted After
                  </label>
                  <input
                    className="w-100 m-0"
                    type="datetime-local"
                    step="1"
                    id="date-after"
                    value={this.getTime("date_after")}
                    onChange={e => this.setParams("date_after", e.target.value)}
                  ></input>
                </Col>
              </Row>
              <Row className="m-0 w-100">
                <Col>
                  <label
                    id="date-before-lbl"
                    className="m-0 w-100"
                    htmlFor="date-before"
                  >
                    Submitted Before
                  </label>
                  <input
                    className="w-100 m-0"
                    type="datetime-local"
                    id="date-before"
                    step="1"
                    value={this.getTime("date_before")}
                    onChange={e =>
                      this.setParams("date_before", e.target.value)
                    }
                  ></input>
                </Col>
              </Row>

              <div className="w-100 checkbox-panel" style={{columnGap: "5px"}}>
                {isLoggedIn && (
                  <label
                    id="only-me-lbl"
                    className="d-flex align-items-center m-0"
                  >
                    <input
                      type="checkbox"
                      id="only-me"
                      className="ml-1 mr-1"
                      checked={this.state.queryParams.me || false}
                      onChange={() =>
                        this.setParams("me", !this.state.queryParams.me)
                      }
                    ></input>
                    <span style={{flex: 2}}>Mine</span>
                  </label>
                )}
                {isInContest && isStaff && (
                  <>
                    <label
                      id="only-participants-lbl"
                      className="d-flex align-items-center m-0"
                    >
                      <input
                        type="checkbox"
                        id="only-participant"
                        className="ml-1 mr-1"
                        checked={this.state.queryParams.participants || false}
                        onChange={() =>
                          this.setParams(
                            "participants",
                            !this.state.queryParams.participants
                          )
                        }
                      ></input>
                      <span className="text-danger" style={{flex: 2}}>
                        Participants
                      </span>
                    </label>
                    <label
                      id="only-participants-lbl"
                      className="d-flex align-items-center m-0"
                    >
                      <input
                        type="checkbox"
                        id="only-participant"
                        className="ml-1 mr-1"
                        checked={this.state.queryParams.spectators || false}
                        onChange={() =>
                          this.setParams(
                            "spectators",
                            !this.state.queryParams.spectators
                          )
                        }
                      ></input>
                      <span className="text-danger" style={{flex: 2}}>
                        Spectators
                      </span>
                    </label>
                  </>
                )}
              </div>
            </div>

            <div
              className="p-1 text-right"
              style={{
                display: "flex",
                flexDirection: "row-reverse",
                columnGap: "5px",
              }}
            >
              <Button
                size="sm"
                variant="light"
                className="btn-svg"
                onClick={() => this.onClear()}
              >
                <FaTimes /> Clear
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="btn-svg"
                onClick={() => this.onFilter()}
              >
                <FaFilter /> Filter
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }
}

let wrapped = ContestSubFilterSidebar;
const mapStateToProps = state => {
  return {
    user: state.user.user,
    profile: state.profile.profile,
    subFilter: state.subFilter,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setContestParams: (key, params) =>
      dispatch(setContestParams({key, params})),
    setPublicParams: params => dispatch(setPublicParams({params})),
    clearContestParams: key => dispatch(clearContestParams({key})),
    clearPublicParams: () => dispatch(clearPublicParams()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(wrapped);
