import {Component} from "react";
import DropdownTreeSelect from "react-dropdown-tree-select";
import isEqual from "lodash/isEqual";

export default class DropdownTreeNoRerender extends Component {
  constructor(props) {
    super(props);
    this.state = {data: props.data};
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate = (prevProps, prevState) => {
    if (!isEqual(this.props.data, this.state.data)) {
      this.setState({data: this.props.data});
    }
  };

  shouldComponentUpdate = nextProps => {
    return !isEqual(nextProps.data, this.state.data);
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const {data, ...rest} = this.props;
    return <DropdownTreeSelect data={this.state.data} {...rest} />;
  }
}
