import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";
import {Button, Table} from "react-bootstrap";

import {SpinLoader, ErrorBox, UserCard} from "components";
import SubListModal from "./SubListModal";
import StandingFilter from "./StandingFilter";

import contestAPI from "api/contest";

// Helpers
import {setTitle} from "helpers/setTitle";
import {getLocalDateWithTimezone} from "helpers/dateFormatter";

// Assets
import top1 from "assets/common/atcoder_top1.png";
import top10 from "assets/common/atcoder_top10.png";
import top30 from "assets/common/atcoder_top30.png";
import top100 from "assets/common/atcoder_top100.png";

import {GiIceCube} from "react-icons/gi";
import {FaUniversity} from "react-icons/fa";
import {AiOutlineEye} from "react-icons/ai";
import {BiTargetLock} from "react-icons/bi";

// Contexts
import ContestContext from "context/ContestContext";

// Styles
import "./ContestStanding.scss";
import "styles/Ratings.scss";

const __STANDING_POLL_DELAY = 5000;
const __STANDING_HIGHLIGHT_TIME = 5000;

const getClassNameFromPoint = (point, maxPoint) => {
  let ptsClsName = "";
  if (maxPoint > 0) {
    const percent = Math.round((point / maxPoint) * 100);

    if (percent <= 25) ptsClsName = "one-fourth";
    else if (percent <= 50) ptsClsName = "two-fourth";
    else if (percent <= 75) ptsClsName = "three-fourth";
    else if (percent < 100) ptsClsName = "four-fourth";
    else ptsClsName = "full-points";
  }
  return ptsClsName;
};

class StandingItem extends React.Component {
  render() {
    const {
      rowIdx,
      user,
      score,
      cumtime,
      frozen_score,
      frozen_cumtime,
      format_data,
      isFavorite,
      filteredRank,
      contestId,
    } = this.props;

    const {userMapping, probMapping, orgMapping, isFrozen} = this.props;

    let best = Array(Object.keys(probMapping).length).fill(<></>);
    let data = JSON.parse(format_data);
    if (data && data.constructor === Object)
      Object.keys(data).forEach(k => {
        const prob_data = data[k]; // => {'time': ..., 'points': ...}

        // this might not exists because admin of contest decide to delete them, but the contest data is still there
        if (!probMapping[k]) return;

        const i = probMapping[k].pos;
        const problemMaxPoints = probMapping[k].points;

        const {points, sub_time, tries, tries_after_frozen} = prob_data;

        const ptsClsName = getClassNameFromPoint(points, problemMaxPoints);

        best[i] = (
          <div
            className={
              `flex-center-col points-container ` +
              (tries_after_frozen > 0 ? "frozen" : ptsClsName)
            }
            onClick={() =>
              this.props.setSubListData({
                user,
                problem: probMapping[k].shortname,
              })
            }
          >
            <div className={`p-best-points points ${ptsClsName}`}>
              {`${points}`}
              {(!!tries || !!tries_after_frozen) && (
                <span className="extra">
                  (<span className="tries">{tries}</span>
                  {tries_after_frozen > 0 && (
                    <span className="frozen_tries">+{tries_after_frozen}</span>
                  )}
                  )
                </span>
              )}
            </div>

            <div className="p-best-time text-truncate time">{sub_time}</div>
          </div>
        );
      });

    let showScore, showCumtime;
    if (isFrozen) {
      showScore = frozen_score;
      showCumtime = frozen_cumtime;
    } else {
      showScore = score;
      showCumtime = cumtime;
    }

    return (
      <tr id={`standing-${user}`} className={this.props.className}>
        <td className="td-rank">
          <div className="flex-center rank-display">
            <div className="rank-position">{rowIdx + 1}</div>
            {rowIdx === 0 ? <img src={top1} alt="Top 1 Icon" /> : ""}
            {0 < rowIdx && rowIdx < 10 ? (
              <img src={top10} alt="Top 10 Icon" />
            ) : (
              ""
            )}
            {10 <= rowIdx && rowIdx < 30 ? (
              <img src={top30} alt="Top 30 Icon" />
            ) : (
              ""
            )}
            {30 <= rowIdx && rowIdx < 100 ? (
              <img src={top100} alt="Top 100 Icon" />
            ) : (
              ""
            )}
          </div>
          {filteredRank && (
            <span
              className="text-secondary"
              title="Rank in filtered team"
              data-toogle="tooltip"
              data-placement="right"
            >
              (#{filteredRank})
            </span>
          )}
        </td>
        <td className="td-participant">
          {userMapping && user in userMapping ? (
            <UserCard
              displayMode={this.props.displayMode}
              user={userMapping[user]}
              organization={orgMapping[userMapping[user].organization]}
              isFavorite={isFavorite}
              contestId={contestId}
            />
          ) : (
            <span>{user}</span>
          )}
        </td>

        <td className="td-total">
          <div className="flex-center-col">
            <div className="p-best-points points">{showScore}</div>
            <div className="p-best-time text-truncate time">{showCumtime}</div>
          </div>
        </td>

        {best.map((c, i) => (
          <td className="td-p-best" key={`ct-st-pb-${user.username}-${i}`}>
            {c}
          </td>
        ))}
      </tr>
    );
  }
}

class ContestStanding extends React.Component {
  static contextType = ContestContext;

  constructor(props) {
    super(props);
    this.state = {
      probId2idx: {},
      orgMapping: {},
      userMapping: null,

      problems: null,
      standing: [],

      isFrozen: true,
      canBreakIce: false,
      iceBroken: false,

      displayMode: "user",

      loaded: false,
      errors: null,

      contest: null,
      user: null,

      isPollingOn: true,
      isPolling: false,

      // SubList Modal
      subListShow: false,
      subListData: null,
      highlightUser: "",
    };
  }

  setSubListData(data) {
    this.setState({subListShow: true, subListData: data});
  }

  clearSubListData() {
    this.setState({subListShow: false, subListData: null});
  }

  /* Set viewing mode of scoreboard to not frozen */
  meltingIce() {
    this.setState({iceBroken: true}, () => this.refetch());
  }

  /* Set viewing mode of scoreboard to Frozen */
  freezingIce() {
    this.setState({iceBroken: false}, () => this.refetch());
  }

  /* Receive results of Contest Standing api and handle */
  handleContestStanding(res) {
    this.setState({
      loaded: true,
      isPolling: false,

      standing: res.data.results,
      problems: res.data.problems,
      organizations: res.data.organizations,

      frozenEnabled: res.data.is_frozen_enabled,
      frozenTime: res.data.frozen_time,
      isFrozen: res.data.is_frozen,
      canBreakIce: res.data.can_break_ice || false,

      scoreboardCache: res.data.scoreboard_cache_duration,
    });

    // Contest - Problems mapping
    let mapping = {}; // mapping here is a list of problems in the contest -> their id
    let uniq = 0;
    res.data.problems.forEach(prob => {
      if (mapping[prob.id]) return;
      mapping[prob.id] = {
        pos: uniq,
        points: prob.points,
        shortname: prob.shortname,
      };
      uniq++;
    });
    this.setState({probId2idx: mapping});

    // Contest - Organization mapping
    mapping = {}; // mapping here is a list of problems in the contest -> their id
    res.data.organizations.forEach(org => {
      mapping[org.slug] = org;
    });
    this.setState({orgMapping: mapping});
  }

  async refetch(polling = false) {
    // Dont do fetch if user is viewing the modal
    if (this.state.subListShow) return;

    if (polling) this.setState({isPolling: true});
    else this.setState({loaded: false, errors: null});

    const params = this.state.iceBroken ? {view_full: 1} : {view_full: 0};

    let apis = [];
    // if participants profiles are not loaded, queue this api
    if (!this.state.userMapping) {
      apis.push(
        contestAPI
          .getContestParticipants({key: this.state.contest.key})
          .then(res => {
            let userMapping = {};
            res.data.forEach(user => {
              userMapping[user.username] = user;
            });
            this.setState({userMapping});
          })
          .catch(err => {
            console.log("Cannot fetch participants profile. ", err);
          })
      );
    }
    // Contest Standing
    apis.push(
      contestAPI
        .getContestStanding({key: this.state.contest.key, params})
        .then(res => this.handleContestStanding(res))
        .catch(err => {
          clearInterval(this.timer);
          this.setState({
            isPollingOn: false,
            loaded: true,
            errors: err.response && err.response.data,
          });
          toast.error(
            `Standing not available at the moment. (${
              err.response.status || "NETWORK_ERR"
            })`,
            {
              toastId: "contest-standing-na",
            }
          );
        })
    );

    await Promise.all(apis);
  }

  setHighlightUser(username) {
    this.setState({highlightUser: username}, () => {
      setTimeout(() => {
        this.setState({highlightUser: ""});
      }, __STANDING_HIGHLIGHT_TIME);
    });
  }

  scrollToCurrentStanding(username) {
    const userDiv = document.getElementById(`standing-${username}`);
    if (!userDiv) return;

    userDiv.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    this.setHighlightUser(username);
  }

  componentDidMount() {
    this.setState({
      contest: (this.context && this.context.contest) || null,
      user: (this.props && this.props.user) || null,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {user} = this.props;
    const {contest} = this.context;
    if (!contest) return; // skip if no contest

    if (prevState.contest !== contest || prevState.user !== user) {
      this.setState({user, contest}, () => {
        setTitle(`${contest.name} | Standing`);
        this.refetch();
      });
    }

    let pollDelay = this.state.scoreboardCache * 1000 || __STANDING_POLL_DELAY;
    pollDelay = Math.max(pollDelay, __STANDING_POLL_DELAY);
    clearInterval(this.timer);
    this.timer = setInterval(() => this.refetch(true), pollDelay);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const {
      loaded,
      problems,
      standing,
      frozenEnabled,
      frozenTime,
      isFrozen,
      canBreakIce,
      displayMode,
      scoreboardCache,
      iceBroken,
      isPolling,
    } = this.state;

    let baseFilteredRank = 1;
    const isRegistered = this.context.contest.is_registered;

    return (
      <div className="wrapper-vanilla p-2" id="contest-standing">
        <div className="standing-lbl">
          <h4 className="standing-head">
            Standing {isPolling && <SpinLoader size={18} margin="0 2px" />}
          </h4>

          <ErrorBox errors={this.state.errors} />

          <div className="flex-center-col standing-notice">
            {scoreboardCache > 0 && (
              <span className="frozen-time">
                Scoreboard is cached for every {scoreboardCache} second(s), it
                will take a while for your submissions to appear here.
              </span>
            )}
            {frozenEnabled &&
              (new Date() < new Date(frozenTime) ? (
                <span className="frozen-time">
                  Will be Frozen after {getLocalDateWithTimezone(frozenTime)}.
                </span>
              ) : (
                <span className="frozen-time">
                  Frozen since {getLocalDateWithTimezone(frozenTime)}.
                </span>
              ))}
          </div>

          <div className="standing-options">
            {canBreakIce &&
              (!iceBroken ? (
                <Button
                  variant="light"
                  className="btn-svg"
                  onClick={() => this.meltingIce()}
                >
                  <AiOutlineEye size={20} /> Peek
                </Button>
              ) : (
                <Button
                  variant="dark"
                  className="btn-svg"
                  onClick={() => this.freezingIce()}
                >
                  <GiIceCube size={20} /> Freeze!
                </Button>
              ))}
            {displayMode === "user" ? (
              <Button
                variant="light"
                className="btn-svg"
                onClick={() => this.setState({displayMode: "org"})}
              >
                <FaUniversity size={20} /> Show
              </Button>
            ) : (
              <Button
                variant="dark"
                className="btn-svg"
                onClick={() => this.setState({displayMode: "user"})}
              >
                <FaUniversity size={20} /> Hide
              </Button>
            )}
            <StandingFilter
              contestId={this.state.contest?.key}
              orgList={this.state.organizations}
            />
            {isRegistered && (
              <Button
                variant="warning"
                className="ml-auto btn-svg "
                onClick={() =>
                  this.scrollToCurrentStanding(this.props.user.username)
                }
              >
                <BiTargetLock size={20} />
                <span className="d-none d-sm-block">My Standing</span>
              </Button>
            )}
          </div>
        </div>

        {!loaded && <SpinLoader margin="40px" />}
        {loaded && !this.state.errors && (
          <>
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
                  <th className="th-rank">Rank</th>
                  <th className="th-participant">Participant</th>
                  <th className="th-score">Score</th>
                  {problems &&
                    problems.map((prob, idx) => {
                      const probMode = prob.partial
                        ? `${prob.points}p`
                        : "icpc";
                      const probInfo = prob.partial
                        ? `You can earn partial points from 0pts upto ${prob.points}pts.`
                        : `You either get 0pts or ${prob.points}pts.`;

                      return (
                        <th key={`cs-th-prb-${idx}`} className={`th-p-best`}>
                          <div
                            className="flex-center-col"
                            data-toggle="tooltip"
                            data-placement="bottom"
                            title={probInfo}
                            style={{cursor: "help"}}
                          >
                            <strong>{prob.label}</strong>
                            <div
                              className="border-top "
                              style={{fontSize: "14px", width: "70%"}}
                            >
                              <span>{probMode}</span>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                </tr>
              </thead>
              <tbody>
                {standing.map((part, idx) => {
                  const contestId = this.state.contest?.key;
                  const standingFilter = this.props.standingFilter[contestId];

                  const {
                    isOrgFilterEnable,
                    isFavoriteOnly,
                    filteredOrg,
                    favoriteTeams,
                  } = standingFilter;

                  const isFilterEnable = isOrgFilterEnable || isFavoriteOnly;
                  const {user} = part;
                  const isFavorite = favoriteTeams.includes(user);

                  let userFilteredRank = undefined;
                  if (isFilterEnable) {
                    const orgName = this.state.userMapping[user].organization;
                    const isShow = filteredOrg.includes(orgName) || isFavorite;
                    if (isShow) userFilteredRank = baseFilteredRank++;
                    else return <></>;
                  }

                  const isHighlight = this.state.highlightUser === user;
                  return (
                    <StandingItem
                      key={`ct-st-row-${idx}`}
                      className={`scroll__margin ${
                        isHighlight ? "scroll__highlight" : ""
                      }`}
                      orgMapping={this.state.orgMapping}
                      probMapping={this.state.probId2idx}
                      userMapping={this.state.userMapping}
                      rowIdx={idx}
                      isFrozen={isFrozen}
                      displayMode={displayMode}
                      filteredRank={userFilteredRank}
                      isFavorite={isFavorite}
                      contestId={contestId}
                      {...part}
                      setSubListData={d => this.setSubListData(d)}
                    />
                  );
                })}
              </tbody>
            </Table>
            <SubListModal
              show={this.state.subListShow}
              onHide={() => this.clearSubListData()}
              data={{
                ...this.state.subListData,
                contest: this.state.contest.key,
              }}
            />
          </>
        )}
      </div>
    );
  }
}

let wrapped = ContestStanding;
const mapStateToProps = state => {
  return {
    user: state.user.user,
    standingFilter: state.standingFilter.standingFilter,
    // profile: state.profile.profile,
  };
};
export default connect(mapStateToProps, null)(wrapped);
