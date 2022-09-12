import React from "react";
import {connect} from "react-redux";

import ReactPaginate from "react-paginate";

import {Link} from "react-router-dom";
import {Table, Button} from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
// import { FaPaperPlane } from 'react-icons/fa';

import {SpinLoader, ErrorBox} from "components";

import problemApi from "api/problem";
import contestApi from "api/contest";

import {setTitle} from "helpers/setTitle";
import {withParams} from "helpers/react-router";

// Contexts
import ContestContext from "context/ContestContext";

// Assets
import {FaGlobe, FaUniversity, FaRegEyeSlash} from "react-icons/fa";
import {ImBook} from "react-icons/im";
import {BsPersonFill} from "react-icons/bs";

// Helpers
import {parseTime, parseMem} from "helpers/textFormatter";

// Styles
import "./List.scss";
import "styles/ClassicPagination.scss";

class ProblemListItem extends React.Component {
  render() {
    const {
      solved,
      attempted,
      shortname,
      title,
      solved_count,
      attempted_count,
      points,
      partial,
      time_limit,
      memory_limit,
      is_public,
      is_organization_private,
    } = this.props;
    const {contest, label} = this.props;

    const link = contest ? `${shortname}` : `/problem/${shortname}`;
    const rate =
      attempted_count === 0
        ? "?"
        : `${((solved_count * 100.0) / attempted_count).toFixed(2)}%`;

    const mode = !is_public
      ? "Private"
      : is_organization_private
      ? "Organization"
      : "Public";

    let msg, color;
    if (solved) {
      msg = "Solved!";
      color = "green";
    } else if (attempted !== null) {
      msg = `Not solved. Best: ${attempted} pts.`;
      color = "red";
    } else {
      msg = `Unattempted.`;
      color = "gray";
    }

    return (
      <tr>
        <td style={{width: "60px"}}>
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip>
                <div style={{fontSize: "14px"}} className="">
                  {msg}
                </div>
              </Tooltip>
            }
          >
            <Button className="btn-svg" variant="light">
              <ImBook size={30} style={{verticalAlign: "middle", color}} />
            </Button>
          </OverlayTrigger>
        </td>
        <td>
          <div className="d-flex">
            <div className="d-flex title-section" style={{flexGrow: 1}}>
              {contest ? (
                <>
                  <div className="problem-code">
                    <Link to={link}>
                      {label ? `${label}. ` : ""}
                      {title}
                    </Link>
                  </div>
                  <div className="problem-title">
                    <span>{`${parseTime(time_limit)} | ${parseMem(
                      memory_limit
                    )}`}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="problem-code">
                    <Link to={link}>{shortname}</Link>
                    <span className="visibility-tag text-secondary">
                      {mode === "Public" && <FaGlobe />}
                      {mode === "Organization" && <FaUniversity />}
                      {mode === "Private" && <FaRegEyeSlash />}
                      <span
                        style={{fontSize: "12px"}}
                        className="ml-1 d-none d-md-flex"
                      >
                        {mode}
                      </span>
                    </span>
                  </div>
                  <div className="problem-title">
                    <Link to={link}>{title}</Link>
                  </div>
                </>
              )}
            </div>

            <div className="solve-section text-right">
              <div className="flex-center ac-count">
                {`AC: ${solved_count}`}
                <BsPersonFill />
              </div>
              <div className="ac-rate">{rate}</div>
            </div>
          </div>
        </td>

        <td>
          <span className="mr-1">{points}</span>
          <span>{partial ? "" : "(icpc)"}</span>
        </td>
      </tr>
    );
  }
}

class ProblemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      problems: [],

      currPage: 0,
      pageCount: 1,

      loaded: false,
      errors: null,
    };
    setTitle("Problems");
  }

  callApi(params = {page: 0}) {
    this.setState({loaded: false, errors: null});

    let endpoint,
      data,
      prms = {};

    if (this.state.contest) {
      endpoint = contestApi.getContestProblems;
      data = {key: this.state.contest.key};
      prms = {page: params.page + 1, contest: this.state.contest.key, ...prms};
    } else {
      endpoint = problemApi.getProblems;
      data = {};
      prms = {page: params.page + 1, ...prms};
      if (this.props.selectedOrg.slug) {
        prms.org = this.props.selectedOrg.slug;
      }
    }

    endpoint({...data, params: prms})
      .then(res => {
        this.setState({
          problems: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,
          loaded: true,
        });
      })
      .catch(err => {
        // console.log(err.response.data);
        this.setState({
          loaded: true,
          errors: err.response.data || "Cannot fetch problems at the moment.",
        });
      });
  }

  componentDidMount() {
    const contest = this.context.contest;
    if (contest) {
      setTitle(`${contest.name} | Problems`);
      this.setState({contest}, () => this.callApi({page: this.state.currPage}));
    } else this.callApi({page: this.state.currPage});
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
    const {loaded, errors, count} = this.state;

    return (
      <div className="problem-table wrapper-vanilla">
        <div className="problem-count-text">
          <span className="count-text">
            <span className="number">{count || "?"}</span> problem(s)
          </span>
        </div>
        <h4 className="d-flex justify-content-center align-items-center ">
          Problem Set
        </h4>

        <ErrorBox errors={this.state.errors} />
        <Table responsive hover size="sm" striped bordered className="rounded">
          <thead>
            <tr>
              <th></th>
              <th>Problem</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {!loaded && (
              <tr>
                <td colSpan="6">
                  <SpinLoader margin="10px" />
                </td>
              </tr>
            )}
            {loaded && !errors && (
              <>
                {this.state.count > 0 && (
                  <>
                    {this.state.problems.map((prob, idx) => (
                      <ProblemListItem
                        key={`prob-${prob.shortname}`}
                        rowid={idx}
                        {...prob}
                      />
                    ))}
                  </>
                )}

                {this.state.count === 0 && (
                  <>
                    <tr>
                      <td colSpan="6">
                        <em>No problem is available yet.</em>
                      </td>
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
        </Table>
        {this.state.loaded === false ? (
          <SpinLoader margin="0" />
        ) : (
          <>
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
          </>
        )}
      </div>
    );
  }
}
ProblemList.contextType = ContestContext;

let wrapped = ProblemList;
wrapped = withParams(wrapped);

const mapStateToProps = state => {
  return {
    user: state.user.user,
    selectedOrg: state.myOrg.selectedOrg,
  };
};
wrapped = connect(mapStateToProps, null)(wrapped);

export default wrapped;
