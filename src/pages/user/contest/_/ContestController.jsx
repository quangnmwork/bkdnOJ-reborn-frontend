import React from "react";
import {connect} from "react-redux";
import {Button} from "react-bootstrap";
import {VscEyeClosed, VscEye} from "react-icons/vsc";
import {FaWrench} from "react-icons/fa";

import {addClass, removeClass} from "helpers/dom_functions";
import {withNavigation} from "helpers/react-router";

class ContestController extends React.Component {
  constructor(props) {
    super(props);
  }

  toggleNav() {
    const {showNav} = this.props;
    const comp = document.getElementById("one-column-element-i-1");
    if (showNav) addClass(comp, "d-none");
    else removeClass(comp, "d-none");
    this.props.setShowNav(!showNav);
  }

  render() {
    const {showNav, user} = this.props;
    const isStaff = user && user.is_staff;

    return (
      <div
        className="flex-center"
        style={{
          position: "absolute",
          right: "4px",
          top: "4px",
          columnGap: "2px",
          width: "unset",
          height: "unset",
        }}
      >
        <Button
          onClick={() => this.toggleNav()}
          className="btn-svg"
          id="ct_ctrl_nav"
          style={btnStyle}
          size="sm"
          variant={!showNav ? "light" : "dark"}
        >
          {!showNav ? <VscEye /> : <VscEyeClosed />}
          <span className="d-none d-md-inline">Nav</span>
        </Button>

        {isStaff && (
          <Button
            onClick={() =>
              this.props.navigate(`/admin/contest/${this.props.ckey}`)
            }
            className="btn-svg"
            style={btnStyle}
            size="sm"
            variant="danger"
          >
            <FaWrench />
            <span className="d-none d-md-inline">Adm.</span>
          </Button>
        )}

        {/* <Button onClick={(e)=>alert('Click')} className="btn-svg"
          id="ct-ctrl-live"
          size="sm" variant="light"
        >
          <VscRecord style={{color: "red"}}/> Live
        </Button> */}
      </div>
    );
  }
}

let wrapped = ContestController;
wrapped = withNavigation(wrapped);
const mapStateToProps = state => {
  return {user: state.user.user};
};
wrapped = connect(mapStateToProps, null)(wrapped);
export default wrapped;

const btnStyle = {
  height: "30px",
};
