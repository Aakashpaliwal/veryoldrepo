import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Formik, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import _ from "lodash";

import {
  getPastRoundsInfo,
  updatePastRoundsInfo,
  deletePastRoundInfo,
  deleteInvestorInfo,
} from "../../redux/actions/RoundInformation";
import { getStartupBasicInformation } from "../../redux/actions/BasicInformation";
import Button from "../../common/Button";
import ErrorBoundary from "../../common/ErrorBoundary";
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
import ConfirmationDialogue from "../../common/ConfirmationDialogue";

interface errorType {
  round_type?: string;
  valuation?: string;
}

const validationSchema = Yup.object().shape({
  previous_rounds: Yup.array().of(
    Yup.object().shape({
      round_type: Yup.object().required("Round type is required."),
      closing_date: Yup.date().required("Closing date is required."),
      currency: Yup.object().required("Currency is required."),
      valuation: Yup.string().required("Valuation is required."),
    })
  ),
});

const PastRound = (props: any) => {
  const { startup_id }: { startup_id: string } = useParams();
  const {
    past_rounds_info_data,
    getPastRoundsInfo,
    updatePastRoundsInfo,
    deletePastRoundInfo,
    deleteInvestorInfo,
  } = props;

  const defaultValues = {
    round_id: null,
    round_type: "",
    closing_date: null,
    valuation: 0,
    currency: { label: "INR", value: 1 },
    investor_list: [],
    empty_obj: true,
  };

  const [state, setState] = useState<any>({
    initialValues: {
      previous_rounds: [defaultValues],
    },
    isSaving: false,
    openAddInvestorModal: false,
    openModalTitle: "",
    selectedinvestor: {},
    isOpen: false,
    fundingRoundIndex: null,
  });

  const mapData = (data: any[], currency?: any) => {
    let newArray: any[] = [];
    data.forEach((item: any) => {
      let obj = {
        round_id: item._id,
        round_type: _.find(getRoundDetailType(), { value: item.roundType }),
        closing_date: item.closingDate ? new Date(item.closingDate) : null,
        valuation: item.valuation,
        currency:
          item.currency == "INR"
            ? _.find(getCurrencyOptions(), {
                value: 1,
              })
            : _.find(getCurrencyOptions(), {
                value: 2,
              }),
        investor_list: item.investors,
        empty_obj: item._id ? false : true,
      };
      newArray.push(obj);
    });

    return newArray;
  };

  const fetchMyAPI = async () => {
    const result: any = await props.getStartupBasicInformation(
      startup_id,
      props
    );
    if (result) {
      setValues(result);
    }
  };

  const setValues = async (result: any) => {
    if (result.pastRounds.length > 0) {
      setState((prevState: any) => ({
        ...state,
        initialValues: {
          ...prevState.initialValues,
          previous_rounds: [...mapData(result.pastRounds)],
        },
      }));
    }
  };

  useEffect(() => {
    fetchMyAPI();
    // getPastRoundsInfo(parseInt(startup_id));
    // if (past_rounds_info_data.loaded) {
    //   setValues();
    // }

    var element: any = document.querySelector(".edit-profile__root");
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const manualRender = (value: any) => {
    if (value) {
      fetchMyAPI();
    }
  };

  const handleSubmit = (values: any) => {
    setState({
      ...state,
      isSaving: true,
    });

    updatePastRoundsInfo(startup_id, values.previous_rounds)
      .then((result: any) => {
        setState({
          ...state,
          isSaving: false,
        });
        toast.success("Successfully saved");
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

    // console.log('formdata////////////', values?.previous_rounds);

    // values?.previous_rounds?.forEach((item: any) => {
    //     if(item.round_type === "" || item.round_type?.label === "") {
    //         errors.round_type = "Oh no! We found out that you left this field empty"
    //     }

    //     if(item.valuation === 0 || item.valuation === "") {
    //         errors.valuation = "Oh no! We found out that you left this field empty"
    //     }

    // })
    return errors;
  };

  const addInvestors = (event: any, index: number) => {
    let title = event.target.innerText;
    let fundingRoundIndex = index;
    setState({
      ...state,
      selectedinvestor: {},
      openAddInvestorModal: true,
      openModalTitle: title,
      fundingRoundIndex,
    });
  };

  const closeAddInvestorModal = () => {
    setState({ ...state, openAddInvestorModal: false });
  };

  const addToInvestorList = (
    investor: any,
    editMode: boolean,
    previousRounds: any
  ) => {
    let fundingRound = state.fundingRoundIndex;
    let previous_rounds = previousRounds.previous_rounds;
    let investor_list = previous_rounds[fundingRound].investor_list;
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

    previous_rounds[fundingRound].investor_list = investor_list;
    setState({
      ...state,
      initialValues: { ...state.initialValues, previous_rounds: [] },
    });
    setState({
      ...state,
      initialValues: {
        ...state.initialValues,
        previous_rounds: previous_rounds,
      },
    });
  };

  const editInvestor = (investor: any, index: number) => {
    let title = "Edit Investor";
    let fundingRoundIndex = index;
    setState({
      ...state,
      selectedinvestor: investor,
      openAddInvestorModal: true,
      openModalTitle: title,
      fundingRoundIndex,
    });
  };

  const setRemoveInvestor = (
    investorListId: any,
    entity_id: any,
    entity_type: any,
    currentRoundValues: any
  ) => {
    deleteInvestorInfo(startup_id, investorListId, entity_id, entity_type)
      .then((res: any) => {})
      .catch(() => toast.error("Error while deleting investor"));
  };

  const handleSubmitError = (values: any) => {
    if (!_.isEmpty(formValidate(values))) {
      toast.error("Please make sure to fill all the mandatory fields!!!");
    }
  };

  const handleDelete = (index: number, values: any, arrayHelpers: any) => {
    let fundingRoundIndex = index;
    let fundingRoundId = values.previous_rounds[fundingRoundIndex].round_id;

    if (fundingRoundId) {
      setState({ ...state, isOpen: true, fundingRoundIndex });
    }
  };

  const handleOperation = (values: any, arrayHelpers: any) => {
    const index = state.fundingRoundIndex;
    let fundingRoundId = values.previous_rounds[index].round_id;

    deletePastRoundInfo(startup_id, fundingRoundId)
      .then((res: any) => {
        arrayHelpers.remove(index);
        toast.success("Removed successfully");
        handleClose();
      })
      .catch((err: any) => {
        console.log(err);
        toast.error("Error while deleting the past round info");
      });
  };

  const handleClose = () => {
    setState({ ...state, isOpen: false });
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
              maxDate={new Date()}
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
          {errors["closing_date"] && touched["closing_date"] && (
            <ErrorView top={30} errorText={errors["closing_date"]} />
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
          <FieldArray
            name="previous_rounds"
            render={(arrayHelpers) => (
              <React.Fragment>
                {values.previous_rounds.map((pastRound: any, index: any) => {
                  return (
                    <div
                      key={index}
                      style={{
                        borderBottom: "1px solid #e7e9eb",
                        marginBottom: "20px",
                      }}
                    >
                      <div className="funding_round__heading">
                        <span>{"Funding Round " + (index + 1)}</span>
                        {!pastRound.empty_obj ? (
                          <span
                            onClick={(event) =>
                              handleDelete(index, values, arrayHelpers)
                            }
                          >
                            <i
                              className="fa fa-trash funding_round__trash"
                              id={index}
                            />
                          </span>
                        ) : (
                          <span onClick={() => arrayHelpers.remove(index)}>
                            <i
                              className="fa fa-times funding_round__trash"
                              id={index}
                            />
                          </span>
                        )}
                      </div>

                      <input type="hidden" name="id" value={pastRound.id} />
                      <Field
                        name={`previous_rounds.${index}.round_type`}
                        component={() => (
                          <AsyncCreatableDropdown
                            isMandatory={true}
                            setFieldValue={setFieldValue}
                            setFieldTouched={setFieldTouched}
                            defaultValue={
                              values["previous_rounds"][index].round_type
                            }
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
                            name={`previous_rounds.${index}.round_type`}
                            notes="Seed/Angel round is typically the first money you raise outside of your FFF circle. Angel round on LetsVenture can be 1 Cr to 6 Cr INR (150K - 1M USD). Pre-Series A or Bridge Round as the name says is used to raise interim funding before your Series A. And Series A round could be 2-5M USD or even larger"
                          />
                        )}
                      />
                      <span className="text-danger past_round_err_msg">
                        <ErrorMessage
                          name={`previous_rounds[${index}].round_type`}
                        />
                      </span>

                      <Field
                        name={`previous_rounds.${index}.closing_date`}
                        component={CustomDatePicker}
                        labelTitle="Enter the deal closure date"
                        isMandatory={true}
                        errors={errors}
                      />
                      <span className="text-danger past_round_err_msg">
                        <ErrorMessage
                          name={`previous_rounds[${index}].closing_date`}
                        />
                      </span>
                      <Field
                        name={`previous_rounds.${index}.currency`}
                        component={() => (
                          <AsyncCreatableDropdown
                            isMandatory={true}
                            labelTitle="Set your default Currency"
                            name={`previous_rounds.${index}.currency`}
                            placeholder="Choose Currency"
                            width="68%"
                            options={getCurrencyOptions()}
                            isMulti={false}
                            async={false}
                            creatable={false}
                            values={values}
                            defaultValue={
                              values["previous_rounds"][index].currency
                            }
                            setFieldValue={setFieldValue}
                            setFieldTouched={setFieldTouched}
                            errors={errors}
                            touched={touched}
                          />
                        )}
                      />
                      <span className="text-danger past_round_err_msg">
                        <ErrorMessage
                          name={`previous_rounds[${index}].currency`}
                        />
                      </span>

                      {/* <Field
                        name={`previous_rounds.${index}.valuation`}
                        component={() => ( */}
                      <TextInputGroupDropdownAppend
                        isMandatory={true}
                        type="numeric_2_decimal"
                        value={values["previous_rounds"][index].valuation}
                        labelTitle="Valuation"
                        labelName={`previous_rounds.${index}.valuation`}
                        moneySymbol={true}
                        componentstyle={{ width: "68%" }}
                        inputTextStyle={{ flex: "none", width: "100px" }}
                        errorMessage="Oh no! We found out that you left this field empty"
                        options={getCurrencyUnits(
                          values["previous_rounds"][index].currency.value
                        )}
                        currencyId={
                          values["previous_rounds"][index].currency.value
                        }
                        errors={errors}
                        setFieldValue={setFieldValue}
                        setFieldTouched={setFieldTouched}
                        touched={touched}
                        handleBlur={handleBlur}
                      />
                      {/* )}
                       /> */}

                      <span className="text-danger past_round_err_msg">
                        <ErrorMessage
                          name={`previous_rounds[${index}].valuation`}
                        />
                      </span>

                      <InvestorList
                        isMandatory={false}
                        labelTitle="List the investors participating in this round"
                        labelName="investor_list"
                        values={pastRound.investor_list}
                        previousRoundValues={values}
                        // removeInvestor={this.context.roundInformation.removeInvestor}
                        addInvestors={(e) => addInvestors(e, index)}
                        setRemoveInvestor={setRemoveInvestor}
                        innerText="Add Investor"
                        editInvestorFunc={editInvestor}
                        index={index}
                        errors={errors}
                        touched={touched}
                        fundingRoundIndex={state.fundingRoundIndex}
                        isCurrentInvestor={false}
                        entity_id={pastRound.round_id}
                      />
                    </div>
                  );
                })}
                <ConfirmationDialogue
                  show={state.isOpen}
                  title="Delete Funding Round"
                  text="Are you sure you want to delete this Funding Round ?"
                  handleClose={handleClose}
                  buttonText="Delete"
                  handleOperation={(e) => handleOperation(values, arrayHelpers)}
                />
                {(!values.previous_rounds ||
                  (values.previous_rounds &&
                    values.previous_rounds.length == 0)) && (
                  <h5 className="text-center">No Previous Round</h5>
                )}
                <Button
                  type="button"
                  labelname="Add Funding Round"
                  icon={"fa fa-plus-circle"}
                  onClick={(event) => {
                    event.preventDefault();
                    arrayHelpers.push(defaultValues);
                  }}
                />
                <br />
                <br />
                {!!state.openAddInvestorModal && (
                  <AddInvestorModal
                    title={state.openModalTitle}
                    previousRoundValues={values}
                    selectedinvestor={state.selectedinvestor}
                    addInvestor={addToInvestorList}
                    closeAddInvestorModal={closeAddInvestorModal}
                    startup_id={startup_id}
                    fundingRoundIndex={state.fundingRoundIndex}
                    isCurrentInvestor={false}
                    rednerFunc={manualRender}
                  />
                )}
              </React.Fragment>
            )}
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
            // validate={formValidate}
            validationSchema={validationSchema}
            initialValues={state.initialValues}
            onSubmit={handleSubmit}
          >
            {renderView}
          </Formik>
        </ErrorBoundary>
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

PastRound.propTypes = {
  past_rounds_info_data: PropTypes.object,
  getPastRoundsInfo: PropTypes.func,
  updatePastRoundsInfo: PropTypes.func,
  deletePastRoundInfo: PropTypes.func,
  deleteInvestorInfo: PropTypes.func,
};

const mapStateToProps = (state: any) => ({
  past_rounds_info_data: state.RoundInformation,
  loading: state.BasicInformation.loading,
  error: state.BasicInformation.error,
  loaded: state.BasicInformation.loaded,
});

export default connect(mapStateToProps, {
  getPastRoundsInfo,
  updatePastRoundsInfo,
  deletePastRoundInfo,
  deleteInvestorInfo,
  getStartupBasicInformation,
})(PastRound);
