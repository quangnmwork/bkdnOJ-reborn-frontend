import React from "react";

import "./ErrorBox.scss";

/*
 * Receives props `errors` that is a hash:
 *   { key1: string, key2: hash, ...}
 */

class ErrorList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errTitle: props.errTitle,
      errData: props.errData,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.errTitle !== prevState.errTitle ||
      nextProps.errData !== prevState.errData
    )
      return {
        errTitle: nextProps.errTitle,
        errData: nextProps.errData,
      };
    return null;
  }

  render() {
    let {errTitle, errData} = this.state;
    if (errData instanceof Array) {
      return (
        <>
          <h5 key={errTitle} className="error-sub-title">
            {errTitle}
          </h5>
          <ul>
            {errData.map((err, idx) => (
              <li key={`${errTitle}-${idx}`}>
                <p>{err}</p>
              </li>
            ))}
          </ul>
        </>
      );
    } else {
      return (
        <>
          <h5 className="error-sub-title">error</h5>
          <ul>
            <li key={`error-msg`}>
              <p>{errData}</p>
            </li>
          </ul>
        </>
      );
    }
  }
}

export default class ErrorBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {errors: props.errors};
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.errors !== prevState.errors)
      return {errors: nextProps.errors};
    return null;
  }

  render() {
    var {errors} = this.state;
    if (!errors) return <></>;

    if (typeof errors === "string" || errors instanceof String) {
      errors = {general: errors};
    } else if (errors instanceof Array) {
      errors = {errors: errors};
    }

    let strErrors = [];
    let kwErrors = {};
    Object.keys(errors).map(key => {
      if (typeof errors[key] === "string" || errors[key] instanceof String) {
        strErrors.push(errors[key]);
      } else if (errors[key] instanceof Array) {
        kwErrors = {...kwErrors, [key]: JSON.stringify(errors[key])};
      } else if (
        typeof errors[key] === "object" &&
        !Array.isArray(errors[key]) &&
        errors[key] !== null
      ) {
        kwErrors = {...kwErrors, ...errors[key]};
      }
    });

    return (
      <div className="error-box">
        {strErrors.map((err, idx) => (
          <div className="errors-general-text" key={`err-gnr-txt-${idx}`}>
            {err}
          </div>
        ))}
        {Object.keys(kwErrors).map((key, idx) => {
          return (
            <div key={`err-sub-${idx}`} className="error-sub">
              <ErrorList errTitle={key} errData={kwErrors[key]} />
            </div>
          );
        })}
      </div>
    );
  }
}
