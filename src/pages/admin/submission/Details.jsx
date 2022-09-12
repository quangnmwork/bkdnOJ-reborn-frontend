import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";
import {Navigate} from "react-router-dom";
import {Button, Tabs, Tab} from "react-bootstrap";

import {FaRegTrashAlt, FaGlobe} from "react-icons/fa";

import submissionAPI from "api/submission";
import {SpinLoader, ErrorBox} from "components";
import {withParams} from "helpers/react-router";
import {setTitle} from "helpers/setTitle";

import GeneralDetails from "./_/GeneralDetails";
import TestcaseDetails from "./_/TestcaseDetails";
import "./Details.scss";

class AdminSubmissionDetails extends React.Component {
  constructor(props) {
    super(props);
    const {id} = this.props.params;
    this.id = id;
    this.state = {
      loaded: false,
      errors: null,
      data: undefined,
    };
  }

  componentDidMount() {
    setTitle(`Admin | Submission. ${this.id}`);
    submissionAPI
      .getSubmissionDetails({id: this.id})
      .then(res => {
        this.setState({
          data: res.data,
          loaded: true,
        });
      })
      .catch(err => {
        this.setState({
          loaded: true,
          errors: {errors: err.response.data || "Cannot load submission."},
        });
      });
  }

  deleteObjectHandler() {
    let conf = window.confirm(
      "Are you sure you want to delete this submission?"
    );
    if (conf) {
      submissionAPI
        .adminDeleteSubmission({id: this.id})
        .then(() => {
          toast.success("OK Deleted.");
          this.setState({redirectUrl: "/admin/submission/"});
        })
        .catch(() => {
          toast.error(`Cannot delete. (${err})`);
        });
    }
  }

  render() {
    if (this.state.redirectUrl) {
      return <Navigate to={`${this.state.redirectUrl}`} />;
    }
    const {loaded, errors} = this.state;

    return (
      <div className="admin submission-panel wrapper-vanilla">
        <h4 className="submission-title">
          <div className="panel-header">
            <span className="title-text">
              {`Submission ${this.id} |`}
              {!loaded && (
                <span>
                  <SpinLoader /> Loading...
                </span>
              )}
            </span>
            {loaded && !errors && (
              <>
                <span>
                  <Button
                    className="btn-svg"
                    size="sm"
                    variant="dark"
                    onClick={() =>
                      this.setState({redirectUrl: `/submission/${this.id}`})
                    }
                  >
                    <FaGlobe />
                    <span className="d-none d-md-inline">View on Site</span>
                  </Button>
                </span>
                <span>
                  <Button
                    className="btn-svg"
                    size="sm"
                    variant="danger"
                    onClick={() => this.deleteObjectHandler()}
                  >
                    <FaRegTrashAlt />
                    <span className="d-none d-md-inline">Delete</span>
                  </Button>
                </span>
              </>
            )}
          </div>
        </h4>
        <hr />
        <div className="submission-details">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          <ErrorBox errors={this.state.errors} />
          {loaded && !errors && (
            <>
              <Tabs defaultActiveKey="general" id="sub-tabs" className="pl-2">
                <Tab eventKey="general" title="General">
                  <GeneralDetails id={this.id} data={this.state.data} />
                </Tab>
                <Tab eventKey="runs" title="Results">
                  <TestcaseDetails id={this.id} data={this.state.data} />
                </Tab>
              </Tabs>
            </>
          )}
        </div>
      </div>
    );
  }
}

let wrappedPD = AdminSubmissionDetails;
wrappedPD = withParams(wrappedPD);
const mapStateToProps = state => {
  return {user: state.user.user};
};
wrappedPD = connect(mapStateToProps, null)(wrappedPD);
export default wrappedPD;
