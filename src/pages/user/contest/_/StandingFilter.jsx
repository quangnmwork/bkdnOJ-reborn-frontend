import React from "react";
import {Button, Dropdown} from "react-bootstrap";

import "./ContestStanding.scss";
import "styles/Ratings.scss";
import "./StandingFilter.scss";
import {FaFilter} from "react-icons/fa";
import {BiTrash} from "react-icons/bi";
import {useDispatch, useSelector} from "react-redux";
import {
  addOrgToFilter,
  toggleFavoriteOnly,
  toggleOrgFilter,
} from "redux/StandingFilter/action";

const ClearIcon = props => {
  return <BiTrash className="clear-icon" size={18} {...props} />;
};

const StandingFilter = ({contestId, orgList}) => {
  const filter = useSelector(
    state => state.standingFilter.standingFilter[contestId]
  );
  const dispatch = useDispatch();
  const [selectedOrg, setSelectedOrg] = React.useState([]);

  const isOrgFilterEnable = filter?.isOrgFilterEnable;
  const isFavoriteEnable = filter?.isFavoriteOnly;

  const onOrgFilterSelectChange = e => {
    let selectedIds = [];
    const options = e.target.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selectedIds.push(options[i].value);
    }
    setSelectedOrg(selectedIds);
  };

  const onToggleOrgFilter = e => {
    dispatch(toggleOrgFilter({contestId, isEnable: e.target.checked}));
  };
  const onToggleFavoriteFilter = e => {
    dispatch(toggleFavoriteOnly({contestId, isEnable: e.target.checked}));
  };

  const onSaveClick = () => {
    dispatch(addOrgToFilter({contestId, orgList: selectedOrg}));
  };

  const onClearOrgFilter = () => {
    dispatch(toggleOrgFilter({contestId, isEnable: false}));
    dispatch(addOrgToFilter({contestId, orgList: []}));
    setSelectedOrg([]);
  };

  const onClearFavoriteFilter = () => {
    dispatch(
      toggleFavoriteOnly({contestId, isEnable: false, isClearAll: true})
    );
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant={
          isOrgFilterEnable || isFavoriteEnable ? "primary" : "secondary"
        }
        className="btn-svg"
      >
        <FaFilter size={18} /> Filter
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <div id="standing-filter">
          <div className="filter-col org-filter">
            <div className="filter-label">
              <label>
                <input
                  type="checkbox"
                  onChange={onToggleOrgFilter}
                  checked={!!isOrgFilterEnable}
                />
                <span>Filter by Orgs</span>
              </label>
              <ClearIcon onClick={onClearOrgFilter} />
            </div>
            <select
              multiple
              name="org-filter"
              className="filter-container border rounded"
              onChange={onOrgFilterSelectChange}
            >
              {orgList?.map(org => {
                return (
                  <option
                    key={`opt-org-${org.slug}`}
                    value={org.slug}
                    selected={selectedOrg.includes(org.slug)}
                    className="filter-option"
                  >
                    {`(${org.slug}) ${org.name}`}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="filter-label">
            <label>
              <input
                type="checkbox"
                checked={isFavoriteEnable}
                onChange={onToggleFavoriteFilter}
              />
              <span>With Favorites</span>
            </label>
            <ClearIcon onClick={onClearFavoriteFilter} />
          </div>
          <div className="filter-control-btn">
            <Button size="sm" onClick={onSaveClick}>
              Save
            </Button>
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default StandingFilter;
