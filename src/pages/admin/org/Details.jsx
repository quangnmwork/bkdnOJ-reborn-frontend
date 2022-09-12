import React from "react";
import {toast} from "react-toastify";
import {Link, Navigate} from "react-router-dom";
import {Form, Row, Col, Button, Tabs, Tab} from "react-bootstrap";
import {FaRedo, FaRegTrashAlt} from "react-icons/fa";

import {SpinLoader, ErrorBox} from "components";
import {withNavigation, withParams} from "helpers/react-router";
import {setTitle} from "helpers/setTitle";

import UserMultiSelect from "components/SelectMulti/User";
import OrgSingleSelect from "components/SelectSingle/Org";

import orgAPI from "api/organization";

import Members from "./_/Members";

import "./Details.scss";

class OrgDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      slug: this.props.params.slug,
      data: null,
      loaded: false,
      errors: null,
      parentOrg: null,
    };
    setTitle(`Admin | Org. ${this.props.params.slug}`);
  }

  callApi() {
    this.setState({loaded: false, errors: null});
    orgAPI
      .getOrg({slug: this.state.slug})
      .then(res => {
        this.setState({
          loaded: true,
          data: res.data,
        });
      })
      .catch(err => {
        this.setState({
          loaded: true,
          errors: err.response.data || ["Cannot get org info."],
        });
      });
  }

  componentDidMount() {
    this.callApi();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params !== this.props.params) {
      this.setState(
        {
          slug: this.props.params.slug,
        },
        () => this.callApi()
      );
    }
  }

  formSubmitHandler(e) {
    e.preventDefault();
    this.setState({errors: null});

    const data = this.state.data;
    orgAPI
      .updateOrg({slug: this.state.slug, data})
      .then(res => {
        toast.success("OK Updated.");
        this.setState({data: res.data});
        if (res.data.slug !== this.state.slug)
          this.props.navigate(`/admin/org/${res.data.slug}`, {replace: true});
      })
      .catch(err => {
        toast.error(`Cannot update (${err.response.status})`);
        this.setState({
          errors: {errors: err.response.data} || [
            "Cannot update organization information.",
          ],
        });
      });
  }

  deleteObjectHandler() {
    let conf = window.confirm(
      "Xóa tổ chức này sẽ xóa tất cả tổ chức con của nó. Bạn có chắc?"
    );
    if (!conf) return;

    orgAPI
      .deleteOrg({slug: this.state.slug})
      .then(() => {
        toast.success("OK Deleted.");
        this.setState({redirectUrl: "/admin/orgs"});
      })
      .catch(err => {
        toast.error(`Cannot delete. (${err.response.status})`);
        this.setState({
          errors: {errors: err.response.data} || [
            "Cannot delete this organization.",
          ],
        });
      });
  }

  inputChangeHandler(event, params = {isCheckbox: null}) {
    const isCheckbox = params.isCheckbox || false;

    let newData = this.state.data;
    if (!isCheckbox) newData[event.target.id] = event.target.value;
    else {
      newData[event.target.id] = !newData[event.target.id];
    }
    this.setState({data: newData});
  }

  render() {
    if (this.state.redirectUrl)
      return <Navigate to={`${this.state.redirectUrl}`} />;

    const {data, loaded, errors} = this.state;

    return (
      <div className="admin org-panel wrapper-vanilla">
        <h4 className="org-title">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          {loaded && (
            <div className="panel-header">
              <span className="title-text text-truncate">{`Org | ${this.state.slug}`}</span>

              <span>
                <Button
                  className="btn-svg"
                  size="sm"
                  variant="dark"
                  onClick={() => this.callApi()}
                >
                  <FaRedo size={14} />
                  <span className="d-none d-md-inline">Refresh</span>
                </Button>
              </span>

              <span>
                <Button
                  className="btn-svg"
                  size="sm"
                  variant="danger"
                  onClick={() => this.deleteObjectHandler()}
                >
                  <FaRegTrashAlt size={14} />
                  <span className="d-none d-md-inline">Delete</span>
                </Button>
              </span>
            </div>
          )}
        </h4>
        <hr />
        <div className="org-details">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          <ErrorBox errors={errors} />
          {loaded && data && (
            <>
              {
                <>
                  <Tabs
                    defaultActiveKey="general"
                    id="org-tabs"
                    className="pl-2"
                  >
                    <Tab eventKey="general" title="Info">
                      <Form
                        id="org-general"
                        onSubmit={e => this.formSubmitHandler(e)}
                      >
                        <Row>
                          <Form.Label column="sm" md={2} className="required ">
                            {" "}
                            Slug{" "}
                          </Form.Label>
                          <Col>
                            {" "}
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="Slug"
                              id="slug"
                              value={data.slug || ""}
                              onChange={e => this.inputChangeHandler(e)}
                              required
                            />
                          </Col>

                          <Form.Label column="sm" md={2} className="required ">
                            {" "}
                            Shortname{" "}
                          </Form.Label>
                          <Col>
                            {" "}
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="Short org name"
                              id="short_name"
                              value={data.short_name || ""}
                              onChange={e => this.inputChangeHandler(e)}
                              required
                            />
                          </Col>
                        </Row>

                        <Row>
                          <Form.Label column="sm" md={3}>
                            {" "}
                            Không hiển thị lên web?{" "}
                          </Form.Label>
                          <Col md={3}>
                            {" "}
                            <Form.Control
                              size="sm"
                              type="checkbox"
                              id="is_unlisted"
                              checked={data.is_unlisted || false}
                              onChange={e =>
                                this.inputChangeHandler(e, {isCheckbox: true})
                              }
                            />
                          </Col>

                          <Form.Label column="sm" md={3}>
                            {" "}
                            Ai cũng join được?{" "}
                          </Form.Label>
                          <Col md={3}>
                            {" "}
                            <Form.Control
                              size="sm"
                              type="checkbox"
                              id="is_open"
                              checked={data.is_open || false}
                              onChange={e =>
                                this.inputChangeHandler(e, {isCheckbox: true})
                              }
                            />
                          </Col>
                        </Row>

                        <Row>
                          <Form.Label column="sm" md={2} className="required">
                            {" "}
                            Name{" "}
                          </Form.Label>
                          <Col md={10}>
                            {" "}
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="Org name"
                              id="name"
                              value={data.name || ""}
                              onChange={e => this.inputChangeHandler(e)}
                              required
                            />
                          </Col>
                        </Row>

                        <Row>
                          <Form.Label column="sm" xl={12}>
                            {" "}
                            Organization Logo{" "}
                          </Form.Label>
                          <Col lg={2} className="flex-center">
                            <div
                              style={{
                                maxHeight: "100px",
                                maxWidth: "100px",
                                height: "100px",
                                width: "100px",
                              }}
                              className="border"
                            >
                              {data.logo_url ? (
                                <img
                                  src={data.logo_url}
                                  style={{
                                    maxHeight: "100px",
                                    maxWidth: "100px",
                                  }}
                                />
                              ) : (
                                <p
                                  style={{height: "100%"}}
                                  className="text-center m-0"
                                >
                                  No Image
                                </p>
                              )}
                            </div>
                          </Col>
                          <Col>
                            <Row className="w-100">
                              <Form.Label column="sm">
                                {" "}
                                Org Logo Url{" "}
                              </Form.Label>
                              <Form.Control
                                size="sm"
                                type="text"
                                id="logo_url"
                                value={data.logo_url || ""}
                                onChange={e => this.inputChangeHandler(e)}
                              />
                            </Row>
                          </Col>
                        </Row>

                        <Row>
                          <Form.Label column="sm" xl={12} className="required">
                            {" "}
                            About{" "}
                          </Form.Label>
                          <Col>
                            <Form.Control
                              as="textarea"
                              id="about"
                              required
                              value={data.about || ""}
                              onChange={e => this.inputChangeHandler(e)}
                            />
                          </Col>
                        </Row>

                        <Row>
                          <Form.Label column="sm" md={2} className="required">
                            {" "}
                            Admins{" "}
                          </Form.Label>
                          <Col>
                            <UserMultiSelect
                              id="admins"
                              value={data.admins || []}
                              onChange={arr =>
                                this.setState({data: {...data, admins: arr}})
                              }
                            />
                          </Col>
                          <Col xl={12}>
                            <sub className="text-danger">
                              <strong>*Cẩn thận!</strong> Bạn có thể mất quyền
                              Edit tổ chức này nếu bạn xóa bản thân ra khỏi danh
                              sách Admins! Hãy đảm bảo bạn vẫn có thể Edit tổ
                              chức lớn hơn.
                            </sub>
                          </Col>
                        </Row>

                        <strong>Mã truy cập tổ chức</strong>
                        <Row>
                          <Form.Label column="sm" md={4}>
                            {" "}
                            Protected?{" "}
                          </Form.Label>
                          <Col md={8}>
                            <Form.Control
                              size="sm"
                              type="checkbox"
                              id="is_protected"
                              checked={data.is_protected || false}
                              onChange={e =>
                                this.inputChangeHandler(e, {isCheckbox: true})
                              }
                            />
                          </Col>
                          <Col xl={12}>
                            <sub>Cần mã truy cập để tham gia vào tổ chức?</sub>
                          </Col>

                          <Form.Label column="sm" xl={12}>
                            {" "}
                            Access Code Prompt{" "}
                          </Form.Label>
                          <Col xl={12}>
                            <Form.Control
                              as="textarea"
                              id="access_code_prompt"
                              value={data.access_code_prompt || ""}
                              onChange={e => this.inputChangeHandler(e)}
                            />
                          </Col>
                          <Col xl={12}>
                            <sub>
                              Thông điệp hiển thị ở màn hình hỏi mã truy cập tổ
                              chức.
                            </sub>
                          </Col>

                          <Form.Label column="sm" xl={12}>
                            {" "}
                            Access Code{" "}
                          </Form.Label>
                          <Col xl={12}>
                            <Form.Control
                              size="sm"
                              type="text"
                              id="access_code"
                              value={data.access_code || ""}
                              onChange={e => this.inputChangeHandler(e)}
                            />
                          </Col>
                          <Col xl={12}>
                            <sub>Mã truy cập vào tổ chức.</sub>
                          </Col>
                        </Row>

                        <strong>Khác</strong>
                        <Row>
                          <Form.Label column="sm" xs={6}>
                            {" "}
                            Total Member count:{" "}
                          </Form.Label>
                          <Col xs={6}>
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="Member Count"
                              id="member_count"
                              value={
                                isNaN(data.member_count)
                                  ? ""
                                  : data.member_count
                              }
                              disabled
                              readOnly
                            />
                          </Col>

                          <Form.Label column="sm" xs={6}>
                            {" "}
                            Real Member count:{" "}
                          </Form.Label>
                          <Col xs={6}>
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="Real Member Count"
                              id="real_member_count"
                              value={
                                isNaN(data.real_member_count)
                                  ? ""
                                  : data.real_member_count
                              }
                              disabled
                              readOnly
                            />
                          </Col>

                          <Form.Label column="sm" xs={6}>
                            {" "}
                            Sub org count:{" "}
                          </Form.Label>
                          <Col xs={6}>
                            {" "}
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="Sub Org Count"
                              id="suborg_count"
                              value={
                                isNaN(data.suborg_count)
                                  ? ""
                                  : data.suborg_count
                              }
                              disabled
                              readOnly
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={6}>
                            <Row className="text-center">
                              <Form.Label column="sm" xl={12}>
                                {" "}
                                Become Root?{" "}
                              </Form.Label>
                              <input
                                type="checkbox"
                                id="become_oot"
                                className="w-100"
                                value={this.state.data.becomeRoot}
                                onChange={e =>
                                  this.setState({
                                    data: {
                                      ...data,
                                      become_root: e.target.checked,
                                    },
                                  })
                                }
                              />
                            </Row>
                            <Row className="w-100">
                              <Form.Label column="sm" xl={12}>
                                {" "}
                                Change Parent Organization?{" "}
                              </Form.Label>
                              <Button
                                size="sm"
                                variant="light"
                                className="w-100 m-1 ml-2 mr-2"
                                onClick={() =>
                                  this.setState({
                                    data: {...data, new_parent_org: null},
                                  })
                                }
                              >
                                Clear
                              </Button>
                              <OrgSingleSelect
                                id="parent_org"
                                value={this.state.data.new_parent_org}
                                onChange={val =>
                                  this.setState({
                                    data: {...data, new_parent_org: val},
                                  })
                                }
                              />
                            </Row>
                          </Col>
                          <Col lg={6}>
                            <div>
                              <Form.Label column="sm"> Parent Org </Form.Label>
                              <div className="d-flex">
                                {data.parent_org ? (
                                  <>
                                    {data.parent_org.logo_url ? (
                                      <img
                                        src={data.parent_org.logo_url}
                                        style={{
                                          maxHeight: "100px",
                                          maxWidth: "100px",
                                        }}
                                      />
                                    ) : (
                                      <span className="border">No Image</span>
                                    )}
                                    <ul>
                                      <li>
                                        <strong>Slug</strong>:{" "}
                                        <Link
                                          to={`/admin/org/${data.parent_org.slug}`}
                                        >
                                          {data.parent_org.slug}
                                        </Link>
                                      </li>
                                      <li>
                                        <strong>Shortname</strong>:{" "}
                                        {data.parent_org.short_name}
                                      </li>
                                      <li>
                                        <strong>Name</strong>:{" "}
                                        {data.parent_org.name}
                                      </li>
                                    </ul>
                                  </>
                                ) : (
                                  <span className="w-100 text-center">
                                    No Parent Org
                                  </span>
                                )}
                              </div>
                            </div>
                          </Col>
                        </Row>

                        <hr className="m-2" />

                        <Row>
                          <Col lg={10}></Col>
                          <Col>
                            <Button
                              variant="dark"
                              size="sm"
                              type="submit"
                              className="w-100"
                            >
                              Save
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </Tab>
                    <Tab
                      eventKey="member"
                      title="Members"
                      onClick={() => this.setState({errors: null})}
                    >
                      <Members slug={this.state.slug} />
                    </Tab>
                  </Tabs>
                </>
              }
            </>
          )}
        </div>
      </div>
    );
  }
}

let wrapped = OrgDetail;
wrapped = withParams(wrapped);
wrapped = withNavigation(wrapped);
export default wrapped;
