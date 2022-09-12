import React from "react";
import ReactPaginate from "react-paginate";
import {Navigate, Link} from "react-router-dom";
import {Button, Table} from "react-bootstrap";

/* icons */
import {
  AiOutlineForm,
  AiOutlineArrowRight,
  AiOutlinePlusCircle,
} from "react-icons/ai";

/* my imports */
import {SpinLoader, ErrorBox} from "components";
import judgeApi from "api/judge";
import {setTitle} from "helpers/setTitle";

import "./List.scss";
import "styles/ClassicPagination.scss";

class JudgeListItem extends React.Component {
  render() {
    const {id, name, is_blocked, online, start_time, ping, load} = this.props;
    const {selectChk, onSelectChkChange} = this.props;

    return (
      <tr>
        <td className="text-truncate" style={{maxWidth: "40px"}}>
          <Link to={`/admin/judge/${id}`}>{id}</Link>
        </td>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          <Link to={`/admin/judge/${id}`}>{name}</Link>
        </td>
        <td> {online ? "Yes" : "No"} </td>
        <td> {is_blocked ? "Yes" : "No"} </td>
        <td className="text-truncate">
          {new Date(start_time).toLocaleString()}
        </td>
        <td>{ping ? `${(ping * 1000).toFixed(2)}ms` : "N/A"}</td>
        <td>{load || "N/A"}</td>
        <td>
          <input
            type="checkbox"
            value={selectChk}
            onChange={() => onSelectChkChange()}
          />
        </td>
      </tr>
    );
  }
}

class AdminJudgeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      judges: [],
      selectChk: [],
      currPage: 0,
      pageCount: 1,
      loaded: false,
      errors: null,

      submitting: false,
    };
    setTitle("Admin | Judges");
  }

  selectChkChangeHandler(idx) {
    const {selectChk} = this.state;
    if (idx >= selectChk.length) console.log("Invalid delete tick position");
    else {
      const val = selectChk[idx];
      this.setState({
        selectChk: selectChk
          .slice(0, idx)
          .concat(!val, selectChk.slice(idx + 1)),
      });
    }
  }

  callApi(params) {
    this.setState({loaded: false, errors: null});

    judgeApi
      .getJudges({page: params.page + 1})
      .then(res => {
        this.setState({
          judges: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,

          selectChk: Array(res.data.results.length).fill(false),
          loaded: true,
        });
      })
      .catch(() => {
        this.setState({
          loaded: true,
          errors: ["Cannot fetch judges. Please retry again."],
        });
      });
  }

  componentDidMount() {
    this.callApi({page: this.state.currPage});
  }

  handlePageClick = event => {
    this.callApi({page: event.selected});
  };

  handleDeleteSelect(e) {
    e.preventDefault();

    let ids = [];
    this.state.selectChk.forEach((v, i) => {
      if (v) ids.push(this.state.judges[i].id);
    });

    if (ids.length === 0) {
      alert("Không có Judge nào đang được chọn.");
      return;
    }

    // TODO: Write a bulk delete API for submissions
    const conf = window.confirm("Xóa các Judge " + JSON.stringify(ids) + "?");
    if (conf) {
      let reqs = [];
      ids.forEach(id => {
        reqs.push(judgeApi.adminDeleteJudge({id}));
      });

      Promise.all(reqs)
        .then(() => {
          this.callApi({page: this.state.currPage});
        })
        .catch(err => {
          let msg = "Không thể xóa các Judge này.";
          if (err.response) {
            if (err.response.status === 405)
              msg += " Phương thức chưa được implemented.";
            if (err.response.status === 404)
              msg =
                "Không tìm thấy một trong số Judge được chọn. Có lẽ chúng đã bị xóa?";
            if ([403, 401].includes(err.response.status))
              msg += " Không có quyền cho thao tác này.";
          }
          this.setState({errors: {errors: msg}});
        });
    }
  }

  render() {
    if (this.state.redirectUrl)
      return <Navigate to={`${this.state.redirectUrl}`} />;

    const {submitting} = this.state;

    return (
      <div className="admin admin-judges wrapper-vanilla">
        {/* Options for Admins: Create New,.... */}
        <div className="admin-options">
          <div className="border d-inline-flex p-1">
            <Button
              size="sm"
              variant="dark"
              className="btn-svg"
              disabled={submitting}
              onClick={() => this.setState({redirectUrl: "new"})}
            >
              <AiOutlinePlusCircle />
              <span className="d-none d-md-inline-flex">Add (Form)</span>
              <span className="d-inline-flex d-md-none">
                <AiOutlineArrowRight />
                <AiOutlineForm />
              </span>
            </Button>
          </div>
        </div>

        {/* Place for displaying information about admin actions  */}
        <div className="admin-note text-center mb-1">
          {submitting && (
            <span className="loading_3dot">Đang xử lý yêu cầu</span>
          )}
        </div>

        {/* Problem List */}
        <div className="admin-table judge-table">
          <h4>Judge List</h4>
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
                <th style={{minWidth: "20%", maxWidth: "20%"}}>Name</th>
                <th style={{width: "12%"}}>Online</th>
                <th style={{width: "10%"}}>Is Blocked?</th>
                <th style={{width: "10%"}}>Start Time</th>
                <th style={{width: "20%"}}>Ping</th>
                <th style={{width: "20%"}}>Load</th>
                <th style={{width: "8%"}}>
                  <Link to="#" onClick={e => this.handleDeleteSelect(e)}>
                    Delete
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.state.loaded === false && (
                <tr>
                  <td colSpan="99">
                    <SpinLoader margin="10px" />
                  </td>
                </tr>
              )}
              {this.state.loaded === true && this.state.count > 0 ? (
                this.state.judges.map((judge, idx) => (
                  <JudgeListItem
                    key={`judge-${judge.id}`}
                    rowidx={idx}
                    {...judge}
                    selectChk={this.state.selectChk[idx]}
                    onSelectChkChange={() => this.selectChkChangeHandler(idx)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={99}>
                    <em>No Judges at the moment.</em>
                  </td>
                </tr>
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
    );
  }
}

export default AdminJudgeList;
