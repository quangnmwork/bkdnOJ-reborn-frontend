import React from "react";
import ReactPaginate from "react-paginate";
import {Navigate, Link} from "react-router-dom";
import {Button, Table, Row, Col, Form} from "react-bootstrap";

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
import {toast} from "react-toastify";
import {FaFilter, FaTimes} from "react-icons/fa";
import {FcOk, FcHighPriority} from "react-icons/fc";

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
        <td>
          <Link to={`/admin/user/${username}`}>{id}</Link>
        </td>
        <td className="text-truncate" style={{maxWidth: "40px"}}>
          <Link to={`/admin/user/${username}`}>{username}</Link>
        </td>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          {email}
        </td>
        <td>{is_active ? <FcOk /> : <FcHighPriority />}</td>
        <td>{is_staff ? <FcOk /> : <FcHighPriority />}</td>
        <td>{is_superuser ? <FcOk /> : <FcHighPriority />}</td>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          {new Date(date_joined).toLocaleString()}
        </td>
        {/* <td className="text-truncate" style={{maxWidth: "100px"}}>
          {last_login ? new Date(last_login).toLocaleString() : "N/A"}
        </td> */}

        <td>
          <input
            type="checkbox"
            checked={selectChk}
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

      filters: {},
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
    this.setState({loaded: false, errors: null, selectChkAll: false});
    let query = {params: {page: params.page + 1, ...this.state.filters}};

    userAPI
      .getUsers({...query})
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
  refetch() {
    this.callApi({page: this.state.currPage});
  }

  componentDidMount() {
    this.callApi({page: this.state.currPage});
  }

  handlePageClick = event => {
    this.callApi({page: event.selected});
  };

  handleActOnUsers(action) {
    this.setState({errors: null});

    let usernames = [];
    this.state.selectChk.forEach((v, i) => {
      if (v) usernames.push(this.state.objects[i].username);
    });

    if (usernames.length === 0) {
      alert("Không có User nào đang được chọn.");
      return;
    }

    // TODO: Write a bulk delete API for submissions
    const conf = window.confirm(
      `${action} các user ` + JSON.stringify(usernames) + " này?"
    );
    if (!conf) return false;

    const payload = {
      action: action,
      data: {users: usernames},
    };
    const apiCall = userAPI.adminActOnUsers(payload);
    const parent = this;
    toast.promise(apiCall, {
      pending: {
        render() {
          return "Processing...";
        },
      },
      success: {
        render() {
          parent.refetch();
          return "Success.";
        },
      },
      error: {
        render({data}) {
          parent.setState({errors: data.response.data});
          return "Update Failed.";
        },
      },
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.filters !== this.state.filters) this.refetch();
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

        {/* User List */}
        <div className="admin-table user-table wrapper-vanilla">
          <UserFilter
            filters={this.state.filters}
            setFilters={filters => this.setState({filters})}
            disabled={!this.state.loaded}
          />

          <div className="border m-1 d-flex align-items-center justify-content-start">
            <strong className="mr-2">
              Actions
              {qmClarify(
                "Thực hiện actions lên các user được chọn. Chọn các user bằng ô " +
                  "checkbox phía bên phải mỗi trường."
              )}
            </strong>
            <span className="ml-1 mr-1">
              <Button
                size="sm"
                variant="success"
                onClick={() => this.handleActOnUsers("activate")}
              >
                Activate
              </Button>
              <Button
                size="sm"
                variant="warning"
                onClick={() => this.handleActOnUsers("deactivate")}
              >
                Deactivate
              </Button>
            </span>
            <span className="ml-1 mr-1">
              <Button
                size="sm"
                variant="danger"
                onClick={() => this.handleActOnUsers("delete")}
              >
                Delete
              </Button>
            </span>
          </div>

          <h4>User List {this.state.loaded && `(${this.state.count})`}</h4>
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
                    "Tài khoản không Active sẽ không được phép đăng nhập và không được thao tác với hệ thống."
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
                  <input
                    type="checkbox"
                    value={this.state.selectChkAll}
                    onChange={e =>
                      this.setState({
                        selectChkAll: e.target.checked,
                        selectChk: Array(this.state.objects.length).fill(
                          e.target.checked
                        ),
                      })
                    }
                  />
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
              {this.state.loaded === true &&
                (this.state.objects.length > 0 ? (
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

class UserFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {...this.props.filters},
    };
  }

  changeFilters(changes) {
    const {filters} = this.state;
    this.setState({
      filters: {
        ...filters,
        ...changes,
      },
    });
  }

  setFilters() {
    let filt = {...this.state.filters};
    if (!this.state.filterByStatusChk) {
      delete filt["is_active"];
      delete filt["is_staff"];
      delete filt["is_superuser"];
    } else {
      filt["is_active"] = !!filt["is_active"];
      filt["is_staff"] = !!filt["is_staff"];
      filt["is_superuser"] = !!filt["is_superuser"];
    }
    if (!this.state.filterByJoinDateChk) {
      delete filt["date_joined_before"];
      delete filt["date_joined_after"];
    } else {
      ["date_joined_before", "date_joined_after"].forEach(key => {
        if (filt[key]) filt[key] = new Date(filt[key]).toISOString();
      });
    }

    this.props.setFilters(filt);
  }

  resetFilters() {
    this.setState({
      filters: {},
      filterByStatusChk: false,
      filterByJoinDateChk: false,
    });
    this.props.setFilters({});
  }

  getTime(key) {
    const data = this.state.filters;
    if (data && data[key]) {
      let time = new Date(data[key]);
      time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
      return time.toISOString().slice(0, 19);
    }
    return "";
  }

  render() {
    const {filters} = this.state;
    const {disabled} = this.props;

    return (
      <div className="user-table-options m-0 p-1 border w-100 text-left d-block">
        <Row className="m-0 p-0">
          <Form.Label column="sm" lg={1}>
            <strong>Search</strong>
          </Form.Label>
          <Col className="m-0 p-0">
            <Form.Control
              size="sm"
              type="text"
              placeholder="Search username (prefix), first name, last name (full text)"
              value={filters.search || ""}
              onChange={e => this.changeFilters({search: e.target.value})}
            />
          </Col>
        </Row>
        <Row className="m-0 mt-1 p-0">
          <Col className="">
            <label className="mr-2">
              <input
                type="checkbox"
                id="user-filter-chk-active"
                checked={this.state.filterByStatusChk}
                onChange={e =>
                  this.setState({filterByStatusChk: e.target.checked})
                }
              />
              <span className="ml-1">
                <strong>Filter by Status?</strong>
              </span>
            </label>
            <label className="ml-2">
              <input
                type="checkbox"
                id="user-filter-chk-active"
                disabled={!this.state.filterByStatusChk}
                checked={filters.is_active}
                onChange={e =>
                  this.changeFilters({is_active: e.target.checked})
                }
              />
              <span className="ml-1">Active</span>
            </label>
            <label className="ml-2">
              <input
                type="checkbox"
                id="user-filter-chk-staff"
                disabled={!this.state.filterByStatusChk}
                checked={filters.is_staff}
                onChange={e => this.changeFilters({is_staff: e.target.checked})}
              />
              <span className="ml-1">Staff</span>
            </label>
            <label className="ml-2">
              <input
                type="checkbox"
                id="user-filter-chk-staff"
                disabled={!this.state.filterByStatusChk}
                checked={filters.is_superuser}
                onChange={e =>
                  this.changeFilters({is_superuser: e.target.checked})
                }
              />
              <span className="ml-1">Superuser</span>
            </label>
          </Col>
        </Row>
        <Row className="m-0 p-0">
          <Col className="">
            <label className="">
              <input
                type="checkbox"
                id="user-filter-chk-active"
                checked={this.state.filterByJoinDateChk}
                onChange={e =>
                  this.setState({filterByJoinDateChk: e.target.checked})
                }
              />
              <span className="ml-1">
                <strong>Filter by Join Date?</strong>
              </span>
            </label>
            <Col>
              <label
                id="date-after-lbl"
                className="m-0 w-100"
                htmlFor="date-after"
              >
                Joined After
              </label>
              <input
                className="w-100 m-0"
                type="datetime-local"
                id="joined-after"
                disabled={!this.state.filterByJoinDateChk}
                step="1"
                value={this.getTime("date_joined_after")}
                onChange={e =>
                  this.changeFilters({date_joined_after: e.target.value})
                }
              ></input>
            </Col>
            <Col>
              <label
                id="date-before-lbl"
                className="m-0 w-100"
                htmlFor="date-before"
              >
                Joined Before
              </label>
              <input
                className="w-100 m-0"
                type="datetime-local"
                id="joined-before"
                disabled={!this.state.filterByJoinDateChk}
                step="1"
                value={this.getTime("date_joined_before")}
                onChange={e =>
                  this.changeFilters({date_joined_before: e.target.value})
                }
              ></input>
            </Col>
          </Col>
        </Row>
        <Row>
          <Col className="ml-2 mt-2">
            <label className="">
              <span className="ml-1 mr-2">
                <strong>Order by</strong>
              </span>
              <select
                id="user-filter-chk-active"
                value={this.state.filters.ordering || ""}
                onChange={e => this.changeFilters({ordering: e.target.value})}
              >
                <option value="">--</option>
                <option value="id">ID asc</option>
                <option value="-id">ID desc</option>
                <option value="username">Username asc</option>
                <option value="-username">Username desc</option>
                <option value="date_joined">Date Joined asc</option>
                <option value="-date_joined">Date Joined desc</option>
              </select>
            </label>
          </Col>
        </Row>

        <div className="w-100 mt-2 d-flex flex-row-reverse">
          <Button
            size="sm"
            variant="dark"
            className="ml-1 mr-1 btn-svg"
            disabled={disabled}
            onClick={() => this.setFilters(filters)}
          >
            <FaFilter /> Filter
          </Button>
          <Button
            size="sm"
            variant="light"
            className="ml-1 mr-1 btn-svg"
            onClick={() => this.resetFilters()}
          >
            <FaTimes /> Reset
          </Button>
        </div>
      </div>
    );
  }
}

export default AdminUserList;
