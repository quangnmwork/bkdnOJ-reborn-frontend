/* eslint-disable react/jsx-key */
import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";

import {Outlet} from "react-router-dom";
import {VscError} from "react-icons/vsc";

import {OneColumn} from "layout";

import {SpinLoader} from "components";

import contestAPI from "api/contest";
import {withParams, withNavigation} from "helpers/react-router";

import "styles/ClassicPagination.scss";
import "./ContestApp.scss";

// Context Components
import {ContestNav, ContestBanner, ContestController} from "./_";

// Context
import {ContestProvider} from "context/ContestContext";
import {addContest} from "redux/StandingFilter/action";

/*

  [ Nav ---------------------------------------- ]

  [                   Contest                    ]
  [             Time Left: 00:15:09              ]
  [ -------------------------------------------- ]
  [ Prob | Sub | Standing                        ]

  [                       ] [                    ]
  [                       ] [  Other component   ]
  [         BODY          ] [                    ]
  [                       ]
  [                       ]

*/
class ContestApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      contest_key: this.props.params.key,
      contest: null,
      redirectUrl: null,

      showNav: true,
    };
  }

  getContestStatus(contest) {
    if (!contest) return null;

    const start_time = new Date(contest.start_time);
    const end_time = new Date(contest.end_time);
    if (start_time === null || end_time === null) return null;
    if (isNaN(start_time) || isNaN(end_time)) return null;

    let now = new Date();
    if (now < start_time) {
      return "not-started";
    } else if (now <= end_time) {
      return "running";
    } else {
      return "ended";
    }
  }

  componentDidMount() {
    contestAPI
      .getContest({key: this.state.contest_key})
      .then(res => {
        let contest = res.data;
        contest.status = this.getContestStatus(contest);
        this.setState({
          contest: contest,
          loaded: true,
        });
        const contestId = contest.key;
        if (!Object.hasOwn(this.props.standingFilter, contestId)) {
          this.props.addContestFilter(contestId);
        }
      })
      .catch(err => {
        this.setState({
          loaded: true,
          errors: err.response.data || ["Contest not available"],
        });
        let msg =
          (err.response.data &&
            err.response.data.detail &&
            err.response.data.detail) ||
          `Contest is not available. (${err.response.status || "NETWORK_ERR"})`;

        toast.error(msg, {
          toastId: "contest-na",
          autoClose: false,
        });
        // this.props.navigate( -1, { replace: true } )
      });
  }

  render() {
    const {contest, loaded, showNav} = this.state;

    let mains = contest
      ? [
          <ContestBanner contestLoaded={loaded} contest={contest} />,
          <ContestNav />,
          <Outlet />,
        ]
      : !loaded
      ? [
          <div className="shadow flex-center" style={{height: "200px"}}>
            <SpinLoader margin="0" />
          </div>,
        ]
      : [
          <div className="shadow flex-center-col" style={{height: "200px"}}>
            <h4>Contest Not Available</h4>
            <hr style={{width: "50%"}} className="mt-1" />
            <VscError size={30} color="red" />
          </div>,
        ];
    // console.log(mains)
    // if (showNav) mains.splice(1, 0, <ContestNav/>)

    return (
      <div id="contest-app">
        <ContestProvider value={{contest}}>
          {contest && (
            <ContestController
              showNav={showNav}
              setShowNav={v => this.setState({showNav: v})}
              ckey={contest.key}
            />
          )}
          <OneColumn mainContent={mains} />
        </ContestProvider>
      </div>
    );
  }
}

let wrapped = withParams(ContestApp);
wrapped = withNavigation(wrapped);

const mapStateToProps = state => {
  return {
    user: state.user.user,
    // profile: state.profile.profile,
    contest: state.contest.contest,
    standingFilter: state.standingFilter.standingFilter,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addContestFilter: contestId => dispatch(addContest({contestId})),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(wrapped);
