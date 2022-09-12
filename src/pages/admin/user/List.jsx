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
import userAPI from "api/user";
import {setTitle} from "helpers/setTitle";

import "./List.scss";
import "styles/ClassicPagination.scss";
import {qmClarify} from "helpers/components";

class UserItem extends React.Component {
  render() {
    const {
      id,
      username,
      email,
      is_active,
      is_staff,
      is_superuser,
      date_joined,
    } = this.props;
    const {selectChk, onSelectChkChange} = this.props;

    return (
      <tr>
        <td className="text-truncate" style={{maxWidth: "20px"}}>
          <Link to={`/admin/user/${id}`}>{id}</Link>
        </td>
        <td className="text-truncate" style={{maxWidth: "40px"}}>
          <Link to={`/admin/user/${id}`}>{username}</Link>
        </td>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          {email}
        </td>
        <td>{is_active ? "Yes" : "No"}</td>
        <td>{is_staff ? "Yes" : "No"}</td>
        <td>{is_superuser ? "Yes" : "No"}</td>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          {new Date(date_joined).toLocaleString()}
        </td>
        {/* <td className="text-truncate" style={{maxWidth: "100px"}}>
          {last_login ? new Date(last_login).toLocaleString() : "N/A"}
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

class AdminUserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      objects: [],
      selectChk: [],

      currPage: 0,
      pageCount: 1,
      loaded: false,
      errors: null,

      submitting: false,
    };
    setTitle("Admin | Users");
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

    userAPI
      .getUsers({params: {page: params.page + 1}})
      .then(res => {
        this.setState({
          objects: res.data.results,
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
          errors: ["Cannot fetch Users. Please retry again."],
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
    this.setState({errors: null});

    let ids = [];
    let usernames = [];
    this.state.selectChk.forEach((v, i) => {
      if (v) {
        ids.push(this.state.objects[i].id);
        usernames.push(this.state.objects[i].username);
      }
    });

    if (ids.length === 0) {
      alert("Không có User nào đang được chọn.");
      return;
    }

    // TODO: Write a bulk delete API for submissions
    const conf = window.confirm(
      "Xóa các User " + JSON.stringify(usernames) + "?"
    );
    if (conf) {
      let reqs = [];
      ids.forEach(id => {
        reqs.push(userAPI.adminDeleteUser({id}));
      });

      Promise.all(reqs)
        .then(() => {
          this.callApi({page: this.state.currPage});
        })
        .catch(err => {
          let msg = "Không thể xóa các User này.";
          if (err.response) {
            if (err.response.status === 405)
              msg += " Phương thức chưa được hỗ trợ.";
            if (err.response.status === 404)
              msg =
                "Không tìm thấy một trong số User được chọn. Có lẽ họ đã bị xóa?";
            if ([403, 401].includes(err.response.status))
              msg += " Bạn không có quyền cho thao tác này.";
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
      <div className="admin admin-users">
        {/* Options for Admins: Create New,.... */}
        <div className="admin-options m-0 wrapper-vanilla">
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
        <div className="admin-table user-table wrapper-vanilla">
          <h4>User List</h4>
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
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>
                  Active
                  {qmClarify(
                    "Tài khoản không Active sẽ không được phép đăng nhập."
                  )}
                </th>
                <th>
                  Staff
                  {qmClarify(
                    "Tài khoản là Staff sẽ truy cập được vào trang Admin."
                  )}
                </th>
                <th>
                  Superuser
                  {qmClarify(
                    "Tài khoản là Superuser sẽ có toàn quyền trên hệ thống."
                  )}
                </th>
                <th>Joined</th>
                {/* <th >Last seen</th> */}
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
              {this.state.loaded === true ? (
                this.state.objects.map((obj, idx) => (
                  <UserItem
                    key={`user-${obj.username}`}
                    rowidx={idx}
                    {...obj}
                    selectChk={this.state.selectChk[idx]}
                    onSelectChkChange={() => this.selectChkChangeHandler(idx)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={99}>
                    <em>No User can be found.</em>
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

export default AdminUserList;
