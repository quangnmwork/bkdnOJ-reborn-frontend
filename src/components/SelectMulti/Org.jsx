import React from "react";

import AsyncSelect from "react-select/async";

import orgAPI from "api/organization";

const OrgSelectLabel = props => {
  const {slug, short_name, is_unlisted} = props;

  let boundColor = "bg-dark",
    boundText = "org";
  if (is_unlisted) {
    boundColor = "bg-secondary";
    boundText = "private";
  }

  return (
    <div
      className="org-choice text-left d-flex flex-column"
      style={{
        fontSize: "14px",
        focus: {
          opacity: "50%",
        },
      }}
    >
      <span>
        <span className={`rounded text-light pl-1 pr-1 mr-1 ${boundColor}`}>
          {boundText}
        </span>
        {slug}
      </span>
      <span
        style={{fontSize: "10px"}}
        className="text-truncate"
      >{`${short_name}`}</span>
    </div>
  );
};

export default class UserMultiSelect extends React.Component {
  constructor(props) {
    super(props);
  }

  async loadOptions(val) {
    return orgAPI.getAllOrgs({params: {search: val}}).then(res => {
      let data = res.data.results.map(org => ({
        value: org.slug,
        label: <OrgSelectLabel {...org} />,
        data: org,
      }));
      return data;
    });
  }

  render() {
    const orgs = this.props.value || [];

    return (
      <>
        <AsyncSelect
          isMulti
          isDisabled={this.props.isDisabled || false}
          cacheOptions
          // defaultOptions
          placeholder="Tìm slug/name/short_name..."
          noOptionsMessage={() =>
            "Hệ thống chỉ trả về 20 Orgs khớp tìm kiếm nhất. " +
            "Hãy thử đổi nội dung tìm nếu không tìm thấy Org mong muốn."
          }
          loadOptions={val => this.loadOptions(val)}
          onChange={sel =>
            this.props.onChange(sel.map(select => ({...select.data})))
          }
          value={orgs.map(org => ({
            value: org.slug,
            label: <OrgSelectLabel {...org} />,
            data: org,
          }))}
          styles={{
            container: () => ({
              width: "100%",
            }),
          }}
        />
      </>
    );
  }
}
