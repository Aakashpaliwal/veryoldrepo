import React, { useState, useEffect } from "react";
import { Field, ErrorMessage } from "formik";
import PropTypes from "prop-types";
import "../../assets/lv-scss/styles.scss";
import _ from "lodash";

const ErrorView = ({ errorText }: { errorText: string }) => {
  return <div className="edit__profile_error_text"> {errorText} </div>;
};

const InvestorList = (props: any) => {
  const {
    values,
    index,
    editInvestorFunc,
    previousRoundValues,
    currentRoundValues,
    setRemoveInvestor,
    isMandatory,
    labelTitle,
    labelName,
    errors,
    touched,
    notes,
    innerText,
    addInvestors,
  } = props;

  const [state, setState] = useState({
    investorList: values,
  });

  useEffect(() => {
    setState({ ...state, investorList: values });
  }, [values]);

  const editInvestor = (event: any) => {
    console.log(event.target.id, props);
    let indexT = event.target.id;
    let entity_id = props.entity_id;
    let entity_type = props.isCurrentInvestor ? "Current" : "Past";
    let investor = state.investorList.find((item: any) => item._id === indexT);
    editInvestorFunc(investor, entity_id, entity_type, index);
  };

  const removeInvestor = (event: any) => {
    console.log(event.target.id, props);
    let investor_list_id = event.target.id;
    let entity_id = props.entity_id;
    let entity_type = props.isCurrentInvestor ? "Current" : "Past";
    console.log(investor_list_id, entity_id, entity_type);
    let investorList = state.investorList.filter(
      (item: any) => item._id !== investor_list_id
    );
    setState({ ...state, investorList });
    setRemoveInvestor(investor_list_id, entity_id, entity_type);
  };

  return (
    <div className="edit-form-row">
      <label className="edit__profile_label-title">
        {labelTitle} {isMandatory ? <span className="text-danger">*</span> : ""}
      </label>
      <div
        className="d-flex justify-content-start mt-1 row"
        style={{ marginLeft: "-5px" }}
      >
        <div
          className="add-investor-box d-flex justify-content-center align-items-center m-2 col-7"
          onClick={index != null ? (e) => addInvestors(e, index) : addInvestors}
        >
          <span className="d-flex justify-content-center">
            <i className="fa fa-plus mr-3"></i>
            {innerText}
          </span>
        </div>
        {!!state.investorList &&
          state.investorList.map((item: any, key: any) => (
            <div
              className="add-investor-box custom-box d-flex align-items-center m-2 col-7 p-0"
              key={key}
            >
              <div className="p-1">
                <a target="_blank" href={item.profile_url}>
                  <img
                    src={item.image && item.image.location}
                    height="50px"
                    width="50px"
                    className="rounded-circle"
                    alt="Investor"
                  />
                </a>
              </div>
              <div className="d-flex flex-column p-1 ml-2">
                {!!item.name && (
                  <a
                    target="_blank"
                    href={item.profile_url}
                    className="investor-box-text"
                  >
                    <span style={{ fontSize: "14px" }}>{item.name}</span>
                  </a>
                )}
              </div>
              <div className="ml-auto p-1 mr-2 action-investor">
                <div id={item._id} onClick={editInvestor}>
                  Edit
                </div>
                <div id={item._id} onClick={removeInvestor}>
                  Delete
                </div>
              </div>
            </div>
          ))}
      </div>
      {errors[labelName] && touched[labelName] && <ErrorView errorText={""} />}
      {notes && <div className="edit_profile_notes"> {notes} </div>}
    </div>
  );
};

InvestorList.propTypes = {
  labelTitle: PropTypes.string.isRequired,
  labelName: PropTypes.string.isRequired,
  innerText: PropTypes.string.isRequired,
  notes: PropTypes.string,
  isMandatory: PropTypes.bool,
  values: PropTypes.array,
  removeInvestorFunc: PropTypes.func,
  setRemoveInvestor: PropTypes.func,
  addInvestors: PropTypes.func,
  currentRoundValues: PropTypes.object,
  previousRoundValues: PropTypes.object,
  editInvestorFunc: PropTypes.func,
  errors: PropTypes.object,
  touched: PropTypes.object,
  index: PropTypes.number,
  fundingRoundIndex: PropTypes.number,
  isCurrentInvestor: PropTypes.bool,
  entity_id: PropTypes.string,
  current_entity_id: PropTypes.string,
};

InvestorList.defaultProps = {
  isMandatory: false,
};

export default InvestorList;
