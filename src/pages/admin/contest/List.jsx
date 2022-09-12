import React from "react";
import ReactPaginate from "react-paginate";

import {Link, Navigate} from "react-router-dom";
import {Button, Table} from "react-bootstrap";

import {
  AiOutlinePlusCircle,
  AiOutlineArrowRight,
  AiOutlineForm,
} from "react-icons/ai";

import {SpinLoader, ErrorBox} from "components";
import Filter from "./Filter";
import contestAPI from "api/contest";

import {setTitle} from "helpers/setTitle";
import {getYearMonthDate, getHourMinuteSecond} from "helpers/dateFormatter";

import "./List.scss";
import "styles/ClassicPagination.scss";
import {qmClarify} from "helpers/components";

const CLASSNAME = "Contest";

export const INITIAL_FILTER = {
  search: "",
  is_visible: "",
  is_private_contest: "",
  enable_frozen: "",
  format_name: "",
  contest_format: "",
  ordering: "-end_time",
};

class ContestListItem extends React.Component {
  formatDateTime(date) {
    const d = new Date(date);
    return (
      <div className="flex-center-col">
        <div style={{fontSize: "10px"}}>{getYearMonthDate(d)}</div>
        <div style={{fontSize: "12px"}}>{getHourMinuteSecond(d)}</div>
      </div>
    );
  }

  render() {
    const {
      ckey,
      name,
      start_time,
      end_time,
      published,
      is_visible,
      is_private,
      is_organization_private,
      is_rated,
      format_name,
    } = this.props;
    const {selectChk, onSelectChkChange} = this.props;

    const access_label = !published
      ? "PRIVATE"
      : is_visible
      ? is_private || is_organization_private
        ? "ALL/LIMITED"
        : "ALL"
      : is_private || is_organization_private
      ? "LIMITED"
      : "PRIVATE";

    return (
      <tr>
        <td className="text-truncate">
          <Link to={`/admin/contest/${ckey}`}>{ckey}</Link>
        </td>
        <td className="text-truncate" style={{maxWidth: "150px"}}>
          <Link to={`/admin/contest/${ckey}`}>{name}</Link>
        </td>
        <td className="text-truncate">{this.formatDateTime(start_time)}</td>
        <td className="text-truncate">{this.formatDateTime(end_time)}</td>
        <td>{access_label}</td>
        <td>{is_rated ? "Yes" : "No"}</td>
        <td>{format_name}</td>
        {/* <td className="text-truncate" style={{maxWidth: "200px"}}>
          {(new Date(date)).toLocaleString()}
        </td> */}
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

class AdminContestList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchData: {...INITIAL_FILTER},

      contests: [],
      selectChk: [],
      currPage: 0,
      pageCount: 1,
      loaded: false,
      errors: null,

      redirectUrl: null,
    };
    setTitle("Admin | Contests");
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

    contestAPI
      .getAllContests({page: params.page + 1, ...this.state.searchData})
      .then(res => {
        this.setState({
          contests: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,

          selectChk: Array(res.data.results.length).fill(false),
          loaded: true,
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          loaded: true,
          errors: ["Cannot fetch contests. Please retry again."],
        });
      });
  }

  componentDidMount() {
    this.callApi({page: this.state.currPage});
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchData !== this.state.searchData) {
      this.callApi({page: this.state.currPage});
    }
  }

  handlePageClick = event => {
    this.callApi({page: event.selected});
  };

  handleDeleteSelect(e) {
    e.preventDefault();

    let ids = [];
    this.state.selectChk.forEach((v, i) => {
      if (v) ids.push(this.state.contests[i].key);
    });

    if (ids.length === 0) {
      alert(`Không có ${CLASSNAME} nào đang được chọn.`);
      return;
    }

    // TODO: Write a bulk delete API for submissions
    const conf = window.confirm(
      `Xóa các ${CLASSNAME} ` + JSON.stringify(ids) + "?"
    );
    if (conf) {
      let reqs = [];
      ids.forEach(k => {
        reqs.push(contestAPI.deleteContest({key: k}));
      });

      Promise.all(reqs)
        .then(res => {
          console.log(res);
          this.callApi({page: this.state.currPage});
        })
        .catch(err => {
          let msg = `Không thể xóa các ${CLASSNAME} này.`;
          if (err.response) {
            if (err.response.status === 405)
              msg += " Phương thức chưa được implemented.";
            if (err.response.status === 404)
              msg = `Không tìm thấy một trong số ${CLASSNAME} được chọn. Có lẽ chúng đã bị xóa?`;
            if ([403, 401].includes(err.response.status))
              msg = "Không có quyền cho thao tác này.";
          }
          this.setState({errors: [msg]});
        });
    }
  }

  render() {
    if (this.state.redirectUrl)
      return <Navigate to={`${this.state.redirectUrl}`} />;

    const {submitting} = this.state;

    return (
      <div className="admin admin-contests">
        {/* Options for Admins: Create New,.... */}
        <div className="admin-options wrapper-vanilla m-0 mb-1">
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
          {submitting && (
            <div className="flex-center">
              <div className="admin-note text-center mb-1">
                <span className="loading_3dot">Đang xử lý yêu cầu</span>
              </div>
            </div>
          )}
        </div>

        {/* Problem List */}
        <div className="admin-table contest-table wrapper-vanilla">
          <Filter
            searchData={this.state.searchData}
            setSearchData={d => this.setState({searchData: d})}
          />

          <h4>Contest List</h4>
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
                <th style={{maxWidth: "10%"}}>Key</th>
                <th style={{minWidth: "20%", maxWidth: "20%"}}>Name</th>
                <th style={{minWidth: "15%"}}>Start</th>
                <th style={{minWidth: "15%"}}>End</th>
                <th>
                  Quyền View/Quyền Join
                  {qmClarify(
                    "Những User có quyền Edit sẽ luôn thấy được tất cả dữ liệu của contest. Phía bên dưới mô tả quyền View (không đóng băng) cho những User còn lại:\n" +
                      "* ALL: Tất cả User có thể Thấy và Đăng ký trước giờ, có thể Làm bài và Xem contest khi nó diễn ra.\n" +
                      "* ALL/LIMITED: Tất cả User có thể Thấy và Xem contest nhưng chỉ một số cá nhân/tổ chức mới có thể Đăng ký và Làm bài. Nếu có chia sẻ cho tổ chức, Admin tổ chức có thể chỉnh sửa contest.\n" +
                      "* LIMITED: Chỉ một số cá nhân/tổ chức mới có thể Thấy, Xem, Đăng ký và Làm bài. Nếu có chia sẻ cho tổ chức, Admin tổ chức có thể chỉnh sửa contest.\n" +
                      "* PRIVATE: Không có ai ngoài 3 nhóm đặc quyền có thể thấy được contest."
                  )}
                </th>
                <th>
                  Rated
                  {qmClarify(
                    "Contest có cho phép Tính điểm xếp hạng sau khi diễn ra hay không."
                  )}
                </th>
                <th>
                  Format
                  {qmClarify(
                    "Định dạng Contest, chỉ thay đổi cách tính penalty, thứ hạng và cách show bảng điểm, không thay đổi cách chấm mỗi bài.\n" +
                      "* ICPC: Mỗi Problem, tất cả bài nộp trước bài nộp AC (full điểm) đầu tiên sẽ được tính vào penalty. Thứ hạng quyết định bởi: Điểm -> (Tổng Penalty + Tổng thời điểm nộp).\n" +
                      "* IOI: Mỗi Problem, lấy bài nộp có điểm lớn nhất, có nhiều thì lấy bài nộp sớm nhất. Thứ hạng quyết định bởi: Điểm -> (Tổng Thời điểm nộp)"
                  )}
                </th>
                <th>
                  <Link to="#" onClick={e => this.handleDeleteSelect(e)}>
                    Delete
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.state.loaded === false && (
                <tr>
                  <td colSpan="9">
                    <SpinLoader margin="10px" />
                  </td>
                </tr>
              )}
              {this.state.loaded === true &&
                (this.state.count > 0 ? (
                  this.state.contests.map((sub, idx) => (
                    <ContestListItem
                      key={`cont-${sub.id}`}
                      rowidx={idx}
                      ckey={sub.key}
                      {...sub}
                      selectChk={this.state.selectChk[idx]}
                      onSelectChkChange={() => this.selectChkChangeHandler(idx)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="99">
                      <em>No Contest can be found.</em>
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

export default AdminContestList;
