import React from "react";
import {Navigate} from "react-router-dom";
import {Modal, Button} from "react-bootstrap";

import {BsExclamationCircle, BsFillLightningChargeFill} from "react-icons/bs";
import {FaPaperPlane, FaExternalLinkAlt} from "react-icons/fa";

import {shouldStopPolling, isNoTestcaseStatus} from "constants/statusFilter";

import submissionApi from "api/submission";
import SubmitForm from "./SubmitForm";
import "./SubmitModal.scss";

const __SUBMIT_MODAL_POLL_DELAY = 3000; // ms
const __SUBMIT_MODAL_MAX_POLL_DURATION = 30 * 1000; // ms

class SubmitModalResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subId: props.subId,
      data: {status: "...", test_cases: []},
    };
  }

  pollResult() {
    if (shouldStopPolling(this.state.data.status)) {
      clearInterval(this.timer);
      return;
    }
    submissionApi
      .getSubmissionResult({id: this.state.subId})
      .then(res => {
        this.setState({data: res.data});
      })
      .catch(err => {
        console.log("Error when Polling", err);
      });
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  /* Is used when websocket is not available
    fetching data every 3 seconds */
  componentDidUpdate(prevProps) {
    if (prevProps.subId !== this.props.subId) {
      this.setState({subId: this.props.subId}, () => {
        clearInterval(this.timer);
        this.timer = setInterval(
          () => this.pollResult(),
          __SUBMIT_MODAL_POLL_DELAY
        );
        setTimeout(
          () => clearInterval(this.timer),
          __SUBMIT_MODAL_MAX_POLL_DURATION
        );
      });
    }
  }

  render() {
    const {subErrors} = this.props;
    if (subErrors) return <div className="note">{subErrors}</div>;

    const {subId, data} = this.state;
    if (subId === null || data.status === "...")
      return <div className="note loading_3dot">Submitting</div>;

    if (data.status === "QU")
      return <div className="note loading_3dot">Queuing</div>;
    if (data.status === "P")
      return <div className="note loading_3dot">Processing</div>;

    if (data.status === "G") {
      return (
        <div className="note loading_3dot">{`Judging case ${data.current_testcase}`}</div>
      );
    }
    const verdict = data.status === "D" ? data.result : data.status;

    if (!isNoTestcaseStatus(verdict)) {
      for (let i = 0; i < data.test_cases.length; i++) {
        if (data.test_cases[i].status !== "AC") {
          return (
            <div className="note">
              <span>
                {"Got "}
                <span className={`verdict ${verdict.toLowerCase()}`}>
                  <span>{verdict}</span>
                </span>
                {` on case ${data.test_cases[i].case}.`}
              </span>
            </div>
          );
        }
      }
    }

    return (
      <div className="note">
        <span>
          {`Result: `}
          <span className={`verdict ${verdict.toLowerCase()}`}>
            <span>{verdict}</span>
          </span>
        </span>
      </div>
    );
  }
}

export default class SubmitModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subId: null,
      errors: null,
      redirect: false,
      submitting: false,
    };
  }
  setErrors(err) {
    this.setState({errors: err});
  }
  setSubId(id) {
    this.setState({subId: id});
  }

  onHide() {
    this.setState({subId: null, submitting: false});
    this.props.onHide();
  }

  render() {
    const {contest} = this.props;

    if (!!this.state.redirect && !!this.state.subId) {
      if (contest)
        return (
          <Navigate
            to={`/contest/${contest.key}/submission/${this.state.subId}`}
          />
        );
      else return <Navigate to={`/submission/${this.state.subId}`} />;
    }

    return (
      <Modal
        show={this.props.show}
        onHide={() => this.onHide()}
        className="submit-modal"
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>
            {`Submit ${contest ? `to ${contest.key}` : ""}`}
            <BsFillLightningChargeFill size={20} />
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <SubmitForm
            prob={this.props.prob}
            lang={this.props.lang}
            contest={this.props.contest}
            submitting={this.state.submitting}
            setSubId={subId => this.setSubId(subId)}
            setSubErrors={err => this.setErrors(err)}
          />
        </Modal.Body>

        <Modal.Footer>
          <div className="note">
            {!this.state.submitting ? (
              <>
                <div
                  style={{
                    height: "100%",
                    width: "auto",
                    margin: "auto",
                    display: "flex",
                    verticalAlign: "center",
                  }}
                >
                  <BsExclamationCircle />
                </div>
                <span className="warning">
                  This editor only store your most recent code!
                </span>
              </>
            ) : (
              <SubmitModalResult
                subId={this.state.subId}
                subErrors={this.state.errors}
              />
            )}
          </div>

          <Button variant="secondary" onClick={() => this.onHide()}>
            Close
          </Button>

          {this.state.subId === null ? (
            <Button
              variant="dark"
              onClick={() => this.setState({submitting: true})}
              disabled={this.state.submitting}
            >
              {"Submit "}
              <FaPaperPlane size={12} />
            </Button>
          ) : (
            <Button
              variant="dark"
              onClick={() => this.setState({redirect: true})}
            >
              {"Details "}
              <FaExternalLinkAlt size={12} />
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  }
}
