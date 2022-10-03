import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";

import ReactPaginate from "react-paginate";
import {Link} from "react-router-dom";
import {Table} from "react-bootstrap";
import {VscPerson} from "react-icons/vsc";

import {SpinLoader, ErrorBox} from "components";
import contestAPI from "api/contest";
import {setTitle} from "helpers/setTitle";
import {getDuration} from "helpers/durationFormatter";

import "./List.scss";
import "styles/ClassicPagination.scss";

class ContestListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time_label: "Loading..",
    };
  }

  updateTimeLeftLabel() {
    const contest = this.props.data;
    let start_time = new Date(contest.start_time);
    let end_time = new Date(contest.end_time);
    if (isNaN(start_time) || isNaN(end_time)) {
      clearInterval(this.timer);
      return;
    }

    let now = new Date();
    let lbl = "";
    let t = 0;
    if (now < start_time) {
      lbl = "Contest Starting In ";
      t = Math.floor((start_time - now) / 1000);
    } else if (now < end_time) {
      lbl = "Contest is Running: ";
      t = Math.floor((end_time - now) / 1000);
    } else {
      lbl = "Contest is Finished";
      t = 0;
      clearInterval(this.timer);
    }
    this.setState({time_label: lbl});

    let hhmmss = "";
    if (t > 0) {
      let s = t % 60;
      let m = Math.floor(t / 60);
      let h = Math.floor(m / 60);
      m = m % 60;
      hhmmss =
        (h < 10 ? "0" : "") +
        h +
        ":" +
        (m < 10 ? "0" : "") +
        m +
        ":" +
        (s < 10 ? "0" : "") +
        s +
        "";
    }
    this.setState({time_label: `${lbl} ${hhmmss}`});
  }
  componentDidMount() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.updateTimeLeftLabel(), 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  parseStartTime() {
    if (this.props.data.start_time)
      return (
        <span>
          {new Date(this.props.data.start_time).toLocaleString()}
          <div style={{fontSize: "10px"}}>
            UTC{this.props.data.start_time.substring(19)}
          </div>
        </span>
      );
    return "Chưa công bố";
  }
  parseDuration() {
    if (this.props.data.time_limit) return this.props.data.time_limit;
    return getDuration(this.props.data.start_time, this.props.data.end_time);
  }
  parseParticipation() {
    const type = this.props.type;
    if (type === "active") {
      return;
    }
  }

  isInContest(ckey) {
    const {profile} = this.props;
    console.log(profile);
    if (!profile || !profile.current_contest) return false;
    if (profile.current_contest.contest.key !== ckey) return false;
    return true;
  }
  isParticipant(ckey) {
    if (!this.isInContest(ckey)) return false;
    const {profile} = this.props;
    return profile.current_contest.virtual === 0;
  }
  isSpectator(ckey) {
    if (!this.isInContest(ckey)) return false;
    const {profile} = this.props;
    return profile.current_contest.virtual === -1;
  }

  registerContest(ckey, ooc) {
    let conf = false;
    if (ooc) {
      conf = window.confirm(
        `Đăng ký cuộc thi "${ckey}" ở tư cách spectator? Bạn sẽ có thể nộp bài, nhưng sẽ không xuất hiện trên bảng xếp hạng.`
      );
    } else {
      conf = window.confirm(
        `Đăng ký cuộc thi "${ckey}"? Sau khi đăng ký, bạn có thể nộp bài và xuất hiện trên bảng xếp hạng.`
      );
    }
    if (!conf) return false;

    contestAPI
      .joinContest({key: ckey})
      .then(() => {
        toast.success(`Đăng ký contest ${ckey} thành công.`, {
          toastId: "contest-registered",
        });
      })
      .catch(err => {
        const msg =
          (err.response && err.response.data && err.response.data.detail) ||
          `Đăng ký contest "${ckey}" thất bại.`;
        toast.error(msg, {toastId: "contest-register-failed"});
      })
      .finally(() => this.props.refetch && this.props.refetch());
  }

  render() {
    const ckey = this.props.data.key;
    const cname = this.props.data.name;
    const {spectate_allow, register_allow, is_registered} = this.props.data;
    const type = this.props.type;
    const {user} = this.props;

    return (
      <tr>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          <Link to={`/contest/${ckey}`}>{ckey}</Link>
        </td>
        <td className="" style={{minWidth: "200px", maxWidth: "300px"}}>
          <Link to={`/contest/${ckey}`}>{cname}</Link>
          {type !== "past" && (
            <>
              <br />
              <span className="d-inline-flex align-items-center contest-status-lbl">
                {this.state.time_label}
              </span>
            </>
          )}
        </td>
        <td className="contest-start" style={{minWidth: "150px"}}>
          {this.parseStartTime()}
        </td>
        <td>{this.parseDuration()}</td>
        <td className="participate-options">
          {
            <div
              className="text-center d-flex flex-column align-items-center"
              style={{width: "100%"}}
            >
              <div className="flex-center">
                Participants: {this.props.data.user_count}
                <VscPerson size={18} />
              </div>
              {
                /* Active: Present contest that has Live Participation of user */
                type === "active" && (
                  <>
                    {
                      <span className="active-continue-label">
                        <Link to={`/contest/${ckey}`}>{`Continue >>`}</Link>
                      </span>
                    }
                    <span className="d-inline-flex align-items-center">
                      <Link
                        to={`/contest/${ckey}/standing`}
                      >{`Current Standing >>`}</Link>
                    </span>
                  </>
                )
              }

              {
                /* Active: Present contest that doesnt have Live Participation of user */
                type === "present" && (
                  <>
                    {user && !is_registered && (
                      <>
                        {spectate_allow ? (
                          <span className="d-inline-flex align-items-center">
                            <Link
                              to="#"
                              onClick={() => this.registerContest(ckey, true)}
                            >{`Register (out of competition) >>`}</Link>
                          </span>
                        ) : register_allow ? (
                          <span className="d-inline-flex align-items-center">
                            <Link
                              to="#"
                              onClick={() => this.registerContest(ckey)}
                            >{`Register >>`}</Link>
                          </span>
                        ) : (
                          <span className="d-inline-flex align-items-center">
                            <span style={{color: "red"}}>
                              Register is not Allowed.
                            </span>
                          </span>
                        )}
                      </>
                    )}
                    {user && is_registered && spectate_allow && (
                      <Link to={`/contest/${ckey}`}>{`Spectate >>`}</Link>
                    )}
                    {!user && (
                      <span className="d-inline-flex align-items-center">
                        <Link
                          to={`/sign-in`}
                        >{`Log in to Participate >>`}</Link>
                      </span>
                    )}
                    <span className="d-inline-flex align-items-center">
                      <Link
                        to={`/contest/${ckey}/standing`}
                      >{`Current Standing >>`}</Link>
                    </span>
                  </>
                )
              }
              {
                /* Future: Not started yet */
                type === "future" && (
                  <>
                    {user && !is_registered && (
                      <>
                        {spectate_allow ? (
                          <span className="d-inline-flex align-items-center">
                            <Link
                              to="#"
                              onClick={() => this.registerContest(ckey, true)}
                            >{`Register (out of competition) >>`}</Link>
                          </span>
                        ) : register_allow ? (
                          <span className="d-inline-flex align-items-center">
                            <Link
                              to="#"
                              onClick={() => this.registerContest(ckey)}
                            >{`Register >>`}</Link>
                          </span>
                        ) : (
                          <span className="d-inline-flex align-items-center">
                            <span style={{color: "red"}}>
                              Register is not Allowed.
                            </span>
                          </span>
                        )}
                      </>
                    )}
                    {user && is_registered && spectate_allow && (
                      <Link to={`/contest/${ckey}`}>{`Spectate >>`}</Link>
                    )}
                    {!user && (
                      <span className="d-inline-flex align-items-center">
                        <Link
                          to={`/sign-in`}
                        >{`Log in to Participate >>`}</Link>
                      </span>
                    )}
                    <span className="d-inline-flex align-items-center">
                      <Link
                        to={`/contest/${ckey}/standing`}
                      >{`Current Standing >>`}</Link>
                    </span>
                  </>
                )
              }

              {type === "past" && (
                <>
                  <span className="d-inline-flex align-items-center">
                    <Link
                      to={`/contest/${ckey}/standing`}
                    >{`Standing >>`}</Link>
                  </span>
                </>
              )}
            </div>
          }
        </td>
      </tr>
    );
  }
}

class NPContestList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contest: [],
      loaded: false,
      errors: null,
    };
  }

  callApi() {
    this.setState({loaded: false, errors: null});

    let prms = {};
    if (this.props.selectedOrg.slug) {
      prms.org = this.props.selectedOrg.slug;
    }

    contestAPI
      .getContests(prms)
      .then(cont => {
        this.setState({
          contests: cont.data,
          loaded: true,
        });
      })
      .catch(() => {
        this.setState({
          loaded: true,
          errors:
            "Cannot fetch contests at the moment. Please retry again after a few minutes.",
        });
      });
  }

  componentDidMount() {
    this.callApi({page: this.state.currPage});
  }
  componentDidUpdate(prevProps, _prevState) {
    if (prevProps.selectedOrg !== this.props.selectedOrg) {
      this.callApi();
    }
  }

  render() {
    const {contests} = this.state;
    return (
      <div className="npast-contest">
        <h4>Ongoing/Upcoming Contests</h4>
        <ErrorBox errors={this.state.errors} />
        <Table responsive hover size="sm" striped bordered className="rounded">
          <thead>
            <tr>
              <th style={{width: "13%"}}>#</th>
              <th style={{width: "30%"}}>Name</th>
              <th className="contest-start">When</th>
              <th style={{width: "8%"}}>Duration</th>
              <th className="participate-options">Participate</th>
            </tr>
          </thead>
          <tbody>
            {this.state.loaded === false && (
              <tr>
                <td colSpan="6">
                  <SpinLoader margin="10px" />
                </td>
              </tr>
            )}
            {this.state.loaded === true && !this.state.errors && (
              <>
                {this.state.contests.active.map((cont, idx) => (
                  <ContestListItem
                    key={`cont-${cont.key}`}
                    rowid={idx}
                    data={cont}
                    user={this.props.user}
                    profile={this.props.profile}
                    refetch={() => this.callApi()}
                    type="active"
                  />
                ))}
                {this.state.contests.present.map((cont, idx) => (
                  <ContestListItem
                    key={`cont-${cont.key}`}
                    rowid={idx}
                    data={cont}
                    user={this.props.user}
                    profile={this.props.profile}
                    refetch={() => this.callApi()}
                    type="present"
                  />
                ))}
                {this.state.contests.future.map((cont, idx) => (
                  <ContestListItem
                    key={`cont-${cont.key}`}
                    rowid={idx}
                    data={cont}
                    user={this.props.user}
                    profile={this.props.profile}
                    refetch={() => this.callApi()}
                    type="future"
                  />
                ))}
                {contests.active.length +
                  contests.present.length +
                  contests.future.length ===
                  0 && (
                  <>
                    <tr>
                      <td colSpan="99">
                        <em>No contest planned yet.</em>
                      </td>
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
        </Table>
      </div>
    );
  }
}

class ContestList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pastContests: [],
      currPage: 0,
      pageCount: 1,

      loaded: false,
      errors: null,
    };
    setTitle("Contests");
  }

  callApi(params = {page: 0}) {
    this.setState({loaded: false, errors: null});

    let prms = {page: params.page + 1};
    if (this.props.selectedOrg.slug) {
      prms.org = this.props.selectedOrg.slug;
    }

    contestAPI
      .getPastContests(prms)
      .then(pastcont => {
        this.setState({
          pastContests: pastcont.data.results,
          count: pastcont.data.count,
          pageCount: pastcont.data.total_pages,
          currPage: params.page,
          loaded: true,
        });
      })
      .catch(() => {
        this.setState({
          loaded: true,
          errors:
            "Cannot fetch contests at the moment. Please retry again after a few minutes.",
        });
      });
  }

  componentDidMount() {
    this.callApi({page: this.state.currPage});
  }
  componentDidUpdate(prevProps, _prevState) {
    if (prevProps.selectedOrg !== this.props.selectedOrg) {
      this.callApi();
    }
  }

  handlePageClick = event => {
    this.callApi({page: event.selected});
  };

  render() {
    const {pastContests, errors, loaded, count} = this.state;
    return (
      <>
        <div className="contest-table wrapper-vanilla">
          <NPContestList {...this.props} />
        </div>
        <hr className="m-2" />
        <div className="contest-table wrapper-vanilla">
          <div className="past-contest">
            <h4>Past Contests</h4>
            <ErrorBox errors={errors} />
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
                  <th style={{width: "13%"}}>#</th>
                  <th style={{width: "30%"}}>Name</th>
                  <th className="contest-start">When</th>
                  <th style={{width: "8%"}}>Duration</th>
                  <th className="participate-options">Participate</th>
                </tr>
              </thead>
              <tbody>
                {loaded === false && (
                  <tr>
                    <td colSpan="6">
                      <SpinLoader margin="10px" />
                    </td>
                  </tr>
                )}
                {loaded === true && (
                  <>
                    {pastContests.map((cont, idx) => (
                      <ContestListItem
                        key={`cont-${cont.key}`}
                        rowid={idx}
                        data={cont}
                        user={this.props.user}
                        type="past"
                      />
                    ))}{" "}
                    {count === 0 && (
                      <tr>
                        <td colSpan="99">
                          <em>No contest yet.</em>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </Table>
            {this.state.loaded === false ? (
              <SpinLoader margin="0" />
            ) : (
              <span className="classic-pagination">
                Page:{" "}
                <ReactPaginate
                  breakLabel="..."
                  onPageChange={this.handlePageClick}
                  forcePage={this.state.currPage}
                  pageLabelBuilder={page => `[${page}]`}
                  pageRangeDisplayed={3}
                  pageCount={this.state.pageCount}
                  renderOnZeroPageCount={null}
                  previousLabel={null}
                  nextLabel={null}
                />
              </span>
            )}
          </div>
        </div>
      </>
    );
  }
}

let wrapped = ContestList;
const mapStateToProps = state => {
  return {
    user: state.user.user,
    profile: state.profile.profile,
    selectedOrg: state.myOrg.selectedOrg,
  };
};
export default connect(mapStateToProps, null)(wrapped);
