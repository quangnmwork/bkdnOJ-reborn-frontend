import React from "react";
import {Navigate} from "react-router-dom";
import {toast} from "react-toastify";
import {connect} from "react-redux";

import {updateUser, clearUser} from "redux/User/actions";
import {updateProfile} from "redux/Profile/actions";
import {updateMyOrg} from "redux/MyOrg/actions";

import {Row, Col, Tabs, Tab} from "react-bootstrap";

import profileClient from "api/profile";

// Assets

// Helpers

import {SpinLoader} from "components";

import "./UserProfile.scss";

import {setTitle} from "helpers/setTitle";

import {AboutTab, SettingTab} from "./_";

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: this.props.profile,
      loaded: false,
    };
    this.user = this.props.user;
    setTitle("Profile");
  }

  fetch() {
    this.setState({profile: null, loaded: false});

    setTimeout(
      () =>
        profileClient
          .fetchProfile()
          .then(res => {
            this.setState({
              profile: res.data,
              loaded: true,
            });
            this.props.updateUser({...res.data.user, avatar: res.data.avatar});
            this.props.updateProfile({...res.data});
          })
          .catch(err => {
            this.setState({
              loaded: true,
              errors: {errors: err.response.data || ["Cannot authenticate."]},
            });
            console.log(err);
          }),
      1000
    );
    // ISSUE:
    // Sometimes the Token hasn't been set yet, so it causes profile
    // to not properly load.
    // We waited for 1s...
  }

  componentDidMount() {
    this.fetch();
    setTimeout(() => this.setState({reloginNoticeShow: true}), 7000);
  }

  render() {
    const {profile, loaded} = this.state;
    if (!loaded) {
      return (
        <div className="user-profile-container shadow rounded">
          <h4 className="title">Loading</h4>
          <div className="loading-wrapper flex-center-col">
            <SpinLoader
              className="user-profile spinloading"
              size={30}
              margin="0"
            />
            {this.state.reloginNoticeShow && (
              <em className="p-2">
                Hãy thử Đăng nhập lại nếu Loading mất quá nhiều thời gian.
              </em>
            )}
          </div>
        </div>
      );
    }

    if (!profile) {
      this.props.clearUser();
      toast.error("Please log-in again.", {toastId: "profile-fetch-failed"});
      return <Navigate to="/sign-in"></Navigate>;
    }

    return (
      <div className="user-profile-container shadow rounded">
        <h4 className="title">{profile.display_name}</h4>
        <Row className="profile-content pt-3 pb-3">
          <Col md={3} className="flex-center-col">
            <img
              src={profile.avatar}
              className="avatar"
              alt={`User ${profile.user.username}'s avatar`}
            />
            <h5 className="pt-2">{profile.user.username}</h5>
          </Col>

          <Col md={9} className="text-left tabs-wrapper">
            <Tabs defaultActiveKey="about" className="profile-tabs mb-3">
              <Tab eventKey="settings" title="Settings">
                <SettingTab profile={profile} />
              </Tab>
              {/* <Tab eventKey="compete" title="Compete">
                That thou hast her it is not all my grief, And yet it may be said I loved her dearly; That she hath thee is of my wailing chief, A loss in love that touches me more nearly. Loving offenders thus I will excuse ye: Thou dost love her, because thou know'st I love her; And for my sake even so doth she abuse me, Suffering my friend for my sake to approve her. If I lose thee, my loss is my love's gain, And losing her, my friend hath found that loss;
              </Tab> */}
              <Tab eventKey="about" title="About">
                <AboutTab profile={profile} />
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user.user,
    profile: state.profile.profile,

    myOrg: state.myOrg,
    selectedOrg: state.myOrg.selectedOrg,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: user => dispatch(updateUser({user: user})),
    updateProfile: profile => dispatch(updateProfile({profile: profile})),
    clearUser: () => dispatch(clearUser()),

    updateMyOrg: ({memberOf, adminOf, selectedOrg}) =>
      dispatch(updateMyOrg({memberOf, adminOf, selectedOrg})),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
