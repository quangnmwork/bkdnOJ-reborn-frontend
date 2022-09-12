import React from "react";
import {toast} from "react-toastify";
import ReactPaginate from "react-paginate";
import {Link} from "react-router-dom";

// Redux
import {connect} from "react-redux";
import {setPublicParams, setContestParams} from "redux/SubFilter/actions";

// Components
import {Button, Table} from "react-bootstrap";
import {SpinLoader, ErrorBox} from "components";

// APIs
import submissionApi from "api/submission";
import contestApi from "api/contest";

// Assets
import {
  FaRegEyeSlash,
  FaRedoAlt,
  FaSyncAlt,
  FaFilter,
  FaPlus,
} from "react-icons/fa";
import {GiTrophyCup} from "react-icons/gi";
import {TbFilterOff} from "react-icons/tb";
// import { FaPaperPlane } from 'react-icons/fa';

// Helpers
import {getYearMonthDate, getHourMinuteSecond} from "helpers/dateFormatter";
import {setTitle} from "helpers/setTitle";
import {parseTime, parseMem} from "helpers/textFormatter";
import {isStaff} from "helpers/auth";
import {isEmpty} from "helpers/checkObject";

// Contexts
import ContestContext from "context/ContestContext";

import "./SubmissionList.scss";
import "styles/ClassicPagination.scss";
import {NO_CONTEST_KEY} from "redux/SubFilter/types";

// Constants
import {messages, values} from "./constants";

const verdictExplains = {
  AC: "Your solution gives correct output within given contraints.",
  WA: "Your solution gives wrong output.",
  TLE: "Your solution used too much time.",
  MLE: "Your solution used too much memory.",
  OLE: "Your solution printed too much data.",
  IR: "Your solution did not return exitcode 0.",
  RTE: "Your solution did not return exitcode 0.",
  IE: "There is something wrong with the servers. Please notify the admin.",
  CE: "There is syntax error in your solution. Please Double-check the language and version.",
  FR: "Results are frozen and will be revealed later.",
};
function getVerdict(ver) {
  return verdictExplains[ver] || ver;
}

class FilterPlus extends React.Component {
  render() {
    return (
      <Link
        className="btn-svg ml-1 border border-dark text-dark rounded d-inline-flex"
        style={{padding: "2px 2px"}}
        data-toggle="tooltip"
        data-placement="right"
        title={`Add this to Filters`}
        to="#"
        {...this.props}
      >
        <FaFilter size={10} />
        <FaPlus size={8} />
      </Link>
    );
  }
}

class SubListItem extends React.Component {
  parseDate(date) {
    // return dateFormatter(date);
    return (
      <div className="flex-center-col">
        <span style={{fontSize: "10px"}}>{getYearMonthDate(date)}</span>
        <span style={{fontSize: "14px"}}>{getHourMinuteSecond(date)}</span>
      </div>
    );
  }
  render() {
    const {
      id,
      problem,
      user,
      status,
      result,
      time,
      memory,
      date,
      points,
      language,
      contest_object,
      is_frozen,
      virtual,
      yourUsername,
    } = this.props;
    const linkPrefix = this.props.contest
      ? `/contest/${this.props.contest.key}`
      : "";

    const verdict = status === "D" ? result : status;

    const max_points = problem.points;

    const isSpectatorSubmission = virtual && !(virtual === "live");

    return (
      <tr className={isSpectatorSubmission ? "spectator-submission" : ""}>
        <td className="text-truncate flex-center-col">
          <Link to={`${linkPrefix}/submission/${id}`}>#{id}</Link>
          {isSpectatorSubmission && (
            <div
              data-toggle="tooltip"
              data-placement="right"
              title={`This submission is not visible to participants.`}
            >
              <FaRegEyeSlash />
            </div>
          )}
        </td>

        <td style={{minWidth: "100px"}}>{this.parseDate(date)}</td>

        <td className="general-info">
          <div className="general-info-container">
            <span className="problem">
              <Link to={`${linkPrefix}/problem/${problem.shortname}`}>
                {problem.title}
              </Link>
              <FilterPlus
                onClick={() =>
                  this.props.setFilterParams("problem", problem.shortname)
                }
              />
            </span>
            {contest_object && (
              <span
                className="ml-1"
                data-toggle="tooltip"
                data-placement="right"
                title={`This submission was made in contest ${contest_object}`}
                style={{fontSize: "12px", fontStyle: "italic"}}
              >
                <Link to={`/contest/${contest_object}`}>
                  (<GiTrophyCup />
                  {contest_object})
                </Link>
              </span>
            )}

            <span className="author text-truncate">
              <em>
                {`by `}
                <Link to={`/user/${user}`}>
                  {yourUsername === user ? (
                    <strong>{user}</strong>
                  ) : (
                    <span>{user}</span>
                  )}
                </Link>
                <FilterPlus
                  onClick={() => this.props.setFilterParams("user", user)}
                />
              </em>
              <span className="language ml-1">({language})</span>
            </span>
          </div>
        </td>

        <td
          className={`verdict ${verdict.toLowerCase()}`}
          data-toggle="tooltip"
          data-placement="right"
          title={`${getVerdict(verdict)}`}
        >
          <div className="verdict-container">
            <div className={`verdict-wrapper ${verdict.toLowerCase()}`}>
              <span className={`text`}>{verdict}</span>
            </div>

            {typeof points === "number" ? (
              <div
                className="points-container available"
                data-toggle="tooltip"
                data-placement="right"
                title={`${points}/${max_points}`}
              >
                <span className="sub-points text-truncate">{points}</span>
                <span className="prob-points text-truncate">{max_points}</span>
              </div>
            ) : (
              <div className="points-container available">
                <span className="sub-points text-truncate">
                  {is_frozen ? "?" : "n/a"}
                </span>
                <span className="prob-points text-truncate">{max_points}</span>
              </div>
            )}
          </div>
        </td>

        <td className="resource-allocated">
          <div className="resource-allocated-container flex-center-col">
            <span className="cpu-usage">
              {is_frozen
                ? "?"
                : verdict.toLowerCase() === "tle"
                ? `--`
                : parseTime(time)}
            </span>
            <span className="mem-usage">
              {is_frozen
                ? "?"
                : verdict.toLowerCase() === "mle"
                ? `--`
                : parseMem(memory)}
            </span>
          </div>
        </td>
      </tr>
    );
  }
}

class SubmissionList extends React.Component {
  static contextType = ContestContext;

  constructor(props) {
    super(props);
    this.state = {
      contest: null,

      submissions: [],
      count: 0,
      currPage: 0,
      pageCount: 1,
      loaded: false,
      errors: null,

      isFiltered: false,

      refetchDisable: false,
      rejudgeDisable: false,
    };
    setTitle(`Submissions`);
  }

  isInContest() {
    return !!this.state.contest;
  }

  callApi(params = {page: 0}) {
    this.setState({loaded: false, errors: null, isFiltered: false});

    if (this.isInContest()) {
      const extraParams = this.props.subFilter[this.state.contest.key] || {};

      contestApi
        .getContestSubmissions({
          key: this.state.contest.key,
          params: {page: params.page + 1, ...extraParams},
        })
        .then(res => {
          this.setState({
            submissions: res.data.results,
            count: res.data.count,
            pageCount: res.data.total_pages,
            currPage: params.page,
            loaded: true,
            isFiltered: !isEmpty(extraParams),
          });
        })
        .catch(err => {
          this.setState({
            loaded: true,
            errors:
              err.response.data || "Cannot fetch submissions at the moment.",
          });
        });
    } else {
      const extraParams = this.props.subFilter[NO_CONTEST_KEY] || {};
      let prms = {page: params.page + 1, ...extraParams};

      if (this.props.selectedOrg.slug) {
        prms.org = this.props.selectedOrg.slug;
      }

      submissionApi
        .getSubmissions(prms)
        .then(res => {
          this.setState({
            submissions: res.data.results,
            count: res.data.count,
            pageCount: res.data.total_pages,
            currPage: params.page,
            loaded: true,
            isFiltered: !isEmpty(extraParams),
          });
        })
        .catch(err => {
          this.setState({
            loaded: true,
            errors: err.response.data || "Cannot fetch problems at the moment.",
          });
        });
    }
  }

  componentDidMount() {
    const contest = this.context.contest;
    if (contest) {
      setTitle(`${contest.name} | Submissions`);
      this.setState({contest}, () => this.callApi({page: this.state.currPage}));
    } else this.callApi({page: this.state.currPage});
  }

  componentDidUpdate(prevProps, _prevState) {
    if (prevProps.selectedOrg !== this.props.selectedOrg) {
      this.callApi();
    }
    if (prevProps.subFilter !== this.props.subFilter) {
      this.callApi();
    }
  }

  handlePageClick = event => {
    this.callApi({page: event.selected});
  };

  onRefetchClick() {
    if (this.state.refetchDisable) return;
    this.setState({refetchDisable: true}, () => {
      this.callApi();
      setTimeout(
        () => this.setState({refetchDisable: false}),
        values.refetchDisableDuration
      );
    });
  }

  onMassRejudgeClick() {
    const count = this.state.count;
    if (count === 0) {
      window.alert(messages.getMassRejudgeAlert());
      return;
    }

    const conf = window.confirm(messages.getMassRejudgeConfirm(count));
    if (!conf) return;

    let request;
    if (this.isInContest()) {
      const extraParams = this.props.subFilter[this.state.contest.key] || {};
      request = contestApi.rejudgeContestSubmissions({
        key: this.state.contest.key,
        params: {...extraParams},
      });
    } else {
      const filterParams = this.props.subFilter[NO_CONTEST_KEY] || {};
      let prms = {...filterParams};

      if (this.props.selectedOrg.slug) {
        prms.org = this.props.selectedOrg.slug;
      }
      request = submissionApi.rejudgeSubmissions(prms);
    }

    request
      .then(() => {
        toast.success(messages.toast.rejudging.getOK());
        this.callApi();
      })
      .catch(err => {
        toast.error(
          err.response?.data?.message
            ? `${err.response.data.message}`
            : messages.toast.rejudging.getErr(err.response.status)
        );
      });
  }

  setFilterParams(key, value) {
    const {contest} = this.context;
    const oldParams =
      this.props.subFilter[contest ? contest.key : NO_CONTEST_KEY];
    const newParams = {...oldParams, [key]: value};
    if (contest) this.props.setContestParams(contest.key, newParams);
    else this.props.setPublicParams(newParams);
  }

  render() {
    const {loaded, errors, count, isFiltered} = this.state;
    const {user} = this.props;
    const username = (user && user.username) || "";

    return (
      <div className="submission-table wrapper-vanilla">
        <div className="submission-table-control">
          <div
            className="d-flex align-items-center mr-2"
            data-toggle="tooltip"
            data-placement="bottom"
            title={isFiltered ? "Filter is on" : "Filter is off"}
          >
            {isFiltered ? (
              <FaFilter className="text-success" size={18} />
            ) : (
              <TbFilterOff className="text-secondary" size={20} />
            )}
          </div>

          {/* {(isSuperUser(user) || (isStaff(user) && this.isInContest())) && ( */}
          {isStaff(user) && (
            <Button
              size="sm"
              className="btn-svg"
              variant={this.state.rejudgeDisable ? "secondary" : "danger"}
              disabled={this.state.rejudgeDisable}
              onClick={() => this.onMassRejudgeClick()}
            >
              <span className="d-none d-sm-inline">Rejudge</span> <FaSyncAlt />
            </Button>
          )}
          <Button
            size="sm"
            className="btn-svg"
            variant={this.state.refetchDisable ? "secondary" : "dark"}
            disabled={!!this.state.refetchDisable}
            onClick={() => this.onRefetchClick()}
          >
            <FaRedoAlt />
          </Button>
        </div>
        <div className="submission-count-text">
          <span className="count-text">
            <span className="number">{count || "?"}</span> sub(s)
          </span>
        </div>
        <h4>Submissions</h4>

        <ErrorBox errors={errors} />
        <Table responsive hover size="sm" striped bordered className="rounded">
          <thead>
            <tr>
              <th>Sub</th>
              <th>When</th>
              <th>Info</th>
              <th>Result</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            {!loaded ? (
              <tr>
                <td colSpan="7">
                  <SpinLoader margin="10px" />
                </td>
              </tr>
            ) : (
              !errors && (
                <>
                  {" "}
                  {this.state.count > 0 ? (
                    this.state.submissions.map((sub, idx) => (
                      <SubListItem
                        key={`sub-${sub.id}`}
                        contest={this.context.contest}
                        rowid={idx}
                        {...sub}
                        yourUsername={username}
                        setFilterParams={(key, value) =>
                          this.setFilterParams(key, value)
                        }
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7}>
                        <em>No submission is available yet.</em>
                      </td>
                    </tr>
                  )}
                </>
              )
            )}
          </tbody>
        </Table>
        {this.state.loaded === false ? (
          <SpinLoader margin="0" />
        ) : (
          <div className="d-flex flex-column">
            <span className="classic-pagination">
              Page:{" "}
              <ReactPaginate
                breakLabel="..."
                onPageChange={this.handlePageClick}
                forcePage={this.state.currPage}
                pageLabelBuilder={page => `[${page}]`}
                pageRangeDisplayed={5}
                pageCount={this.state.pageCount}
                renderOnZeroPageCount={null}
                previousLabel={null}
                nextLabel={null}
              />
            </span>
          </div>
        )}
      </div>
    );
  }
}

let wrapped = SubmissionList;
// wrapped = withParams(wrapped);
const mapStateToProps = state => {
  return {
    user: state.user.user,
    selectedOrg: state.myOrg.selectedOrg,
    subFilter: state.subFilter,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    setContestParams: (key, params) =>
      dispatch(setContestParams({key, params})),
    setPublicParams: params => dispatch(setPublicParams({params})),
  };
};

wrapped = connect(mapStateToProps, mapDispatchToProps)(wrapped);
export default wrapped;
