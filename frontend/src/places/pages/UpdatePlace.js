import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import { AuthContext } from "../../shared/context/auth-context";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
// import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import Card from "../../shared/components/UIElement/Card";
import { useHttp } from "../../shared/hooks/http-hook";

import "./PlaceForm.css";

const UpdatePlace = () => {
  const auth = useContext(AuthContext);
  const { error, sentReq, clearError } = useHttp();

  const [loadedPlace, setLoadedPlace] = useState();

  const { placeId } = useParams();
  const history = useHistory();

  const [fromState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    true
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const res = await sentReq(
          `http://localhost:5000/api/places/${placeId}`
        );
        setLoadedPlace(res.place);
        setFormData(
          {
            title: {
              value: res.place.title,
              isValid: false,
            },
            description: {
              value: res.place.description,
              isValid: false,
            },
          },
          true
        );
      } catch (err) {}
    };
    fetchPlace();
  }, [sentReq, placeId, setFormData]);

  const updateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sentReq(
        `http://localhost:5000/api/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: fromState.inputs.title.value,
          description: fromState.inputs.description.value,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      history.push("/" + auth.userId + "/places");
    } catch (err) {}
  };

  if (!loadedPlace && !error) {
    return (
      <div className="center">
        <Card>
          <h2>No Place Found</h2>
        </Card>
      </div>
    );
  }

  // if (isLoading) {
  //   return (
  //     <div className="center">
  //       <LoadingSpinner />
  //     </div>
  //   );
  // }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {loadedPlace && (
        <form className="place-form" onSubmit={updateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please Enter Valid Title"
            onInput={inputHandler}
            initialValue={loadedPlace.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please Enter Valid Description (Min. 5 Charactors)"
            onInput={inputHandler}
            initialValue={loadedPlace.description}
            initialValid={true}
          />
          <Button type="submit" disabled={!fromState.isValid}>
            Update Place
          </Button>
        </form>
      )}
    </>
  );
};

export default UpdatePlace;
