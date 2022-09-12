import React from "react";
import {connect} from "react-redux";
import {
  increaseCounter,
  decreaseCounter,
  multiplyCounter,
} from "redux/Counter/actions.js";
import {setTitle} from "helpers/setTitle";

import {Row, Col} from "react-bootstrap";

import UniIcon from "assets/images/bkdn-uni-icon-white.png";

import "./Content.scss";

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 0,
    };
    setTitle();
  }

  render() {
    return (
      <div className="content-div shadow rounded">
        {/* <div className="row d-block">
                    Content goes here.
                </div>

                <div className="row d-block">
                    <div>Count: {props.count}</div>
                    <button onClick={() => props.increaseCounter()}>Increase Count</button>
                    <button onClick={() => props.decreaseCounter()}>Decrease Count</button>
                    <hr></hr>
                    <input type={`input`} value={num} onChange={e => this.setState({num: e.target.value})}/>
                    <button onClick={() => props.multiplyCounter(num)}>Multiply Count</button>
                </div> */}
        <Row className="pl-3 pr-3">
          <Col
            md={4}
            className="d-flex flex-column justify-content-center align-items-center"
          >
            <img
              className="img-fluid"
              src={UniIcon}
              alt="bkdnoj-logo"
              style={{maxWidth: "90%"}}
            ></img>
            {/* <div className="pb-3 img-label">ONLINE JUDGE</div> */}
          </Col>
          <Col md={8}>
            <div
              style={{height: "100%"}}
              className="d-flex flex-column justify-content-center align-items-center"
            >
              <span className="subtext">Welcome to</span>
              <div className="big-title pt-2 pb-2">
                <h4 className="">Bách Khoa Đà Nẵng Online Judge 2.0</h4>
                <div className="title">
                  <h5 className="">
                    ver. <span className="code-markup">preALPHA</span>
                  </h5>
                  <span className="code-markup">22年08月28日</span>
                </div>
              </div>
              <span className="subtext text-center">
                Your new online platform for practicing and hosting programming
                contests, for Vietnam Central Province.
              </span>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    count: state.counter.count,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    increaseCounter: () => dispatch(increaseCounter()),
    decreaseCounter: () => dispatch(decreaseCounter()),
    multiplyCounter: num => dispatch(multiplyCounter({multiplier: num})),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Content);
