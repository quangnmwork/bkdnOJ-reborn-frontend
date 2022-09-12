import React from "react";
import {connect} from "react-redux";
import ReactPaginate from "react-paginate";
import {Link, Navigate} from "react-router-dom";
import {Table, Row, Col, Button} from "react-bootstrap";
// import { FaPaperPlane } from 'react-icons/fa';

import {SpinLoader, ErrorBox} from "components";
import orgAPI from "api/organization";

// Helpers
import {setTitle} from "helpers/setTitle";
import {withParams} from "helpers/react-router";

// Contexts
import {toast} from "react-toastify";

// Styles
import "styles/ClassicPagination.scss";
import "./List.scss";
import {
  FaUniversity,
  FaGreaterThan,
  FaGlobe,
  FaLock,
  FaTimes,
  FaPlus,
  FaSignInAlt,
  FaWrench,
  FaDoorOpen,
  FaDoorClosed,
  FaRegEyeSlash,
  FaRegEye,
} from "react-icons/fa";

class OrgItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {slug, name, logo_url, suborg_count, is_open, is_unlisted} =
      this.props.org;

    return (
      <tr key={`org-${slug}`} className="org-list org-item">
        <td className="org-i h-100">
          <div className="org-img-wrapper">
            {logo_url ? (
              <img id="org-img" src={logo_url} />
            ) : (
              <FaUniversity size={40} />
            )}
          </div>
          <span className="org-slug">{slug}</span>
        </td>

        <td className="org-name-td">
          <div className="org-name-wrapper border-bottom m-2">
            <h6 className="org-name">{name}</h6>
          </div>

          <div className="org-about-wrapper w-100 d-inline-flex">
            <span className="org-tag">
              {is_open ? (
                <>
                  <FaDoorOpen size={18} />
                  <span className="d-none d-md-flex">Open</span>
                </>
              ) : (
                <>
                  <FaDoorClosed size={18} />
                  <span className="d-none d-md-flex">Private</span>
                </>
              )}
            </span>
            <span className="org-tag">
              {is_unlisted ? (
                <>
                  <FaRegEyeSlash size={18} />
                  <span className="d-none d-md-flex">Hidden</span>
                </>
              ) : (
                <>
                  <FaRegEye size={18} />
                  <span className="d-none d-md-flex">Public</span>
                </>
              )}
            </span>
            <span className="org-tag">
              <FaUniversity size={18} />
              <span>{suborg_count}</span>
            </span>
          </div>

          <div className="org-panel text-right">
            {this.props.org.suborg_count === 0 ? (
              <span className="text-secondary ml-2 mr-2">Browse</span>
            ) : (
              <Link
                to="#"
                className={`ml-2 mr-2`}
                onClick={() => this.props.pushToPath(this.props.org)}
              >
                Browse
              </Link>
            )}
            |
            <Link to="#" className="ml-2 mr-2" onClick={this.props.onClick}>
              Detail
            </Link>
          </div>
        </td>
        {/* <td className="suborg_count">{suborg_count}</td>
        <td className="member_count">{member_count}</td> */}
      </tr>
    );
  }
}

class OrgList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      errors: null,

      orgs: [],
      count: 0,
      currPage: 0,
      pageCount: 1,

      path: [],
    };
  }

  refetch(params = {page: 0}) {
    this.setState({loaded: false, errors: null});
    const slug =
      this.state.path.length === 0
        ? null
        : this.state.path[this.state.path.length - 1].slug;

    orgAPI
      .getOrgs({
        slug: slug,
        params: {page: params.page + 1},
      })
      .then(res => {
        this.setState({
          loaded: true,
          orgs: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,
        });
      })
      .catch(() => {
        this.setState({
          loaded: true,
          errors: "Cannot fetch Organizations at the moment.",
        });
      });
  }

  componentDidMount() {
    this.refetch();
  }

  componentDidUpdate(_prevProps, _prevState) {
    if (this.props.path !== this.state.path) {
      this.setState({path: this.props.path}, () => {
        this.refetch();
      });
    }
  }

  handlePageClick = event => {
    this.refetch({page: event.selected});
  };

  render() {
    const {loaded, errors, orgs, count} = this.state;

    return (
      <div className="org-table">
        {/* <h4>Organizations</h4> */}
        <div className="org-table-wrapper ml-1 mr-1 border-bottom">
          <ErrorBox errors={errors} />
          <Table
            responsive
            hover
            size="sm"
            striped
            bordered
            className="rounded"
          >
            <tbody className="w-100">
              {!loaded ? (
                <tr style={{height: "200px"}}>
                  <td colSpan="99">
                    <SpinLoader margin="10px" />
                  </td>
                </tr>
              ) : (
                !errors && (
                  <>
                    {" "}
                    {count > 0 ? (
                      orgs.map((org, ridx) => (
                        <OrgItem
                          {...this.props}
                          org={org}
                          ridx={ridx}
                          key={`org${org.slug}`}
                          onClick={() => {
                            if (this.props.selectedOrg === org.slug)
                              this.props.deselectOrg();
                            else this.props.selectOrg(org.slug);
                          }}
                        />
                      ))
                    ) : (
                      <tr style={{height: "200px"}}>
                        <td colSpan={99}>
                          <em>No orgs are available yet.</em>
                        </td>
                      </tr>
                    )}
                  </>
                )
              )}
            </tbody>
          </Table>
        </div>
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
              pageRangeDisplayed={5}
              pageCount={this.state.pageCount}
              renderOnZeroPageCount={null}
              previousLabel={null}
              nextLabel={null}
            />
          </span>
        )}
      </div>
    );
  }
}

class OrgDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      slug: this.props.slug,

      loaded: false,
      errors: null,
      org: null,
    };
  }

  fetch() {
    this.setState({loaded: false, errors: null});
    orgAPI
      .getOrg({slug: this.state.slug})
      .then(res => {
        this.setState({loaded: true, org: res.data});
      })
      .catch(err => {
        this.setState({loaded: true, errors: err.response.data});
      });
  }

  componentDidMount() {
    this.fetch();
  }
  componentDidUpdate() {
    if (this.state.slug !== this.props.slug) {
      this.setState({slug: this.props.slug}, () => this.fetch());
    }
  }

  onJoinClick() {
    const {org, slug} = this.state;
    if (org.is_protected) {
      const code = window.prompt(
        `Tổ chức này cần mã truy cập để gia nhập.\n` +
          (org.access_code_prompt ? `${org.access_code_prompt}\n` : "") +
          "Code:"
      );
      if (code === null) return;
      orgAPI
        .joinOrg({slug, data: {access_code: code}})
        .then(() => {
          toast.success(`Welcome to ${slug}.`);
          this.fetch();
        })
        .catch(err => {
          if (err.response.data.error)
            toast.error(`${err.response.data.error}`);
          else toast.error(`Cannot join. (${err.response.status})`);
        });
    } else {
      const conf = window.confirm(`Gia nhập tổ chức ${slug}?`);
      if (!conf) return;

      orgAPI
        .joinOrg({slug})
        .then(() => {
          toast.success(`Welcome to ${slug}.`);
          this.fetch();
        })
        .catch(err => {
          if (err.response.data.error)
            toast.error(`${err.response.data.error}`);
          else toast.error(`Cannot join. (${err.response.status})`);
        });
    }
  }
  onLeaveClick() {
    const {slug} = this.state;
    const conf = window.confirm(`Rời khỏi tổ chức ${slug}?`);
    if (!conf) return;

    orgAPI
      .leaveOrg({slug})
      .then(() => {
        toast.success(`Đã rời khỏi ${slug}.`);
        this.fetch();
      })
      .catch(err => {
        if (err.response.data.error) toast.error(`${err.response.data.error}`);
        else toast.error(`Cannot leave. (${err.response.status})`);
      });
  }

  render() {
    if (this.state.redirectUrl)
      return <Navigate to={`${this.state.redirectUrl}`} />;

    const {slug, loaded, errors, org} = this.state;
    const {user} = this.props;

    const isLoggedIn = user !== null;
    const isStaff = isLoggedIn && user.is_staff;

    return (
      <div className="org-detail-wrapper border" style={{position: "relative"}}>
        <div style={{position: "absolute", right: 5, top: 5, width: "30px"}}>
          <Button
            className="btn-svg"
            variant="secondary"
            size="sm"
            onClick={() => this.props.deselectOrg()}
          >
            {" "}
            <FaTimes />{" "}
          </Button>
          {isStaff && (
            <Button
              className="btn-svg"
              variant="danger"
              size="sm"
              onClick={() =>
                this.setState({redirectUrl: `/admin/org/${slug}/`})
              }
            >
              {" "}
              <FaWrench />{" "}
            </Button>
          )}
        </div>
        {!loaded && (
          <div className="flex-center-col">
            <SpinLoader margin="0" size={50} />
          </div>
        )}
        {loaded && errors && (
          <>
            <ErrorBox errors={errors} />
          </>
        )}
        {loaded && !errors && (
          <>
            <span className="d-flex justify-content-center align-items-center">
              {org.logo_url ? (
                <img
                  className="org-path-item-img"
                  src={org.logo_url}
                  alt={`${org.slug} logo`}
                  height={ORG_PATH_IMG_SIZE}
                />
              ) : (
                <FaUniversity size={ORG_PATH_IMG_SIZE} />
              )}
              <h5 className="m-0 p-2 org-detail-title">{org.short_name}</h5>
            </span>

            {isLoggedIn && (
              <span>
                <code>
                  You are {!org.is_member && "not"} a member of this
                  organization.
                </code>
              </span>
            )}

            <div className="org-detail-item border">
              <h6 className="m-0">
                {" "}
                <code>{org.slug}</code> | {org.short_name}
              </h6>
              <h6 className="mb-1">{org.name}</h6>
              <span className="float-right" style={{fontSize: "12px"}}>
                <em>Created {new Date(org.creation_date).toLocaleString()}</em>
              </span>
            </div>

            <div className="org-detail-item border">
              <h6 className="m-0">About</h6>
              {org.about}
            </div>

            <div className="org-detail-item border d-flex justify-content-around">
              <div> {org.suborg_count} org(s) </div>
              <div> {org.member_count} member(s) </div>
              {/* <div > {org.real_member_count} member(s) </div> */}
            </div>

            <div className="org-detail-item border">
              <h6 className="m-0">Organization Admins</h6>
              {org.admins.length === 0 ? (
                <div style={{height: "50px"}} className="flex-center">
                  <em>Currently there is no one.</em>
                </div>
              ) : (
                <ul className="m-0">
                  {org.admins.map(user => (
                    <li key={`org-detail-admin-${user.username}`}>
                      User <code>{user.username}</code>
                      <ul>
                        <li>
                          <strong>Name</strong>: {user.first_name}{" "}
                          {user.last_name}
                        </li>
                        <li>
                          <strong>Email</strong>: <code>{user.email}</code>
                        </li>
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="org-detail-item border d-flex justify-content-around">
              {isLoggedIn ? (
                org.is_member ? (
                  <Button
                    size="sm"
                    className="btn-svg"
                    variant="danger"
                    onClick={() => this.onLeaveClick()}
                  >
                    Leave <FaTimes />
                  </Button>
                ) : org.is_open ? (
                  <Button
                    size="sm"
                    className="btn-svg"
                    variant={org.is_protected ? "warning" : "primary"}
                    onClick={() => this.onJoinClick()}
                  >
                    Join {org.is_protected ? <FaLock /> : <FaPlus />}
                  </Button>
                ) : (
                  <strong>This organization is private.</strong>
                )
              ) : (
                <Button
                  className="btn-svg"
                  size="sm"
                  variant="secondary"
                  onClick={() => this.setState({redirectUrl: "/sign-in"})}
                >
                  Sign In to Join <FaSignInAlt size={12} />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
}

const ORG_PATH_IMG_SIZE = 25;

class OrgMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOrg: null,
      path: [],
      errors: null,
    };
  }

  selectOrg(slug) {
    this.setState({selectedOrg: slug});
  }
  deselectOrg() {
    this.setState({selectedOrg: null});
  }

  componentDidMount() {
    setTitle("Organizations");
  }

  render() {
    const {path, selectedOrg, errors} = this.state;

    return (
      <div className="wrapper-vanilla" id="org-main">
        <Row id="org-title-div">
          <Col md={3} className="flex-center-col">
            <h4 className="pl-2 pr-2 m-0">Organization</h4>
          </Col>
          <Col
            className="org-path"
            style={{width: "100%", heigth: "100%", overflow: "hidden"}}
          >
            <div
              style={{
                width: "100%",
                heigth: "100%",
                overflowX: "auto",
                boxSizing: "content-box",
              }}
              className="d-flex"
            >
              <div className="org-path-item">
                <Link
                  to="#"
                  onClick={() => this.setState({path: []})}
                  className="text-dark"
                >
                  <FaGlobe size={ORG_PATH_IMG_SIZE} />
                </Link>
              </div>

              {path.map((org, idx) => {
                return (
                  <>
                    <div className="org-path-divider">
                      <div className="flex-center-col">
                        <FaGreaterThan />
                      </div>
                    </div>
                    <div className="org-path-item">
                      <Link
                        className="d-inline-flex justify-content-center align-items-center text-dark"
                        to="#"
                        onClick={() => {
                          this.setState({path: path.slice(0, idx + 1)});
                        }}
                      >
                        {org.logo_url ? (
                          <img
                            className="org-path-item-img"
                            src={org.logo_url}
                            alt={`${org.slug} logo`}
                            height={ORG_PATH_IMG_SIZE}
                          />
                        ) : (
                          <FaUniversity size={ORG_PATH_IMG_SIZE} />
                        )}
                        <div className="org-path-item-slug text-truncate">
                          {" "}
                          {org.slug}{" "}
                        </div>
                      </Link>
                    </div>
                  </>
                );
              })}
            </div>
          </Col>
        </Row>

        {errors && (
          <div className="error-box-wrapper m-2">
            <ErrorBox errors={errors} />
          </div>
        )}

        <Row>
          <Col
            className="org-table-wrapper-col ml-1 mr-1"
            md={selectedOrg ? 6 : 12}
          >
            <OrgList
              selectedOrg={selectedOrg}
              selectOrg={slug => this.selectOrg(slug)}
              deselectOrg={() => this.deselectOrg()}
              path={path}
              pushToPath={newOrg => {
                this.setState({path: path.concat(newOrg)});
              }}
            />
          </Col>
          {selectedOrg && (
            <Col className="org-detail-wrapper-col mr-1 mb-1">
              <OrgDetail
                {...this.props}
                slug={selectedOrg}
                deselectOrg={() => this.deselectOrg()}
              />
            </Col>
          )}
        </Row>
      </div>
    );
  }
}

let wrappedPD = OrgMain;
wrappedPD = withParams(wrappedPD);
const mapStateToProps = state => {
  return {user: state.user.user};
};
wrappedPD = connect(mapStateToProps, null)(wrappedPD);
export default wrappedPD;
