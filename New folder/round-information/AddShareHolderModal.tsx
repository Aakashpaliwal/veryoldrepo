import React, { useState, useEffect } from "react";
import ReactModal from "../../common/ReactModal";
import Button from "../../common/Button";
import ErrorBoundary from "../../common/ErrorBoundary";
import { Field, Formik, FieldArray } from "formik";
import TextInput from "../../common/TextInput";
import _ from "lodash";
import "../../assets/lv-scss/drop-files-styles.scss";
import PhotoUpload from "../../common/PhotoUpload";
import { toast } from "react-toastify";
import TextArea from "../../common/TextArea";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { addOrUpdateShareHolderInformation } from "../../redux/actions/RoundInformation";

interface errorType {
  name?: string;
  member_image?: string;
  twitter_url?: string;
  linkedin_url?: string;
  summary?: string;
}

const AddShareHolderModal = (props: any) => {
  const {
    addOrUpdateShareHolderInformation,
    title,
    selectedShareHolder,
    closeAddShareHolderModal,
    startup_id,
  } = props;

  const [state, setState] = useState({
    isOpen: true,
    editMode: false,
    initialValues: {
      id: null,
      name: "",
      member_image: null,
      twitter_url: "",
      linkedin_url: "",
      summary: "",
    },
  });

  useEffect(() => {
    let editMode = title.substring(0, title.indexOf(" ")) == "Edit";
    if (editMode) {
      let initialValues = {
        id: selectedShareHolder._id,
        name: selectedShareHolder.name,
        member_image:
          selectedShareHolder.image && selectedShareHolder.image.location,
        twitter_url: selectedShareHolder.twitterUrl,
        linkedin_url: selectedShareHolder.linkedinUrl,
        summary: selectedShareHolder.summary,
      };

      setState({ ...state, editMode, initialValues });
    }
  }, []);

  const formValidate = (values: any) => {
    let errors: errorType = {};

    if (!values.name || values.name.trim() == "") {
      errors.name =
        "Oh no! We found out that you missed to enter Shareholder name.";
    }

    if (!values.name || values.name !== "") {
      if (!values.member_image) {
        errors.member_image =
          "Oh no! We found that you have not uploaded the photo.";
      } else {
        if (values.member_image_size_error) {
          errors.member_image =
            "Oh no! We found out that Profile Image size is greater than 5MB.";
        }
        if (values.member_image_type_error) {
          errors.member_image =
            "Oh no! We found out that you are trying to upload invalid file.";
        }
      }

      if (
        values.twitter_url &&
        !/^((?:http:\/\/)?|(?:https:\/\/)?)?(?:www\.)?twitter\.com\/(\w+)+\/?/.test(
          values.twitter_url
        )
      ) {
        errors.twitter_url =
          "Oh no! We found out that you entered invalid twitter url.";
      }

      if (
        values.linkedin_url &&
        !/^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile|company)\/\S+$/.test(
          values.linkedin_url
        )
      ) {
        errors.linkedin_url =
          "Oh no! We found out that you entered invalid Linkedin profile url.";
      }
    }

    return errors;
  };

  const handleModalClose = () => {
    setState({ ...state, isOpen: false });
    closeAddShareHolderModal();
  };

  const handleSubmit = (data: any, setSubmitting: any) => {
    data.editMode = state.editMode;

    addOrUpdateShareHolderInformation(startup_id, { ...data })
      .then((res: any) => {
        setState({ ...state, isOpen: false });
        closeAddShareHolderModal();
      })
      .catch((err: any) => {
        console.log(err);
        toast.error("Error while adding share holder");
      });
  };

  const handleSubmitError = (errors: any, setFieldValue: any) => {
    setFieldValue("startup_image_touched", true);
    if (!_.isEmpty(errors)) {
      toast.error("Please make sure to fill all the mandatory fields!!!");
    }
  };

  let renderView = ({
    errors,
    values,
    setFieldValue,
    setFieldTouched,
    touched,
    isSubmitting,
    initialValues,
    handleSubmit,
  }: {
    errors: any;
    values: any;
    setFieldValue: any;
    setFieldTouched: any;
    touched: any;
    isSubmitting: any;
    initialValues: any;
    handleSubmit: any;
  }) => {
    return (
      <React.Fragment>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <TextInput
                isMandatory={true}
                labelname="name"
                labeltitle="Enter the name"
                touched={touched}
                values={values}
                errors={errors}
              />

              <PhotoUpload
                labelTitle="Upload photo"
                isMandatory={true}
                name="member_image"
                defaultImage={state.initialValues.member_image}
                maxFileSize={5}
                notes="You can upload <b>JPG</b> or <b>PNG</b>. You can upload the photo of max size - <b>5 MB</b>."
                values={values}
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
                errors={errors}
                touched={touched}
                handleSubmit={handleSubmit}
                accept="image/jpg, image/jpeg, image/png"
                minResolution="100,100"
              />

              <TextInput
                labelname="twitter_url"
                labeltitle="Enter the twitter url"
                touched={touched}
                values={values}
                errors={errors}
              />

              <TextInput
                labelname="linkedin_url"
                labeltitle="Enter the linkedin url"
                touched={touched}
                values={values}
                errors={errors}
              />

              <TextArea
                size={250}
                labelTitle="Enter brief summary"
                labelName="summary"
                customError={errors}
                touched={touched}
                values={values}
              />
            </div>
            <div className="modal-footer">
              <div className="modal-footer-btn-holder">
                <Button
                  labelname={
                    !state.editMode
                      ? isSubmitting
                        ? "Saving..."
                        : "Save"
                      : isSubmitting
                      ? "Updating..."
                      : "Update"
                  }
                  type="submit"
                  onClick={() => handleSubmitError(errors, setFieldValue)}
                  disabled={
                    state.editMode && !!values.id ? false : isSubmitting
                  }
                />
                <span className="cancel-btn" onClick={handleModalClose}>
                  Cancel
                </span>
              </div>
            </div>
          </form>
        </div>
      </React.Fragment>
    );
  };

  let renderComponent = (
    <ErrorBoundary>
      <Formik
        validate={formValidate}
        initialValues={state.initialValues}
        onSubmit={(values, { setSubmitting }) => {
          handleSubmit(values, setSubmitting);
        }}
      >
        {renderView}
      </Formik>
    </ErrorBoundary>
  );

  return (
    <div>
      {state.isOpen && (
        <ReactModal
          isOpen={state.isOpen}
          title={title}
          handleClose={handleModalClose}
          component={renderComponent}
        />
      )}
    </div>
  );
};

AddShareHolderModal.propTypes = {
  addOrUpdateShareHolderInformation: PropTypes.func,
};

export default connect(null, { addOrUpdateShareHolderInformation })(
  AddShareHolderModal
);
