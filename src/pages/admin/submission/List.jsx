import React from "react";
import ReactPaginate from "react-paginate";
import {Link} from "react-router-dom";
import {Table} from "react-bootstrap";

import {SpinLoader, ErrorBox} from "components";
import submissionApi from "api/submission";
import {setTitle} from "helpers/setTitle";

import "./List.scss";
import "styles/ClassicPagination.scss";

class SubmissionListItem extends React.Component {
  render() {
    const {id, date, status, result, user, contest_object, problem} =
      this.props;
    const {selectChk, onSelectChkChange} = this.props;

    const verdict = result ? result : status;

    return (
      <tr>
        <td className="text-truncate" style={{maxWidth: "40px"}}>
          <Link to={`/admin/submission/${id}`}>{id}</Link>
        </td>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          <Link to={`/admin/problem/${problem.shortname}`}>
            {problem.title}
          </Link>
        </td>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          {contest_object ? (
            <Link to={`/admin/contest/${contest_object}`}>
              {contest_object}
            </Link>
          ) : (
            "None"
          )}
        </td>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          <Link to={`/admin/user/${user}`}>{user}</Link>
        </td>
        <td>{verdict}</td>
        <td className="text-truncate" style={{maxWidth: "200px"}}>
          {new Date(date).toLocaleString()}
        </td>
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

class AdminSubmissionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submissions: [],
      selectChk: [],
      currPage: 0,
      pageCount: 1,
      loaded: false,
      errors: null,

      selectedZip: null,
      submitting: false,
    };
    setTitle("Admin | Submissions");
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

    submissionApi
      .getSubmissions({page: params.page + 1})
      .then(res => {
        this.setState({
          submissions: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,

          selectChk: Array(res.data.results.length).fill(false),
          loaded: true,
        });
      })
      .catch(err => {
        this.setState({
          loaded: true,
          errors: {
            errors: err.response.data || [
              "Cannot fetch submissions. Please retry again.",
            ],
          },
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
      if (v) ids.push(this.state.submissions[i].id);
    });

    if (ids.length === 0) {
      alert("Không có Submission nào đang được chọn.");
      return;
    }

    // TODO: Write a bulk delete API for submissions
    const conf = window.confirm(
      "Xóa các Submission " + JSON.stringify(ids) + "?"
    );
    if (conf) {
      let reqs = [];
      ids.forEach(id => {
        reqs.push(submissionApi.adminDeleteSubmission({id}));
      });

      Promise.all(reqs)
        .then(res => {
          console.log(res);
          this.callApi({page: this.state.currPage});
        })
        .catch(err => {
          let msg = "Không thể xóa các submission này.";
          if (err.response) {
            if (err.response.status === 405)
              msg += " Phương thức chưa được implemented.";
            if (err.response.status === 404)
              msg =
                "Không tìm thấy một trong số Submission được chọn. Có lẽ chúng đã bị xóa?";
            if ([403, 401].includes(err.response.status))
              msg = "Không có quyền cho thao tác này.";
          }
          this.setState({errors: {errors: msg}});
        });
    }
  }

  render() {
    const {submitting} = this.state;

    return (
      <div className="admin admin-submissions wrapper-vanilla">
        {/* Options for Admins: Create New,.... */}
        <div className="admin-options">
          <sub>No options available yet</sub>
        </div>

        {/* Place for displaying information about admin actions  */}
        <div className="admin-note text-center mb-1">
          {submitting && (
            <span className="loading_3dot">Đang xử lý yêu cầu</span>
          )}
        </div>

        {/* Problem List */}
        <div className="admin-table submission-table">
          <h4>Submission List</h4>
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
                <th style={{maxWidth: "10%"}}>#</th>
                <th style={{minWidth: "20%", maxWidth: "20%"}}>Problem</th>
                <th style={{width: "12%"}}>Contest</th>
                <th style={{width: "10%"}}>Author</th>
                <th style={{width: "10%"}}>Status</th>
                <th style={{width: "20%"}}>When</th>
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
                  <td colSpan="7">
                    <SpinLoader margin="10px" />
                  </td>
                </tr>
              )}
              {this.state.loaded === true &&
                (this.state.count > 0 ? (
                  this.state.submissions.map((sub, idx) => (
                    <SubmissionListItem
                      key={`sub-${sub.id}`}
                      rowidx={idx}
                      {...sub}
                      selectChk={this.state.selectChk[idx]}
                      onSelectChkChange={() => this.selectChkChangeHandler(idx)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="99">
                      <em>No Submission be found.</em>
                    </td>
                  </tr>
                ))}
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

export default AdminSubmissionList;
