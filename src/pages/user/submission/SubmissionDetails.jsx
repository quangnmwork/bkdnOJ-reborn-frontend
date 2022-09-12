import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";
import {Link, Navigate} from "react-router-dom";
import {Row, Col, Table} from "react-bootstrap";

// Assets
import {FaWrench, FaSyncAlt} from "react-icons/fa";
import {VscError} from "react-icons/vsc";

// Services
import submissionAPI from "api/submission";

// Componenets
import {SpinLoader} from "components";
import {CodeEditor} from "components/CodeEditor";

// Context
import ContestContext from "context/ContestContext";

// Helpers
import {withParams} from "helpers/react-router";
import {parseTime, parseMem} from "helpers/textFormatter";
import {setTitle} from "helpers/setTitle";

import {shouldStopPolling} from "constants/statusFilter";

import "./SubmissionDetails.scss";

const __SUBMISSION_DETAIL_POLL_DELAY = 3000;
const __SUBMISSION_MAX_POLL_DURATION = 30000; // ms

class SubmissionTestCase extends React.Component {
  render() {
    const data = this.props.data;
    const problem = this.props.problem;
    const maxTime = problem.time_limit;

    return (
      <tr className="test-case-result">
        <td>
          <strong>Case#{data.case}</strong>
        </td>
        <td>
          <span className={`verdict ${data.status.toLowerCase()}`}>
            <span className={`verdict-wrapper ${data.status.toLowerCase()}`}>
              <span className="text">{data.status}</span>
            </span>
          </span>
        </td>
        <td>
          <span className="time">
            {data.status === "tle"
              ? `>${parseTime(maxTime)}`
              : parseTime(data.time)}
          </span>
        </td>
        <td>
          <span className="time">{parseMem(data.memory)}</span>
        </td>
      </tr>
    );
  }
}

class SubmissionDetails extends React.Component {
  static contextType = ContestContext;

  constructor(props) {
    super(props);
    const {id} = this.props.params;
    this.state = {
      id: id,
      loaded: false,
      errors: null,
      data: {
        status: ".",
      },
    };
    this.user = this.props.user || null;
  }

  fetch() {
    const contest = this.context.contest;
    let params = {};
    if (contest) params.contest = contest.key;

    submissionAPI
      .getSubmissionDetails({id: this.state.id, params})
      .then(res => {
        setTitle(`Submission#${res.data.id}`);
        this.setState({data: res.data});
      })
      .catch(err => {
        this.setState({
          errors: err.response.data || "Cannot Fetch this Submission.",
        });
        console.log("Error when Polling", err);
      })
      .finally(() => {
        this.setState({loaded: true});
      });
  }
  rejudge() {
    submissionAPI
      .adminRejudgeSubmission({id: this.state.id})
      .then(() => {
        toast.success("OK Rejudging.");
        this.setState(
          {
            loaded: false,
            errors: null,
            data: {
              status: ".",
            },
          },
          () => {
            this.fetch();
            if (!shouldStopPolling(this.state.data.status)) {
              clearInterval(this.timer);
              this.timer = setInterval(
                () => this.pollResult(),
                __SUBMISSION_DETAIL_POLL_DELAY
              );
              setTimeout(
                () => clearInterval(this.timer),
                __SUBMISSION_MAX_POLL_DURATION
              );
            }
          }
        );
      })
      .catch(err => {
        toast.error(`Cannot rejudge. (${err.response.status})`);
      });
  }

  pollResult() {
    if (shouldStopPolling(this.state.data.status) || !!this.state.errors) {
      clearInterval(this.timer);
      return;
    }
    this.fetch();
  }

  componentDidMount() {
    this.fetch();
    if (!shouldStopPolling(this.state.data.status)) {
      clearInterval(this.timer);
      this.timer = setInterval(
        () => this.pollResult(),
        __SUBMISSION_DETAIL_POLL_DELAY
      );
      setTimeout(
        () => clearInterval(this.timer),
        __SUBMISSION_MAX_POLL_DURATION
      );
    }
  }
  componentDidUpdate(_prevProps, _prevState) {
    if (this.props.params.id !== this.state.id) {
      this.setState({loaded: false, errors: false});
      this.setState({id: this.props.params.id}, () => this.fetch());
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    if (this.state.redirectUrl) {
      return <Navigate to={`${this.state.redirectUrl}`} />;
    }

    const {data, loaded, errors} = this.state;

    let verdict = "QU";
    let maxPoints = 0;
    if (loaded && !errors) {
      verdict = data.status === "D" ? data.result : data.status;
      maxPoints = data.problem.points;
    }
    const polling = loaded && !errors && !shouldStopPolling(data.status);

    return (
      <div className="submission-info wrapper-vanilla">
        <h4 className="submission-title">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          {loaded && !!errors && <span>Submission Not Available</span>}
          {loaded && !errors && (
            <span>
              {`Submission#${data.id}`}
              {polling && <div className="loading_3dot"></div>}
            </span>
          )}
        </h4>
        <hr />
        <div className={`submission-details ${loaded && "text-left"}`}>
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          {loaded && errors && (
            <>
              <div className="flex-center-col" style={{height: "100px"}}>
                {/* <ErrorBox errors={errors} /> */}
                <VscError size={30} color="red" />
              </div>
            </>
          )}
          {loaded && !errors && (
            <>
              {!!this.user && this.user.is_staff && (
                <>
                  <div className="admin-panel info-subsection">
                    <h5>Staff Panel</h5>
                    <Row className="">
                      <Col>
                        <Link
                          to="#"
                          className="btn"
                          style={{color: "red"}}
                          onClick={() =>
                            this.setState({
                              redirectUrl: `/admin/submission/${this.state.id}`,
                            })
                          }
                        >
                          Staff <FaWrench size={12} />
                        </Link>
                        <Link
                          to="#"
                          className="btn"
                          style={{color: "red"}}
                          onClick={() => this.rejudge()}
                        >
                          Rejudge <FaSyncAlt size={12} />
                        </Link>
                      </Col>
                    </Row>
                    <Row className="">
                      <Col>
                        {" "}
                        <span>
                          <strong>Rejudge Date: </strong>
                          {data.rejudged_date
                            ? new Date(data.rejudged_date).toLocaleString()
                            : "n/a"}
                        </span>
                      </Col>
                      <Col>
                        {" "}
                        <span>
                          <strong>Judged On: </strong>
                          {data.judged_on ? data.judged_on.name : "n/a"}
                        </span>
                      </Col>
                    </Row>
                  </div>
                </>
              )}
              <div className="general info-subsection">
                <h5 className="subsection">General</h5>
                {data.contest_object && (
                  <Col>
                    <span>
                      <strong>{`This submission was made in contest `}</strong>
                      <Link to={`/contest/${data.contest_object}`}>
                        {data.contest_object}
                      </Link>
                    </span>
                  </Col>
                )}
                <Row>
                  <Col>
                    <span>
                      <strong>Author:</strong>
                      <Link to={`/user/${data.user.user.username}`}>
                        {data.user.user.username}
                      </Link>
                    </span>
                  </Col>
                  <Col>
                    <span>
                      <strong>Problem:</strong>
                      <Link to={`/problem/${data.problem.shortname}`}>
                        {data.problem.title}
                      </Link>
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <span>
                      <strong>Result:</strong>
                      <span className={`verdict ${verdict.toLowerCase()}`}>
                        <span
                          className={`verdict-wrapper ${verdict.toLowerCase()}`}
                        >
                          <span className={`text`}>{verdict}</span>
                        </span>
                      </span>
                    </span>
                  </Col>
                  <Col>
                    <span>
                      <strong>Points:</strong>
                      {typeof data.points === "number" ? (
                        <span
                          className={`verdict ${verdict.toLowerCase()} points`}
                        >
                          {`(${data.points}/${maxPoints})`}
                        </span>
                      ) : (
                        <span className="points">Not evaluated</span>
                      )}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <span>
                      <strong>Total Time:</strong>
                      {parseTime(data.time)}
                    </span>
                  </Col>
                  <Col>
                    <span>
                      <strong>Memory:</strong>
                      {parseMem(data.memory)}
                    </span>
                  </Col>
                </Row>
              </div>

              <div className="source info-subsection">
                <h5>Source</h5>
                <Row>
                  <Col>
                    <span>
                      <strong>Language: </strong>
                      {data.language}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <CodeEditor
                      code={data.source}
                      onCodeChange={() => {}}
                      ace={data.language_ace}
                      readOnly={true}
                    />
                  </Col>
                </Row>
              </div>
              <div className="test-result info-subsection">
                <h5>Test Result</h5>
                <Row>
                  <Col>
                    <Table responsive size="xs" striped>
                      <tbody>
                        {data.test_cases.map(test_case => (
                          <SubmissionTestCase
                            key={test_case.id}
                            data={test_case}
                            problem={data.problem}
                          />
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}

let wrapped = SubmissionDetails;
wrapped = withParams(wrapped);
const mapStateToProps = state => {
  return {user: state.user.user};
};
wrapped = connect(mapStateToProps, null)(wrapped);
export default wrapped;
