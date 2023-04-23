import React, { useState, useContext } from "react";

import Card from "../../shared/components/UIElement/Card";
import BUtton from "../../shared/components/FormElements/Button";
import Modal from "../../shared/components/UIElement/Modal";
import Map from "../../shared/components/UIElement/Map";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttp } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import "./PlaceItem.css";

const PlaceItem = (props) => {
  const auth = useContext(AuthContext);
  const { error, sentReq, clearError } = useHttp();

  const [showMap, setShowMap] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);
  const showDeleteModalHandler = () => setShowModal(true);
  const closeDeleteModalHandler = () => setShowModal(false);
  const confirmDeleteHandler = async () => {
    setShowModal(false);
    try {
      await sentReq(`http://localhost:5000/api/places/${props.id}`, "DELETE", {
        Authorization: "Bearer " + auth.token,
      });
      props.onDelete(props.id);
    } catch (err) {}
  };
  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<BUtton onClick={closeMapHandler}>Close</BUtton>}
      >
        <div className="map-container">
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal>

      <Modal
        show={showModal}
        onCancel={closeDeleteModalHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <>
            <BUtton inverse onClick={closeDeleteModalHandler}>
              Cancel
            </BUtton>
            <BUtton danger onClick={confirmDeleteHandler}>
              Delete
            </BUtton>
          </>
        }
      >
        <p>Do you really want to delete this place?</p>
      </Modal>
      <li className="place-item">
        <Card className="place-item__content">
          <div className="place-item__image">
            <img
              src={`http://localhost:5000/${props.image}`}
              alt={props.title}
            />
          </div>
          <div className="place-item__info">
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>
          <div className="place-item__actions">
            <BUtton inverse onClick={openMapHandler} disabled={true}>
              View On Map
            </BUtton>
            {auth.userId === props.creatorId && (
              <BUtton to={`/places/${props.id}`}>Edit</BUtton>
            )}
            {auth.userId === props.creatorId && (
              <BUtton danger onClick={showDeleteModalHandler}>
                Delete
              </BUtton>
            )}
          </div>
        </Card>
      </li>
    </>
  );
};

export default PlaceItem;
