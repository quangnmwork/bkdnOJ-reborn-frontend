import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Container} from "react-bootstrap";

// Assets

import {FaUniversity, FaGlobe} from "react-icons/fa";

// Components
import {SwitchOrgModal} from "components";

// Helpers

// Styles
import "./SubHeader.scss";

class SubHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curTime: new Date().toLocaleString(),
      orgModalShow: false,
    };
  }
  toggleOrgModal(bool) {
    this.setState({orgModalShow: bool});
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({
        curTime: new Date().toLocaleString(),
      });
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const {selectedOrg, user} = this.props;
    const isLoggedIn = !!user;

    return (
      <div className="subheader expand-sm">
        <Container className="h-100 d-flex justify-content-between">
          <div className="float-left">
            <span className="left-padder d-none d-md-inline">
              {"Viewing As >>"}
            </span>

            <Link
              to="#"
              className="d-inline-flex"
              onClick={() => {
                if (isLoggedIn) this.toggleOrgModal(true);
              }}
            >
              <span className="d-inline-flex justify-content-center align-items-center text-dark">
                {selectedOrg.slug ? (
                  <div className="org-display org-uni">
                    <FaUniversity size={14} />
                  </div>
                ) : (
                  <div className="org-display org-none">
                    <FaGlobe size={14} />
                  </div>
                )}
                {selectedOrg.slug || "Global"}
              </span>
            </Link>

            {/* <span className="text-danger font-bold d-inline-flex">
                            {'<< Click'}
                        </span> */}
          </div>

          <div className="float-right">
            <span>{this.state.curTime}</span>
          </div>
        </Container>
        <SwitchOrgModal
          show={this.state.orgModalShow}
          setShow={b => this.toggleOrgModal(b)}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user.user,
    selectedOrg: state.myOrg.selectedOrg,
  };
};

let wrapped = SubHeader;
wrapped = connect(mapStateToProps, null)(wrapped);
export default wrapped;
