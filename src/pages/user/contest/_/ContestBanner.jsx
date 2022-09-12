import React from "react";

import {SpinLoader} from "components";

export default class ContestBanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time_label: "...",
      contest: {},
    };
  }

  isParticipant() {
    const {contest} = this.state;
    if (contest)
      if (contest.is_registered && !contest.spectate_allow) return true;
    return false;
  }
  isSpectator() {
    const {contest} = this.state;
    if (contest)
      if (contest.is_registered && contest.spectate_allow) return true;
    return false;
  }
  isViewer() {
    const {contest} = this.state;
    if (contest)
      if (contest.is_registered && contest.spectate_allow) return true;
    return false;
  }

  updateTimeLeftLabel() {
    const contest = this.state.contest;
    let start_time = new Date(contest.start_time);
    let end_time = new Date(contest.end_time);
    if (isNaN(start_time) || isNaN(end_time)) {
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
    this.componentDidUpdate();
  }
  componentDidUpdate(_prevProps, _prevState) {
    if (this.props.contest !== this.state.contest) {
      const {contest} = this.props;
      this.setState({contest}, () => {
        clearInterval(this.timer);
        this.timer = setInterval(() => this.updateTimeLeftLabel(), 1000);
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const {contest} = this.state;
    let headerComp = <>Loading</>;
    if (this.isParticipant()) headerComp = <>You are Participating</>;
    else if (this.isSpectator()) headerComp = <>You are Spectating</>;
    else headerComp = <>You are Viewing</>;

    return (
      <div className="wrapper-vanilla" id="contest-banner">
        <h4 id="header"> {headerComp} </h4>

        <div className="flex-center-col">
          {contest ? (
            <>
              <h4 className="m-2" id="contest-name">
                {`${contest.name}`}
              </h4>
              <sup className="pb-1">
                {`Contest Type: ${contest.format_name}`}
              </sup>
              <hr className="divisor" />
              <span id="contest-time">{`${this.state.time_label}`}</span>
            </>
          ) : (
            <>
              <SpinLoader margin="20px" />
            </>
          )}
        </div>
      </div>
    );
  }
}
