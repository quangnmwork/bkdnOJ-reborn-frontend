import React from "react";
import {connect} from "react-redux";
import {Link, Navigate} from "react-router-dom";
import {Row, Col} from "react-bootstrap";

import {
  FaPaperPlane,
  FaSignInAlt,
  FaWrench,
  FaAlignJustify,
  FaRegFilePdf,
} from "react-icons/fa";

import PDFViewer from "components/PDFViewer/PDFViewer";

import contestAPI from "api/contest";
import problemAPI from "api/problem";
import {SpinLoader, ErrorBox, RichTextEditor} from "components";
import {withParams} from "helpers/react-router";
import {setTitle} from "helpers/setTitle";

import {SubmitModal} from "pages/user/submit";
// import { getAdminPageUrl } from 'api/urls';

import ContestContext from "context/ContestContext";

import "./ProblemDetails.scss";

class ProblemDetails extends React.Component {
  static contextType = ContestContext;

  constructor(props) {
    super(props);
    const {shortname} = this.props.params;
    this.shortname = shortname;
    this.state = {
      data: null,
      loaded: false,
      errors: null,
      shortname: shortname,
      redirectUrl: null,
      submitFormShow: false,

      probStatementType: "text",
      probStatementTypeDisabled: false,
    };
    this.user = this.props.user;
  }

  handleSubmitFormOpen() {
    this.setState({submitFormShow: true});
  }
  handleSubmitFormClose() {
    this.setState({submitFormShow: false});
  }

  onDocumentLoadSuccess({numPages}) {
    this.setState({numPages});
  }
  toggleProbStatementType() {
    if (this.state.probStatementTypeDisabled) return;

    const {probStatementType} = this.state;
    let next = "text";
    if (probStatementType === "text") next = "pdf";
    else if (probStatementType === "pdf") next = "text";

    // TODO: Hacky solution to prevent user from spaming PDF request
    this.setState({
      probStatementType: next,
      probStatementTypeDisabled: true,
    });
    setTimeout(() => this.setState({probStatementTypeDisabled: false}), 2000);
  }
  updateContType(data) {
    let contType = "pdf",
      contTypeSwitchDisabled = false;
    if (data.content !== "") contType = "text";
    if (data.content === "" || !data.pdf) contTypeSwitchDisabled = true;
    this.setState({
      probStatementType: contType,
      probStatementTypeDisabled: contTypeSwitchDisabled,
    });
  }

  callApi() {
    this.setState({loaded: false, errors: null});

    let endpoint,
      data,
      callback = () => {};
    let prms = null;
    if (this.state.contest) {
      endpoint = contestAPI.getContestProblem;
      data = {key: this.state.contest.key, shortname: this.shortname};
      // prms = { contest: this.state.contest.key }
      callback = res => {
        this.setState(
          {
            data: {...res.data.problem_data, ...res.data},
            loaded: true,
          },
          () => this.updateContType(this.state.data)
        );
        setTitle(`${this.state.contest.name} | Problem. ${res.data.title}`);
      };
    } else {
      endpoint = problemAPI.getProblemDetails;
      data = {shortname: this.shortname};
      callback = res => {
        this.setState(
          {
            data: res.data,
            loaded: true,
          },
          () => this.updateContType(this.state.data)
        );
        setTitle(`Problem. ${res.data.title}`);
      };
    }

    endpoint({...data, params: prms})
      .then(res => {
        callback(res);
      })
      .catch(err => {
        this.setState({
          loaded: true,
          errors: err.response.data || "Cannot Fetch this Problem.",
        });
      });
  }

  componentDidMount() {
    const contest = this.context.contest;
    if (contest) {
      this.setState({contest}, () => this.callApi({page: this.state.currPage}));
    } else this.callApi({page: this.state.currPage});
  }

  componentDidUpdate(_prevProps, _prevState) {
    if (this.shortname !== this.props.params.shortname) {
      this.shortname = this.props.params.shortname;
      this.callApi();
    }
  }

  parseMemoryLimit() {
    return `${this.state.data.memory_limit} KB(s)`;
  }
  parseTimeLimit() {
    return `${this.state.data.time_limit.toFixed(1)} second(s)`;
  }

  render() {
    if (this.state.redirectUrl) {
      return <Navigate to={`${this.state.redirectUrl}`} />;
    }
    const {loaded, errors, data, contest} = this.state;

    const isLoggedIn = !!this.user;
    const isInContest = !!contest;
    const isAllowedToSubmitToContest =
      isInContest && (contest.is_registered || contest.spectate_allow);
    const isStaff = isLoggedIn && this.user.is_staff;

    const pdfExtraQuery = contest ? `?contest=${contest.key}` : "";

    return (
      <div className="problem-info wrapper-vanilla">
        <h4 className="problem-title">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          {loaded && !!errors && <span>Problem Not Available</span>}
          {loaded && !errors && `Problem. ${data.title}`}
        </h4>
        <hr />
        <div className="problem-details">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          {loaded && errors && (
            <>
              <div className="flex-center-col" style={{height: "100px"}}>
                <ErrorBox errors={errors} />
                {/* <VscError size={30} color="red"/> */}
              </div>
            </>
          )}
          {loaded && !errors && (
            <>
              <Row style={{margin: "unset"}}>
                <Col sm={9}>
                  <ul>
                    <li>
                      <strong>Problem Code:</strong>
                      {data.shortname}
                    </li>
                    <li>
                      <strong>Time Limit per test:</strong>
                      {this.parseTimeLimit()}
                    </li>
                    <li>
                      <strong>Memory Limit per test:</strong>
                      {this.parseMemoryLimit()}
                    </li>
                    <li>
                      <strong>Allowed Languages:</strong>
                      {data.allowed_languages.map(lang => lang.name).join(", ")}
                    </li>
                  </ul>
                </Col>
                <Col sm={3} className="options">
                  {
                    <Link
                      to="#"
                      className="btn"
                      style={
                        this.state.probStatementTypeDisabled
                          ? {color: "gray"}
                          : {}
                      }
                      onClick={() => this.toggleProbStatementType()}
                    >
                      {this.state.probStatementType === "pdf" && (
                        <>
                          To Text
                          <FaAlignJustify size={12} />
                        </>
                      )}
                      {this.state.probStatementType === "text" && (
                        <>
                          To PDF
                          <FaRegFilePdf size={12} />
                        </>
                      )}
                    </Link>
                  }
                  {
                    // Not Log-in
                    !isLoggedIn && (
                      <Link
                        to="#"
                        className="btn"
                        onClick={() => this.setState({redirectUrl: "/sign-in"})}
                      >
                        Sign In To Submit <FaSignInAlt size={12} />
                      </Link>
                    )
                  }
                  {
                    // Logged-in, not registered for Contest
                    isLoggedIn &&
                      isInContest &&
                      !(contest.is_registered || contest.spectate_allow) && (
                        <Link
                          to="#"
                          className="btn"
                          onClick={() =>
                            this.setState({redirectUrl: "/contests"})
                          }
                        >
                          Register to Submit <FaSignInAlt size={12} />
                        </Link>
                      )
                  }
                  {
                    // Logged-in and (not in contest OR in contest and allow to submit)
                    isLoggedIn && (!isInContest || isAllowedToSubmitToContest) && (
                      <Link
                        to="#"
                        className="btn"
                        onClick={() => this.handleSubmitFormOpen()}
                      >
                        Submit <FaPaperPlane size={12} />
                      </Link>
                    )
                  }
                  {isStaff && (
                    <Link
                      to="#"
                      className="btn"
                      style={{color: "red"}}
                      onClick={() =>
                        this.setState({
                          redirectUrl: `/admin/problem/${data.shortname}`,
                        })
                      }
                    >
                      Admin <FaWrench size={12} />
                    </Link>
                  )}

                  <SubmitModal
                    show={this.state.submitFormShow}
                    onHide={() => this.handleSubmitFormClose()}
                    prob={data.shortname}
                    lang={data.allowed_languages}
                    contest={this.context.contest}
                  />

                  {/* <Link to="/submit" className="btn">Test</Link> */}
                </Col>
              </Row>

              <hr className="ml-3 mr-3 mt-1 mb-1"></hr>

              <Row className="problem-statement">
                <Col>
                  {
                    // TODO: cached this after first load so it doesn't hit the server everytime the user toggle doc type.
                    this.state.probStatementType === "pdf" && (
                      <>
                        <span className="w-100 text-right text-danger">
                          <em>
                            **Đôi khi PDF mãi loading, hãy nhấn biểu tượng Kính
                            lúp (resize) để refresh.
                          </em>
                        </span>
                        <div className="problem-pdf shadow">
                          {/* <object data={`${data.pdf}`} type="application/pdf">
                        <iframe title="problem-pdf-iframe"
                          src={`https://docs.google.com/viewer?url=${this.state.data.pdf}&embedded=true`}>
                        </iframe>
                      </object> */}
                          <PDFViewer pdf={`${data.pdf}${pdfExtraQuery}`} />
                        </div>
                      </>
                    )
                  }
                  {this.state.probStatementType === "text" &&
                    (data.content.trim() === "" ? (
                      <em
                        style={{
                          minHeight: "200px",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Text is not available.
                      </em>
                    ) : (
                      <div className="problem-text ml-3 mr-3">
                        <RichTextEditor
                          value={data.content || ""}
                          onChange={() => {}}
                          enableEdit={false}
                        />
                      </div>
                    ))}
                </Col>
              </Row>
            </>
          )}
        </div>
      </div>
    );
  }
}

let wrappedPD = ProblemDetails;
wrappedPD = withParams(wrappedPD);
const mapStateToProps = state => {
  return {user: state.user.user};
};
wrappedPD = connect(mapStateToProps, null)(wrappedPD);
export default wrappedPD;
