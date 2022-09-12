import React from "react";
import {Link} from "react-router-dom";

import {withLocation, withNavigation} from "helpers/react-router";
import {addClass, removeClass} from "helpers/dom_functions";

const ContestAppNavHeaders = ["about", "problem", "submission", "standing"];
class ContestNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active_app: "1509",
    };
  }

  setActive(clsname) {
    ContestAppNavHeaders.forEach(header => {
      const comp = document.getElementById(`contest-nav-${header}`);
      if (header === clsname) addClass(comp, "active");
      else removeClass(comp, "active");
    });
  }

  componentDidMount() {
    this.setState({
      active_app: "1509-force-render",
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const splits = this.props.location.pathname.split("/");
    let part = undefined;
    let i = splits.length - 1;
    for (; i >= 0; i--) {
      if (splits[i].length === "") continue;
      part = splits[i];
      break;
    }
    if (part && prevState.active_app !== part) {
      this.setState({active_app: part}, () => {
        this.setActive(part);
      });
    }
  }

  render() {
    return (
      <>
        <div
          className={`wrapper-vanilla ${
            this.props.show === false ? "d-none" : ""
          }`}
        >
          <div
            className="d-flex text-left"
            style={{flexWrap: "wrap"}}
            id="contest-app-nav"
          >
            <Link
              id={`contest-nav-back`}
              onClick={() => this.props.navigate(-1)}
              to="#"
            >{`<< Back`}</Link>
            <Link to="#">{` | `}</Link>
            {ContestAppNavHeaders.map((st, i) => (
              <Link
                key={`contest-nav-${i}`}
                id={`contest-nav-${st}`}
                onClick={() => this.setActive(st)}
                to={`${st}`}
              >
                {st}
              </Link>
            ))}
          </div>
        </div>
      </>
    );
  }
}
let wrapped = ContestNav;
wrapped = withNavigation(wrapped);
wrapped = withLocation(wrapped);
export default wrapped;
