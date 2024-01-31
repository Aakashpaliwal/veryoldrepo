import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Formik, Field } from "formik";
import DatePicker from "react-datepicker";
import moment from "moment";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import _ from "lodash";

import {
  getCurrentRoundInfo,
  updateCurrentRoundInfo,
  deleteCurrentRoundInfo,
  deleteInvestorInfo,
} from "../../redux/actions/RoundInformation";
import { getStartupBasicInformation } from "../../redux/actions/BasicInformation";
import Button from "../../common/Button";
import ErrorBoundary from "../../common/ErrorBoundary";
import TextInput from "../../common/TextInput";
import Spinner from "../../common/Spinner";

import "react-datepicker/dist/react-datepicker.css";
import "../../assets/lv-scss/styles.scss";
import AsyncCreatableDropdown from "../../common/AsyncCreatableDropdown";
import {
  getCurrencyOptions,
  getCurrencyUnits,
  getRoundDetailType,
} from "../../managers/RoundInformationManager";
import ErrorView from "../../common/ErrorView";
import TextInputGroupDropdownAppend from "../../common/TextInputGroupDropdownAppend";
import InvestorList from "./InvestorList";

import "../../assets/lv-scss/round-information-styles.scss";
import AddInvestorModal from "./AddInvestorModal";
import {
  generateCSRFToken,
  setHeader,
  setInterceptors,
} from "../../../../utils/Interceptor";

interface errorType {
  transaction_type?: string;
  minimum_ticket_size?: string;
  valuation?: string;
  available_allocation?: string;
  currency?: string;
}

const CurrentRound = (props: any) => {
  const { startup_id }: { startup_id: string } = useParams();
  const {
    current_round_info_data: { current_round, loading, error, loaded },
    getCurrentRoundInfo,
    updateCurrentRoundInfo,
    deleteCurrentRoundInfo,
    deleteInvestorInfo,
  } = props;

  const [state, setState] = useState<any>({
    initialValues: {
      round_id: null,
      transaction_type: "",
      deal_closure_date: null,
      minimum_ticket_size: 0,
      valuation: 0,
      available_allocation: 0,
      currency: { label: "INR", value: 1 },
      investor_list: [],
    },
    isSaving: false,
    openAddInvestorModal: false,
    openModalTitle: "",
    selectedinvestor: {},
  });

  const changeNumberFormat = (
    number: any,
    decimals: any,
    recursiveCall: any
  ) => {
    const decimalPoints = decimals || 2;
    const noOfLakhs = number / 100000;
    let displayStr;
    let isPlural;

    // Rounds off digits to decimalPoints decimal places
    function roundOf(integer: any) {
      return +integer.toLocaleString(undefined, {
        minimumFractionDigits: decimalPoints,
        maximumFractionDigits: decimalPoints,
      });
    }

    if (noOfLakhs >= 1 && noOfLakhs <= 99) {
      const lakhs = roundOf(noOfLakhs);
      isPlural = lakhs > 1 && !recursiveCall;
      displayStr = `${lakhs} Lakh${isPlural ? "s" : ""}`;
    } else if (noOfLakhs >= 100) {
      const crores = roundOf(noOfLakhs / 100);
      const crorePrefix: any =
        crores >= 100000 ? changeNumberFormat(crores, decimals, true) : crores;
      isPlural = crores > 1 && !recursiveCall;
      displayStr = `${crorePrefix} Crore${isPlural ? "s" : ""}`;
    } else {
      displayStr = roundOf(+number);
    }

    return displayStr;
  };

  function numDifferentiation(val: any) {
    if (val >= 10000000) val = (val / 10000000).toFixed(2) + " Cr";
    else if (val >= 100000) val = (val / 100000).toFixed(2) + " Lac";
    else if (val >= 1000) val = (val / 1000).toFixed(2) + " K";
    console.log("va", val);
    return val;
  }

  const setValues = async (result: any) => {
    console.log("currentround", result);

    if (result) {
      setState((prevState: any) => ({
        ...state,
        initialValues: {
          ...prevState.initialValues,
          round_id: result.currentRound._id,
          transaction_type: _.find(getRoundDetailType(), {
            value: result.currentRound.transactionType,
          }),
          deal_closure_date: new Date(result.currentRound.dealClosureDate),
          minimum_ticket_size: result.currentRound.minimumTicketSize,
          valuation: numDifferentiation(result.currentRound.valuation),
          available_allocation: result.currentRound.availableAllocation,
          currency:
            result.currentRound.currency == "INR"
              ? _.find(getCurrencyOptions(), {
                  value: 1,
                })
              : _.find(getCurrencyOptions(), {
                  value: 2,
                }),
          investor_list: result.currentRound.investors,
        },
      }));
    }
  };

  const fetchMyAPI = async () => {
    const result: any = await props.getStartupBasicInformation(
      startup_id,
      props
    );
    if (result) {
      setValues(result);
    }
    // setDataValues(result.dataroom);
  };

  useEffect(() => {
    setInterceptors();
    setHeader();
    generateCSRFToken();
    fetchMyAPI();
    // getCurrentRoundInfo(parseInt(startup_id));
    // if (loaded) {
    //   setValues();
    // }

    var element: any = document.querySelector(".edit-profile__root");
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSubmit = (values: any) => {
    setState({
      ...state,
      isSaving: true,
    });

    updateCurrentRoundInfo(startup_id, values)
      .then((result: any) => {
        setState({
          ...state,
          isSaving: false,
        });
      })
      .catch((err: any) => {
        setState({
          ...state,
          isSaving: false,
          error: true,
        });
      });
  };

  const formValidate = (values: any) => {
    let errors: errorType = {};

    if (
      values.transaction_type === ""
      // ||
      // values.transaction_type.label === ""
    ) {
      errors.transaction_type =
        "Oh no! We found out that you left this field empty";
    }

    if (values.minimum_ticket_size === 0 || values.minimum_ticket_size === "") {
      errors.minimum_ticket_size =
        "Oh no! We found out that you left this field empty";
    }

    if (values.valuation === 0 || values.valuation === "") {
      errors.valuation = "Oh no! We found out that you left this field empty";
    }

    if (
      values.available_allocation === 0 ||
      values.available_allocation === ""
    ) {
      errors.available_allocation =
        "Oh no! We found out that you left this field empty";
    }

    return errors;
  };

  const addInvestors = (event: any) => {
    let title = event.target.innerText;
    setState({
      ...state,
      selectedinvestor: {},
      openAddInvestorModal: true,
      openModalTitle: title,
    });
  };

  const closeAddInvestorModal = () => {
    setState({ ...state, openAddInvestorModal: false });
  };

  const addToInvestorList = (investor: any, editMode: boolean) => {
    let investor_list = state.initialValues.investor_list;
    let tempList: any[] = [];

    if (editMode) {
      investor_list.forEach((item: any) => {
        if (item.id == investor.id) {
          tempList.push(investor);
        } else {
          tempList.push(item);
        }
      });
      investor_list = tempList;
    } else {
      investor_list.push(investor);
    }

    setState({
      ...state,
      initialValues: { ...state.initialValues, investor_list: [] },
    });
    setState({
      ...state,
      initialValues: { ...state.initialValues, investor_list: investor_list },
    });
  };

  const editInvestor = (investor: any) => {
    let title = "Edit Investor";
    console.log("investor", investor);
    setState({
      ...state,
      selectedinvestor: investor,
      openAddInvestorModal: true,
      openModalTitle: title,
    });
  };

  const setRemoveInvestor = (investorListId: any, currentRoundValues: any) => {
    deleteInvestorInfo(startup_id, investorListId)
      .then((res: any) => {})
      .catch(() => toast.error("Error while deleting investor"));
  };

  const handleSubmitError = (values: any) => {
    if (!_.isEmpty(formValidate(values))) {
      toast.error("Please make sure to fill all the mandatory fields!!!");
    }
  };

  const manualRender = (value: any) => {
    if (value) {
      fetchMyAPI();
    }
  };

  const handleCurrencyChange = (
    values: any,
    setFieldValue: any,
    name: string,
    value: any
  ) => {
    console.log("current", value, values);
    setState((prevState: any) => ({
      ...state,
      initialValues: {
        ...prevState.initialValues,
        currency: value,
        round_id: values.round_id,
        transaction_type: values.transaction_type,
        deal_closure_date: values.deal_closure_date,
        minimum_ticket_size: values.minimum_ticket_size,
        valuation: values.valuation,
        available_allocation: values.available_allocation,
        investor_list: values.investor_list,
      },
    }));
  };

  const CustomDatePicker = (props: any) => {
    let {
      field,
      form: { setFieldValue, errors, touched },
    } = props;

    return (
      <div className="edit-form-row">
        <label className="edit__profile_label-title">{props.labelTitle}</label>
        <div className="row">
          <div className="col-md-8">
            <DatePicker
              className="react-datepicker-my edit__profile_form-select"
              dateFormat="dd/MM/yyyy"
              selected={field.value}
              {...field}
              onChange={(date: any) => {
                setFieldValue(field.name, date);
              }}
            />
          </div>
          <div className="col-md-8" />
          {errors["deal_closure_date"] && touched["deal_closure_date"] && (
            <ErrorView top={30} errorText={errors["deal_closure_date"]} />
          )}
        </div>
      </div>
    );
  };

  let renderView = ({
    errors,
    status,
    touched,
    setFieldTouched,
    setFieldValue,
    isSubmitting,
    handleSubmit,
    handleBlur,
    setSubmitting,
    values,
    setFieldError,
  }: {
    errors: any;
    status?: any;
    touched: any;
    setFieldTouched: any;
    setFieldValue: any;
    isSubmitting: any;
    handleSubmit: any;
    handleBlur: any;
    setSubmitting: any;
    values: any;
    setFieldError: any;
  }) => {
    return (
      <React.Fragment>
        <form onSubmit={handleSubmit}>
          <Field
            name="transaction_type"
            component={() => (
              <AsyncCreatableDropdown
                isMandatory={true}
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
                values={values}
                errors={errors}
                touched={touched}
                errorMessage="Oh no! We found out that you missed to select startup round type"
                async={false}
                width="68%"
                style={{ marginBottom: 10 }}
                creatable={false}
                placeholder="Select round"
                options={getRoundDetailType()}
                labelTitle="Select your round"
                name="transaction_type"
                notes="Seed/Angel round is typically the first money you raise outside of your FFF circle. Angel round on LetsVenture can be 1 Cr to 6 Cr INR (150K - 1M USD). Pre-Series A or Bridge Round as the name says is used to raise interim funding before your Series A. And Series A round could be 2-5M USD or even larger"
              />
            )}
          />

          <Field
            name="deal_closure_date"
            component={CustomDatePicker}
            labelTitle="Enter the deal closure date"
          />

          <Field
            name="currency"
            component={() => (
              <AsyncCreatableDropdown
                isMandatory={true}
                labelTitle="Set your default Currency"
                name="currency"
                placeholder="Choose Currency"
                width="68%"
                options={getCurrencyOptions()}
                isMulti={false}
                handleSelect={handleCurrencyChange}
                async={false}
                creatable={false}
                values={values}
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
                errors={errors}
                touched={touched}
              />
            )}
          />

          <TextInputGroupDropdownAppend
            isMandatory={true}
            type="numeric_2_decimal"
            value={parseInt(values.minimum_ticket_size)}
            labelTitle="Minimum ticket size"
            labelName="minimum_ticket_size"
            moneySymbol={true}
            higherDenomination={true}
            componentstyle={{ width: "68%" }}
            inputTextStyle={{ flex: "none", width: "100px" }}
            errorMessage="Oh no! We found out that you left this field empty"
            options={getCurrencyUnits(
              state.initialValues.currency.value &&
                state.initialValues.currency.value
            )}
            currencyId={state.initialValues.currency.value}
            errors={errors}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            touched={touched}
            handleBlur={handleBlur}
          />

          <TextInputGroupDropdownAppend
            isMandatory={true}
            type="numeric_2_decimal"
            value={parseInt(values.valuation)}
            labelTitle="Valuation"
            labelName="valuation"
            moneySymbol={true}
            componentstyle={{ width: "68%" }}
            inputTextStyle={{ flex: "none", width: "100px" }}
            errorMessage="Oh no! We found out that you left this field empty"
            options={getCurrencyUnits(state.initialValues.currency.value)}
            currencyId={state.initialValues.currency.value}
            errors={errors}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            touched={touched}
            handleBlur={handleBlur}
          />

          <TextInputGroupDropdownAppend
            isMandatory={true}
            type="numeric_2_decimal"
            value={parseInt(values.available_allocation)}
            labelTitle="Available allocation"
            labelName="available_allocation"
            moneySymbol={true}
            componentstyle={{ width: "68%" }}
            inputTextStyle={{ flex: "none", width: "100px" }}
            errorMessage="Oh no! We found out that you left this field empty"
            options={getCurrencyUnits(state.initialValues.currency.value)}
            currencyId={state.initialValues.currency.value}
            errors={errors}
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            touched={touched}
            handleBlur={handleBlur}
          />

          <InvestorList
            isMandatory={false}
            labelTitle="List the investors participating in this round"
            labelName="investor_list"
            values={state.initialValues.investor_list}
            setRemoveInvestor={setRemoveInvestor}
            addInvestors={addInvestors}
            currentRoundValues={values}
            innerText="Add Investor"
            editInvestorFunc={editInvestor}
            errors={errors}
            touched={touched}
            current_entity_id={state.initialValues.round_id}
            entity_id={state.initialValues.round_id}
            isCurrentInvestor={true}
          />

          <div className="edit-profile-footer">
            <div className="left-content">
              <Button
                onClick={() => handleSubmitError(errors)}
                type="submit"
                disabled={state.isSaving}
                labelname={state.isSaving ? "Saving..." : "Save Changes"}
              />
            </div>
          </div>
        </form>
      </React.Fragment>
    );
  };

  if (props.loaded && props.error === null) {
    return (
      <>
        <ErrorBoundary>
          <Formik
            enableReinitialize={true}
            validate={formValidate}
            initialValues={state.initialValues}
            onSubmit={handleSubmit}
          >
            {renderView}
          </Formik>
        </ErrorBoundary>

        {!!state.openAddInvestorModal && (
          <AddInvestorModal
            title={state.openModalTitle}
            selectedinvestor={state.selectedinvestor}
            closeAddInvestorModal={closeAddInvestorModal}
            addInvestor={addToInvestorList}
            startup_id={startup_id}
            round_id={state.initialValues.round_id}
            isCurrentInvestor={true}
            rednerFunc={manualRender}
          />
        )}
      </>
    );
  } else if (props.loading && props.error === null) {
    return (
      <div className="no-content-bg">
        <Spinner />
      </div>
    );
  } else {
    return <div>Error</div>;
  }
};

CurrentRound.propTypes = {
  current_round_info_data: PropTypes.object,
  getCurrentRoundInfo: PropTypes.func,
  updateCurrentRoundInfo: PropTypes.func,
  deleteCurrentRoundInfo: PropTypes.func,
  deleteInvestorInfo: PropTypes.func,
};

const mapStateToProps = (state: any) => ({
  current_round_info_data: state.RoundInformation,
  loading: state.BasicInformation.loading,
  error: state.BasicInformation.error,
  loaded: state.BasicInformation.loaded,
});

export default connect(mapStateToProps, {
  getCurrentRoundInfo,
  updateCurrentRoundInfo,
  deleteCurrentRoundInfo,
  deleteInvestorInfo,
  getStartupBasicInformation,
})(CurrentRound);
