// Lib Imports
import React from "react";
import {connect} from "react-redux";
import {Routes, Route, Navigate} from "react-router-dom";
import {unstable_HistoryRouter as HistoryRouter} from "react-router-dom";
import {createBrowserHistory} from "history";

// Helpers

// Components
import {ListSidebar, OneColumn} from "layout";

import {Content, SubFilterSidebar, RecentSubmissionSidebar} from "components";

import {SignIn, SignUp, SignOut, UserProfile} from "pages";
import {
  SubmissionList,
  SubmissionDetails,
  ProblemList,
  ProblemDetails,
  JudgeStatuses,
  ContestList,
  ContestApp,
  ContestStanding,
  ContestAbout,
  OrgList,
  OrgDetail,
} from "pages/user";

import {
  AdminUserList,
  AdminUserDetails,
  AdminUserNew,
  AdminProblemList,
  AdminProblemDetails,
  AdminSubmissionList,
  AdminSubmissionDetails,
  AdminJudgeList,
  AdminJudgeDetails,
  AdminJudgeNew,
  AdminContestList,
  AdminContestDetails,
  AdminContestNew,
  AdminOrgList,
  AdminOrgDetails,
  AdminApp,
} from "pages/admin";

import UserApp from "pages/user/UserApp";

// Styles
import "App.scss";

const history = createBrowserHistory({window});

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user) {
      this.setState({user: this.props.user || null});
    }
  }

  isAuthenticated() {
    return !!this.props.user;
  }

  isAdmin() {
    return this.isAuthenticated() && this.props.user.is_staff;
  }

  render() {
    // TODO:  If you access the url directly, App won't have time to
    //        load user => access directly /admin won't work
    return (
      <HistoryRouter history={history}>
        <Routes>
          {this.isAdmin() && (
            <>
              <Route path="/admin" element={<AdminApp />}>
                <Route
                  index
                  path=""
                  element={
                    <div
                      className="shadow text-dark d-flex d-flex flex-column justify-content-center text-center"
                      style={{minHeight: "400px"}}
                    >
                      <h4>Admin Home Page</h4>
                    </div>
                  }
                />

                <Route
                  path="users"
                  element={<OneColumn mainContent={<AdminUserList />} />}
                />
                <Route
                  path="users/new"
                  element={<OneColumn mainContent={<AdminUserNew />} />}
                />
                <Route
                  path="user/:id"
                  element={<OneColumn mainContent={<AdminUserDetails />} />}
                />

                <Route
                  path="orgs"
                  element={<OneColumn mainContent={<AdminOrgList />} />}
                />
                <Route
                  path="org/:slug"
                  element={<OneColumn mainContent={<AdminOrgDetails />} />}
                />

                <Route
                  path="problems"
                  element={<OneColumn mainContent={<AdminProblemList />} />}
                />
                <Route
                  path="problem/new"
                  element={<OneColumn mainContent={<AdminJudgeNew />} />}
                />
                <Route
                  path="problem/:shortname"
                  element={<OneColumn mainContent={<AdminProblemDetails />} />}
                />

                <Route
                  path="submissions"
                  element={<OneColumn mainContent={<AdminSubmissionList />} />}
                />
                <Route
                  path="submission/new"
                  element={<OneColumn mainContent={<AdminJudgeNew />} />}
                />
                <Route
                  path="submission/:id"
                  element={
                    <OneColumn mainContent={<AdminSubmissionDetails />} />
                  }
                />

                <Route
                  path="contests"
                  element={<OneColumn mainContent={<AdminContestList />} />}
                />
                <Route
                  exact
                  path="contests/new"
                  element={<OneColumn mainContent={<AdminContestNew />} />}
                />
                <Route
                  path="contest/:key"
                  element={<OneColumn mainContent={<AdminContestDetails />} />}
                />

                <Route
                  path="judges"
                  element={<OneColumn mainContent={<AdminJudgeList />} />}
                />
                <Route
                  path="judge/new"
                  element={<OneColumn mainContent={<AdminJudgeNew />} />}
                />
                <Route
                  path="judge/:id"
                  element={<OneColumn mainContent={<AdminJudgeDetails />} />}
                />

                <Route
                  path="*"
                  element={
                    <div
                      className="shadow text-dark d-flex d-flex flex-column justify-content-center text-center"
                      style={{minHeight: "400px"}}
                    >
                      <h4>Not Implemented</h4>
                    </div>
                  }
                />
              </Route>
            </>
          )}
          <Route path="" element={<UserApp />}>
            <Route index path="/" element={<Content />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/profile" element={<UserProfile />} />
            {this.isAuthenticated() ? (
              <>
                <Route path="/sign-out" element={<SignOut />} />
              </>
            ) : (
              <>
                <Route path="/sign-up" element={<SignUp />} />
              </>
            )}

            {/* <Route path="/test/pdf" element={ <PDFViewer /> } /> */}

            <Route
              path="/problems"
              element={<OneColumn mainContent={<ProblemList />} />}
            />
            <Route
              path="/problem/:shortname"
              element={<OneColumn mainContent={<ProblemDetails />} />}
            />
            {/* <Route path="/problem/:shortname/submit"
              element={<ListSidebar mainContent={<Submit />} />}
            /> */}

            {/* <Route
              path="/submissions"
              element={<OneColumn mainContent={<SubmissionList />} />}
            /> */}
            <Route
              path="/submissions"
              element={
                <ListSidebar
                  mainContent={<SubmissionList />}
                  sideComponents={[
                    <SubFilterSidebar key={"SubFilterSidebar"} />,
                  ]}
                />
              }
            />

            <Route
              path="/submission/:id"
              element={<OneColumn mainContent={<SubmissionDetails />} />}
            />

            <Route
              path="/orgs"
              element={<OneColumn mainContent={<OrgList />} />}
            />
            <Route
              path="/org/:slug"
              element={<OneColumn mainContent={<OrgDetail />} />}
            />

            {/* ---------------------- CONTEST --------------------------- */}
            <Route
              path="/contests"
              element={<OneColumn mainContent={<ContestList />} />}
            />

            <Route path="/contest/:key" element={<ContestApp />}>
              <Route
                path="about"
                element={<OneColumn mainContent={<ContestAbout />} />}
              />
              <Route
                path="problem"
                element={
                  <ListSidebar
                    mainContent={<ProblemList />}
                    sideComponents={[
                      <RecentSubmissionSidebar
                        key={"RecentSubmissionSidebar"}
                      />,
                    ]}
                  />
                }
              />
              <Route
                path="problem/:shortname"
                element={
                  <ListSidebar
                    mainContent={<ProblemDetails />}
                    sideComponents={[
                      <RecentSubmissionSidebar
                        key={"RecentSubmissionSidebar"}
                      />,
                    ]}
                  />
                }
              />
              <Route
                path="submission"
                element={
                  <ListSidebar
                    mainContent={<SubmissionList />}
                    sideComponents={[
                      <SubFilterSidebar key={"SubFilterSidebar"} />,
                      <RecentSubmissionSidebar
                        key={"RecentSubmissionSidebar"}
                      />,
                    ]}
                  />
                }
              />
              <Route
                path="submission/:id"
                element={
                  <ListSidebar
                    mainContent={<SubmissionDetails />}
                    sideComponents={[
                      <RecentSubmissionSidebar
                        key={"RecentSubmissionSidebar"}
                      />,
                    ]}
                  />
                }
              />
              <Route path="standing" element={<ContestStanding />} />
              <Route path="" element={<Navigate to="about" replace />} />
              <Route path="*" element={<Navigate to="about" replace />} />
            </Route>

            <Route
              path="/status"
              element={<OneColumn mainContent={<JudgeStatuses />} />}
            />

            <Route
              path="/404"
              exact
              element={
                <div
                  className="shadow text-dark d-flex d-flex flex-column justify-content-center text-center"
                  style={{minHeight: "200px", minWidth: "400px"}}
                >
                  <h4>404 | Page Not Found</h4>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </HistoryRouter>
    );
  }
}
const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};
export default connect(mapStateToProps, null)(App);
