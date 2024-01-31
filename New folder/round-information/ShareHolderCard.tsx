import React, { useState, useEffect } from "react";
//import "../../assets/lv-scss/teams.scss";
import { Row, Col, Button, Toast } from "reactstrap";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import {
  getAllShareHoldersInformation,
  deleteShareHolderInformation,
  getShareHolderInformation,
} from "../../redux/actions/RoundInformation";
import { getStartupBasicInformation } from "../../redux/actions/BasicInformation";
import AddShareHolderModal from "./AddShareHolderModal";
import Spinner from "../../common/Spinner";
import ConfirmationDialogue from "../../common/ConfirmationDialogue";

const ShareHolderCard = (props: any) => {
  const {
    startup_id,
    share_holder_data: { all_share_holders, loaded, loading, error },
    getAllShareHoldersInformation,
    deleteShareHolderInformation,
  } = props;

  const [state, setState] = useState({
    isSaving: false,
    openAddShareHolderModal: false,
    openModalTitle: "",
    selectedShareHolder: {},
  });
  const [shareHolderValues, setShareHolderValues] = useState([]);
  const [isopen, setIsOpen] = useState(false);
  const [currentShareHolder, setCurrentShareHolder] = useState({
    id: null,
    name: "",
  });

  const manualRender = (value: any) => {
    if (value) {
      fetchMyAPI();
    }
  };

  const fetchMyAPI = async () => {
    const result: any = await props.getStartupBasicInformation(
      startup_id,
      props
    );

    setShareHolderValues(result.shareholders);
  };

  useEffect(() => {
    fetchMyAPI();
    // getAllShareHoldersInformation(startup_id);
  }, []);

  const addShareHolder = () => {
    let title = "Add Shareholder";
    setState({
      ...state,
      selectedShareHolder: {},
      openAddShareHolderModal: true,
      openModalTitle: title,
    });
  };

  const closeAddShareHolderModal = () => {
    setState({ ...state, openAddShareHolderModal: false });
    // getAllShareHoldersInformation(startup_id);
    fetchMyAPI();
  };

  const editShareHolder = (shareHolder: any) => {
    let title = "Edit Shareholder";
    setState({
      ...state,
      selectedShareHolder: shareHolder,
      openAddShareHolderModal: true,
      openModalTitle: title,
    });
  };

  const handleConfirmationDialogueClose = () => {
    setIsOpen(false);
    fetchMyAPI();
    // getAllShareHoldersInformation(startup_id);
  };

  const handleOperation = (shareHolderId: any) => {
    deleteShareHolderInformation(startup_id, shareHolderId)
      .then((res: any) => {
        toast.success("Successfully removed");
        handleConfirmationDialogueClose();
      })
      .catch((err: any) => {
        toast.error("Error while deleting share holder");
      });
  };

  if (props.loaded && props.error === null) {
    return (
      <>
        <Row>
          <Col sm="12">
            <p className="teamCard_title">
              Shareholders{" "}
              <Button
                color="primary"
                style={{ float: "right" }}
                onClick={addShareHolder}
              >
                Add Shareholder
              </Button>
            </p>
            {!!state.openAddShareHolderModal && (
              <AddShareHolderModal
                title={state.openModalTitle}
                selectedShareHolder={state.selectedShareHolder}
                closeAddShareHolderModal={closeAddShareHolderModal}
                startup_id={startup_id}
                renderFunction={manualRender}
              />
            )}

            <hr />
            <div className="card-wrapper teamCard_border">
              <>
                {shareHolderValues.length > 0 &&
                  shareHolderValues.map(function (item: any, id: any) {
                    return (
                      <div className="card card-item" key={id}>
                        <div className="card-body">
                          <div className="card-profile">
                            <img
                              className="prof-img rounded-circle"
                              src={item.image && item.image.location}
                              loading="lazy"
                              alt="Shareholder"
                            />
                          </div>
                          <div className="name mt-4">
                            <a href="javascript:void(0);">{item.name}</a>
                          </div>
                          {item.linkedinUrl || item.twitterUrl ? (
                            <div className="team_social">
                              <a
                                href={item.linkedinUrl}
                                target="_blank"
                                style={
                                  item.twitterUrl && item.twitterUrl.length > 0
                                    ? { borderRight: "solid 1px #000" }
                                    : { border: "none" }
                                }
                              >
                                <i
                                  className="lni lni-linkedin-original"
                                  style={
                                    item.linkedinUrl &&
                                    item.linkedinUrl.length > 0 &&
                                    (!item.twitterUrl ||
                                      item.twitterUrl.length == 0)
                                      ? { paddingRight: "0" }
                                      : { paddingRight: "15px" }
                                  }
                                ></i>
                              </a>

                              <a href={item.twitterUrl} target="_blank">
                                <i
                                  className="lni lni-twitter-original"
                                  style={
                                    item.twitterUrl &&
                                    item.twitterUrl.length > 0
                                      ? { display: "inherit" }
                                      : { display: "none" }
                                  }
                                ></i>
                              </a>
                            </div>
                          ) : null}
                          <div className="summary-short"></div>
                          <div className="summary-desc">
                            <div>
                              <span className="short-text">{item.summary}</span>
                            </div>
                          </div>
                          <div className="controls">
                            <a
                              href="javascript:void(0);"
                              onClick={(e) => editShareHolder(item)}
                            >
                              Edit
                            </a>
                            |
                            <a
                              href="javascript:void(0);"
                              onClick={(e) => {
                                setIsOpen(true);
                                setCurrentShareHolder({
                                  id: item._id,
                                  name: item.name.toUpperCase(),
                                });
                              }}
                            >
                              Delete
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                <>
                  {shareHolderValues.length === 0 && (
                    <div className="no-data-card-item">
                      <div className="card-body">
                        <strong>There are no share holders.</strong>
                      </div>
                    </div>
                  )}
                </>
              </>
            </div>
          </Col>
        </Row>
        <ConfirmationDialogue
          show={isopen}
          text={`Are you sure you want to delete this Shareholder named ${currentShareHolder.name}?`}
          buttonText="Delete"
          title="Delete Shareholder"
          handleClose={handleConfirmationDialogueClose}
          handleOperation={() => handleOperation(currentShareHolder.id)}
        />
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

ShareHolderCard.propTypes = {
  share_holder_data: PropTypes.object,
  getShareHolderInformation: PropTypes.func,
  getAllShareHoldersInformation: PropTypes.func,
  deleteShareHolderInformation: PropTypes.func,
};
const mapStateToProps = (state: any) => ({
  share_holder_data: state.RoundInformation,
  loading: state.BasicInformation.loading,
  error: state.BasicInformation.error,
  loaded: state.BasicInformation.loaded,
});

export default connect(mapStateToProps, {
  getShareHolderInformation,
  getAllShareHoldersInformation,
  deleteShareHolderInformation,
  getStartupBasicInformation,
})(ShareHolderCard);
