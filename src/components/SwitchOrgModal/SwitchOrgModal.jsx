import React from "react";
import PropTypes from "prop-types";
import {Modal, Button} from "react-bootstrap";

import {connect} from "react-redux";

// Redux actions

import {updateMyOrg} from "redux/MyOrg/actions";
import {updateSelectedOrg} from "redux/MyOrg/actions";

// API
import orgAPI from "api/organization";

// import DropdownTreeSelect from 'react-dropdown-tree-select';
import DropdownTreeSelect from "components/DropdownTreeNoRerender";
import "react-dropdown-tree-select/dist/styles.css";

const getDropdownTreeSelectData = (orgs, selectedOrgSlug = null) => {
  let list = [];
  orgs.forEach(org => {
    let mutable = {...org};
    mutable.label = org.short_name;
    mutable.tagLabel = org.slug;
    if (mutable.slug === selectedOrgSlug) mutable.checked = true;

    let childData = getDropdownTreeSelectData(org.sub_orgs, selectedOrgSlug);
    mutable.children = childData;

    list.push(mutable);
  });
  return list;
};

class SwitchOrgModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,

      selectedOrg: {},
      data: [],
    };
  }

  refetch() {
    orgAPI
      .getMyOrgs()
      .then(res => {
        this.props.updateMyOrg({
          adminOf: res.data.admin_of,
          memberOf: res.data.member_of,
        });
      })
      .catch(() => {
        // toast.error(`Cannot fetch your organizations. (${err.response.status})`, {
        //   toastId: 'cannot-fetch-my-orgs',
        // })
      });
  }

  componentDidMount() {
    this.refetch();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedOrg !== this.state.selectedOrg) {
      this.props.updateSelectedOrg(this.state.selectedOrg);
    }

    // Update dropdown lsit everytime fetched data is different
    if (
      prevProps.myOrg !== this.props.myOrg ||
      prevProps.selectedOrg !== this.props.selectedOrg
    ) {
      let selectedOrgSlug = this.props.selectedOrg.slug;
      this.setState({
        data: [
          ...getDropdownTreeSelectData(
            this.props.myOrg.memberOf,
            selectedOrgSlug
          ),
        ],
      });
    }

    // Refetch everytimes modal is shown
    if (prevProps.show !== this.props.show && this.props.show === true) {
      this.refetch();
    }
  }

  onChangeHandler(currNode, selNodes) {
    // console.log(selNodes)
    if (selNodes.length > 0) {
      const org = {
        short_name: selNodes[0].short_name,
        name: selNodes[0].name,
        slug: selNodes[0].slug,
      };
      this.setState({selectedOrg: org});
    } else {
      this.setState({selectedOrg: {}});
    }
  }

  render() {
    const {show, setShow} = this.props;

    return (
      <Modal
        show={show}
        onHide={() => setShow(false)}
        // dialogClassName="modal-90w
        // size="lg"
        aria-labelledby="switch-org-modal"
        // centered
      >
        <Modal.Header>
          <Modal.Title id="switch-org-modal">
            Filter by Organization
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex-center-col">
          <p>
            Bạn đang xem với tư cách là thành viên của:
            {/* You are viewing as a member of: */}
          </p>

          {/* <DropdownTreeSelect data={data} mode="radioSelect"
            onChange={(a,b)=>this.onChangeHandler(a,b)}
          /> */}
          <DropdownTreeSelect
            data={this.state.data}
            mode="radioSelect"
            onChange={(a, b) => this.onChangeHandler(a, b)}
          />

          <em>
            Đổi thiết lập bên trên cho phép lọc các tài nguyên mà chỉ được chia
            sẻ riêng cho tổ chức đó.
            {/* Change the above settings will allow you to view other resources
            those are shared only to other organizations. */}
          </em>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

SwitchOrgModal.propTypes = {
  show: PropTypes.bool,
  setShow: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    myOrg: state.myOrg,
    selectedOrg: state.myOrg.selectedOrg,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateSelectedOrg: org => dispatch(updateSelectedOrg({selectedOrg: org})),
    updateMyOrg: ({memberOf, adminOf, selectedOrg}) =>
      dispatch(updateMyOrg({memberOf, adminOf, selectedOrg})),
  };
};

let wrapped = SwitchOrgModal;
wrapped = connect(mapStateToProps, mapDispatchToProps)(wrapped);
export default wrapped;
