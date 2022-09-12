import React from "react";
import {Button} from "react-bootstrap";
import {Navigate, Outlet} from "react-router-dom";

import {VscThreeBars} from "react-icons/vsc";

import authAPI from "api/auth";
import {addClass, removeClass} from "helpers/dom_functions.js";
import {setTitle} from "helpers/setTitle.js";

import AdminNav from "./nav/AdminNav";
import "./AdminApp.scss";

class AdminApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authorized: false,
      loaded: false,
      sidebarClosed: false,
      redirectUrl: null,
    };
  }
  hideSidebar() {
    let sidebar = document.getElementById("admin-sidebar");
    const bool = this.state.sidebarClosed;
    this.setState({sidebarClosed: !bool}, () => {
      if (bool) removeClass(sidebar, "d-none");
      else addClass(sidebar, "d-none");
    });
  }
  componentDidMount() {
    authAPI
      .whoAmI()
      .then(res => {
        const user = res.data && res.data.user;
        if (user.is_staff || user.is_superuser)
          this.setState({authorized: true, loaded: true});
      })
      .catch(() => {
        this.setState({loaded: true});
      });
  }

  render() {
    if (!this.state.loaded) return <></>;
    if (!this.state.authorized) return <Navigate to="/404" replace />;
    setTitle("Admin | Dashboard");

    return (
      <div className="admin-page">
        <AdminNav className="d-none" />
        <div id="admin-content-wrapper">
          <div id="admin-topbar" className="shadow">
            <Button
              variant="light"
              onClick={() => this.hideSidebar()}
              id="sidebar-toggle-btn"
            >
              <VscThreeBars />
            </Button>

            <span></span>
          </div>
          <div id="admin-panel-container">
            <Outlet />
          </div>
        </div>
      </div>
    );
  }
}

export default AdminApp;
