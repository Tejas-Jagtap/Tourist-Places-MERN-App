import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
// import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import { useHttp } from "../../shared/hooks/http-hook";

const UserPlaces = () => {
  const [loadedPlaces, setloadedPlaces] = useState();
  const { error, sentReq, clearError } = useHttp();

  const userId = useParams().userId;
  console.log(userId);
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await sentReq(
          `http://localhost:5000/api/places/user/${userId}`
        );

        setloadedPlaces(res.place);
      } catch (err) {}
    };
    fetchPlaces();
  }, [sentReq, userId]);

  const placeDeletedHandler = (deletedPlaceId) => {
    setloadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== deletedPlaceId)
    );
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {/* {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )} */}
      {loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletedPlace={placeDeletedHandler} />
      )}
    </>
  );
};

export default UserPlaces;
