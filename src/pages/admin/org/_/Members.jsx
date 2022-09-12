import React from "react";
import {Link} from "react-router-dom";
import {Form, Row, Col, Table, Button, Modal} from "react-bootstrap";
import ReactPaginate from "react-paginate";

import {SpinLoader, ErrorBox} from "components";
import orgAPI from "api/organization";
import "styles/ClassicPagination.scss";
import {toast} from "react-toastify";

const INITIAL_STATE = {
  searchData: {
    search: "",
    ordering: "rating",
  },

  members: [],
  count: 0,
  currPage: 0,
  loaded: false,
  errors: null,

  params: {},
  modalShow: false,
};

class Members extends React.Component {
  constructor(props) {
    super(props);
    this.slug = this.props.slug;
    this.state = {...INITIAL_STATE};
  }

  openModalHandler() {
    this.setState({modalShow: true});
  }
  closeModalHandler() {
    this.setState({modalShow: false});
  }

  resetFetch() {
    this.setState(INITIAL_STATE, () => this.refetch());
  }

  refetch(params = {page: 0}) {
    this.setState({loaded: false, errors: null});
    let prms = {page: params.page + 1, ...this.state.searchData};

    if (this.state.virtual) prms.virtual = this.state.virtual;

    orgAPI
      .getOrgMembers({slug: this.props.slug, params: prms})
      .then(res => {
        this.setState({
          members: res.data.results,
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
          errors: err.response.data || ["Cannot get members."],
        });
      });
  }

  handlePageClick = event => {
    this.refetch({page: event.selected});
  };

  componentDidMount() {
    this.refetch();
  }

  handleDeleteSelect(e) {
    e.preventDefault();
    this.setState({errors: null});

    let toBeRemoved = [];
    this.state.members.forEach((member, idx) => {
      if (this.state.selectChk[idx]) toBeRemoved.push(member.username);
    });
    if (toBeRemoved.length === 0) {
      alert("Không có thành viên nào đang được chọn.");
      return;
    }
    let conf = window.confirm(
      `Xóa những thành viên ${JSON.stringify(toBeRemoved)} khỏi tổ chức?`
    );
    if (!conf) return;
    orgAPI
      .removeOrgMembers({slug: this.slug, data: {members: toBeRemoved}})
      .then(() => {
        toast.success("OK Removed.");
        this.refetch();
      })
      .catch(err => {
        // this.setState({errors: err.response.data || ['Cannot remove these members.']})
        toast.error(`Không thể xóa (lỗi ${err.response.status}).`);
      });
  }

  render() {
    const {searchData, members, loaded} = this.state;
    if (!loaded) return <span>Loading</span>;

    return (
      <>
        <div className="table-wrapper m-2">
          <div className="options border m-1 p-1">
            <Row className="flex-center">
              <Form.Label column="sm" md={3}>
                {" "}
                Search{" "}
              </Form.Label>
              <Col>
                {" "}
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Search member"
                  id="search"
                  value={searchData.search}
                  onChange={e =>
                    this.setState({
                      searchData: {...searchData, search: e.target.value},
                    })
                  }
                />
              </Col>
            </Row>
            <Row className="flex-center">
              <Form.Label column="sm" md={3}>
                {" "}
                Order by{" "}
              </Form.Label>
              <Col>
                {" "}
                <Form.Select
                  size="sm"
                  id="search-ordering"
                  value={searchData.ordering}
                  onChange={e =>
                    this.setState({
                      searchData: {...searchData, ordering: e.target.value},
                    })
                  }
                >
                  <option value="rating">Rating tăng dần</option>
                  <option value="-rating">Rating giảm dần</option>
                  <option value="user__username">Username tăng dần</option>
                  <option value="-user__username">Username giảm dần</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-1">
              <Col xs={8}></Col>
              <Col className="flex-center">
                <Button
                  size="sm"
                  variant="dark"
                  style={{width: "100%"}}
                  className="ml-1 mr-1"
                  onClick={() => this.resetFetch()}
                >
                  {" "}
                  Reset{" "}
                </Button>
                <Button
                  size="sm"
                  variant="dark"
                  style={{width: "100%"}}
                  className="ml-1 mr-1"
                  disabled={!this.state.loaded}
                  onClick={() => this.refetch()}
                >
                  {" "}
                  Search{" "}
                </Button>
              </Col>
            </Row>
          </div>

          <hr className="m-2" />

          <div className="admin-table org-member-table">
            <h4 className="m-0">Members</h4>
            <Table
              responsive
              hover
              size="sm"
              striped
              bordered
              className="rounded mb-0"
            >
              <thead>
                <tr>
                  <th>User</th>
                  <th>Name</th>
                  <th>Rating</th>
                  <th>
                    <Link to="#" onClick={e => this.handleDeleteSelect(e)}>
                      Remove
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody>
                {" "}
                {members.map((user, idx) => (
                  <tr key={`org-member-${user.username}`}>
                    <td>{user.username}</td>
                    <td>{`${user.first_name} ${user.last_name}`}</td>
                    <td>{user.rating === null ? "Unrated" : user.rating}</td>
                    <td>
                      <input
                        type="checkbox"
                        value={this.state.selectChk[idx]}
                        onChange={() =>
                          this.setState({
                            selectChk: this.state.selectChk.map((chk, i) =>
                              i === idx ? !chk : chk
                            ),
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}{" "}
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

          <Row className="mt-2">
            <Col md={8}></Col>
            <Col>
              <Button
                size="sm"
                variant="dark"
                style={{width: "100%"}}
                onClick={() => this.openModalHandler()}
              >
                {" "}
                Add{" "}
              </Button>
            </Col>
            {/* <Col >
            <Button size="sm" variant="danger" style={{width: "100%"}}
              disabled={!this.state.loaded}
              > Save </Button>
          </Col> */}
          </Row>
        </div>
        <AddMemberModal
          slug={this.slug}
          modalShow={this.state.modalShow}
          closeModalHandler={() => this.closeModalHandler()}
          refetch={() => this.refetch()}
        />
      </>
    );
  }
}

class AddMemberModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: "",
      submitting: false,
      errors: null,
    };
  }

  submitHandler(e) {
    e.preventDefault();

    let {users} = this.state;
    users.trim();
    if (users.length === 0) {
      alert("Hãy thêm ít nhất 1 người dùng.");
      return false;
    }
    users = users.split(/\s+/).filter(u => u !== "");

    this.setState({submitting: true, errors: null});

    const data = {users: users};
    orgAPI
      .addOrgMembers({slug: this.props.slug, data})
      .then(() => {
        this.props.closeModalHandler();
        this.props.refetch();
        this.setState({submitting: false});
      })
      .catch(err => {
        this.setState({
          errors: err.response.data,
          submitting: false,
        });
      });
  }

  closeModalHandler() {
    this.setState({submitting: false, errors: null});
    this.props.closeModalHandler();
  }

  render() {
    const {users, submitting, errors} = this.state;

    return (
      <Modal
        show={this.props.modalShow}
        onHide={() => this.closeModalHandler()}
      >
        <Modal.Header>
          <Modal.Title>+ Add members</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorBox errors={errors} />
          <Form
            id="contest-participation-add-form"
            onSubmit={e => this.submitHanlder(e)}
          >
            <div className="">Thêm thành viên vào tổ chức:</div>
            <div className="flex-center">{}</div>

            <Form.Control
              as="textarea"
              style={{height: "100px"}}
              placeholder="username1 username2 username3"
              value={users}
              onChange={e => this.setState({users: e.target.value})}
            />
            <div className="flex-center">
              <em style={{fontSize: "12px"}}>
                Dán những username (cách nhau bằng khoảng trắng) của người dùng
                mà bạn muốn thêm vào tổ chức.
              </em>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={() => this.closeModalHandler()}>
            Đóng
          </Button>
          <Button
            variant="danger"
            disabled={submitting}
            onClick={e => this.submitHandler(e)}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

let wrapped = Members;
export default wrapped;
