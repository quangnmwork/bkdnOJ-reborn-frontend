import React from "react";

// Redux
import {connect} from "react-redux";
import ReactPaginate from "react-paginate";
import {stopPolling} from "redux/RecentSubmission/actions";

import {Table} from "react-bootstrap";
import {Link} from "react-router-dom";

import contestAPI from "api/contest";

import {ErrorBox, SpinLoader} from "components";
import ContestContext from "context/ContestContext";

// Helpers
import {getHourMinuteSecond, getYearMonthDate} from "helpers/dateFormatter";
import {shouldStopPolling} from "constants/statusFilter";

import "./RecentSubmissionSidebar.scss";

const __RECENT_SUBMISSION_POLL_DELAY = 3000; // ms
const __RECENT_SUBMISSION_MAX_POLL_DURATION = 30 * 1000; // ms

class RSubItem extends React.Component {
  parseTime(time) {
    if (time === 0) return "0 ms";
    if (!time) return "N/A";
    return `${(time * 1000).toFixed(0)} ms`;
  }
  parseMemory(mem) {
    if (mem === 0) return "0 KB";
    if (!mem) return "N/A";
    if (mem > 65535) return `${(mem + 1023) / 1024} MB`;
    return `${mem} KB`;
  }

  render() {
    const {id, ckey, problem, language, points, status, result, date} =
      this.props;
    const verdict = status === "D" ? result : status;

    return (
      <tr>
        <td className="info">
          <div className="info-wrapper">
            <div className="flex-center-col">
              <div className="prob-wrapper">
                <Link id="sub-id" to={`/contest/${ckey}/submission/${id}`}>
                  #{id}
                </Link>
                -
                <Link
                  className="prob text-truncate-rv"
                  to={`/contest/${ckey}/problem/${problem.shortname}`}
                >
                  {problem.shortname}
                </Link>
              </div>

              <div className="other-wrapper">
                <span className="lang-wrapper">{language}</span>|
                <span
                  className={`text-wrapper verdict ${verdict.toLowerCase()}`}
                >
                  {verdict}
                </span>
                {typeof points === "number" ? (
                  <>
                    |
                    <span
                      className={`points verdict ${verdict.toLowerCase()} text-truncate`}
                    >{`${points} pts`}</span>
                  </>
                ) : (
                  "n/a"
                )}
              </div>
            </div>
          </div>
        </td>

        <td className="flex-center responsive-date">
          <div className="date">{getYearMonthDate(date)}</div>
          <div className="time">{getHourMinuteSecond(date)}</div>
        </td>
      </tr>
    );
  }
}

class RecentSubmissionSidebar extends React.Component {
  static contextType = ContestContext;
  constructor(props) {
    super(props);
    this.state = {
      subs: [],
      loaded: false,
      errors: null,
      count: null,

      contest: null,
      user: null,
      currPage: 0,

      isPollingOn: true,
      isPolling: false,
    };
  }

  refetch(poll = false) {
    if (poll) this.setState({isPolling: true, errors: null});
    else this.setState({loaded: false, count: null, errors: null});

    const pageNo = {page: this.state.currPage + 1};

    const {user} = this.state;
    contestAPI
      .getContestSubmissions({
        key: this.state.contest.key,
        params: {user: user.username, ...pageNo},
      })
      .then(res => {
        this.setState({
          isPolling: false,
          loaded: true,
          subs: res.data.results, // first page only
          count: res.data.count,
          pageCount: res.data.total_pages,
        });
        // console.log(res);
      })
      .catch(err => {
        this.setState({
          isPolling: false,
          loaded: true,
          errors: err.response.data,
          count: 0,
        });
      });
  }

  handlePageClick = event => {
    this.setState({currPage: event.selected}, () => this.refetch());
  };

  pollResult() {
    if (shouldStopPolling(this.state.subs[0].status) || !!this.state.errors) {
      clearInterval(this.timer);
      return;
    }
    this.refetch(true);
  }

  componentDidMount() {
    // Fix when component unmount and remount again,
    // lifecycle DidUpdate never get invoked because the props doesn't change.
    this.setState({
      contest: (this.context && this.context.contest) || null,
      user: (this.props && this.props.user) || null,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {user} = this.props;
    const {contest} = this.context;
    if (!user || !contest) return; // skip if no user or no contest

    // Update when: prevState is null, or prevState is different to currentState
    if (
      !prevState.contest ||
      !prevState.user ||
      prevState.contest.key !== contest.key ||
      prevState.user.username !== user.username
    ) {
      this.setState({user, contest}, () => {
        this.refetch();
      });
    }

    // Polling status changes
    if (prevProps.polling !== this.props.polling) {
      clearInterval(this.timer);
      if (this.props.polling) {
        this.refetch(true);
        this.timer = setInterval(
          () => this.pollResult(),
          __RECENT_SUBMISSION_POLL_DELAY
        );
        setTimeout(
          () => this.props.stopPolling(),
          __RECENT_SUBMISSION_MAX_POLL_DURATION
        );
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const {subs, loaded, errors, user, contest} = this.state;

    return (
      <div className="wrapper-vanilla" id="recent-submission-sidebar">
        <h4>Recent Submission</h4>
        {!user && (
          <span>
            <Link to="/sign-in">Log in</Link> to see
          </span>
        )}
        {!!user && !contest && <span>Contest is not available.</span>}
        {!!user && !!contest && !loaded && <SpinLoader margin="20px" />}
        {!!user && !!contest && !!loaded && (
          <>
            <div className="pl-1 pr-1">
              <ErrorBox errors={errors} />
            </div>

            {
              <Table
                responsive
                hover
                size="sm"
                striped
                bordered
                className="rounded"
              >
                <thead>
                  <tr>
                    <th className="subid">Info</th>
                    <th className="responsive-date">When</th>
                  </tr>
                </thead>
                <tbody>
                  {loaded && !errors && (
                    <>
                      {this.state.count === 0 ? (
                        <tr>
                          <td colSpan="4">
                            <em>No Submissions Yet.</em>
                          </td>
                        </tr>
                      ) : (
                        subs.map((sub, idx) => (
                          <RSubItem
                            key={`recent-sub-${sub.id}`}
                            rowid={idx}
                            ckey={this.state.contest && this.state.contest.key}
                            {...sub}
                          />
                        ))
                      )}
                    </>
                  )}
                </tbody>
              </Table>
            }

            {!!user && !!contest && this.state.loaded === false ? (
              <SpinLoader margin="0" />
            ) : (
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
            )}

            {/* { !!user && !!contest && !!loaded && this.state.count > subs.length &&
            <span style={{fontSize: "12px"}}><em>..and {this.state.count - subs.length} more.</em></span>
          } */}
          </>
        )}
      </div>
    );
  }
}

let wrapped = RecentSubmissionSidebar;
const mapStateToProps = state => {
  return {
    user: state.user.user,
    profile: state.profile.profile,
    polling: state.recentSubmission.polling,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    stopPolling: () => dispatch(stopPolling()),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(wrapped);
