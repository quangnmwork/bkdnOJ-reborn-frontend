import React from "react";
import ReactPaginate from "react-paginate";
// import { Link } from 'react-router-dom';
import {Table} from "react-bootstrap";
import {FcOk, FcHighPriority} from "react-icons/fc";

import {SpinLoader, ErrorBox} from "components";
import judgeAPI from "api/judge";
import {setTitle} from "helpers/setTitle";

import "./JudgeStatuses.scss";
import "styles/ClassicPagination.scss";

class JudgeStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startTime: this.props.startTime,
      upTime: "N/A",
    };
  }

  componentDidMount() {
    this.updateUptime();
    if (this.props && this.props.online)
      this.timer = setInterval(() => this.updateUptime(), 3000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  updateUptime() {
    if (!this.state.startTime) return "N/A";
    if (!this.props.online || this.props.is_blocked) return "N/A";
    if (!new Date(this.state.startTime).getTime()) return "N/A";

    let diffMs = new Date() - new Date(this.state.startTime);
    let diffS = Math.floor(diffMs / 1000);
    let diffM = Math.floor(diffS / 60);
    diffS %= 60;
    let diffH = Math.floor(diffM / 60);
    diffM %= 60;
    let diffD = Math.floor(diffH / 24);
    diffH %= 24;
    const msg =
      (diffD > 0 ? `${diffD}d, ` : "") +
      (diffH > 0 ? `${diffH}h, ` : "") +
      (diffM > 0 ? `${diffM}m, ` : "") +
      (diffS > 0 ? `${diffS}s, ` : "");
    if (msg.length < 3) return "N/A";

    return this.setState({upTime: msg.substring(0, msg.length - 2)});
  }

  render() {
    const {id, name, is_blocked, online, ping, load} = this.props;
    return (
      <>
        <tr>
          <td className="text-truncate" style={{maxWidth: "100px"}}>
            {id}
          </td>
          <td className="text-truncate" style={{maxWidth: "300px"}}>
            {name}
          </td>
          <td>
            <div className="icons">
              {online && !is_blocked ? (
                <FcOk size={18} />
              ) : (
                <FcHighPriority size={18} />
              )}
            </div>
          </td>
          <td style={{minWidth: "100px"}}>{this.state.upTime}</td>
          <td>{!isNaN(load) ? (+load).toFixed(2) : "N/A"}</td>
          <td>{!isNaN(ping) ? `${(+load * 1000).toFixed(2)} ms` : "N/A"}</td>
        </tr>
      </>
    );
  }
}

class JudgeStatuses extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      judges: [],
      currPage: 0,
      pageCount: 1,
      loaded: false,
      errors: null,
    };
    setTitle("Judges");
  }

  callApi(params) {
    this.setState({loaded: false, errors: null});

    judgeAPI
      .getJudges({page: params.page + 1})
      .then(res => {
        this.setState({
          judges: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,
          loaded: true,
        });
      })
      .catch(() => {
        this.setState({
          loaded: true,
          errors: "Cannot fetch judges at the moment. Please retry again.",
        });
      });
  }

  componentDidMount() {
    this.callApi({page: this.state.currPage});
  }

  handlePageClick = event => {
    this.callApi({page: event.selected});
  };

  render() {
    let avaiRuntime = [];
    this.state.judges.map(item => {
      avaiRuntime = avaiRuntime.concat(item.runtimes);
      return null;
    });
    avaiRuntime = avaiRuntime.filter(
      (val, ind, self) => self.indexOf(val) === ind
    );

    return (
      <>
        <div className="judge-table wrapper-vanilla">
          <h4>Judge Status</h4>
          <ErrorBox errors={this.state.errors} />
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
                <th>#</th>
                <th>Name</th>
                <th>Available?</th>
                <th style={{minWidth: "100px"}}>Up Time</th>
                <th>Load</th>
                <th>Ping</th>
              </tr>
            </thead>
            <tbody>
              {this.state.loaded === false ? (
                <tr>
                  <td colSpan="7">
                    <SpinLoader margin="10px" />
                  </td>
                </tr>
              ) : (
                this.state.judges.map((item, idx) => (
                  <JudgeStatus
                    key={`judge-${item.id}`}
                    rowid={idx}
                    startTime={item.start_time}
                    {...item}
                  />
                ))
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
          <div className="judge-table text-left">
            <h4>Available Runtime</h4>
            <ul className="m-1">
              {avaiRuntime.map((runtime, idx) => (
                <li key={idx}>{runtime}</li>
              ))}
            </ul>
          </div>
        </div>
      </>
    );
  }
}

export default JudgeStatuses;
