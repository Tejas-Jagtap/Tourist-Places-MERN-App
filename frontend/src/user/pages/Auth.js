import React, { useState, useContext } from "react";

import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import Card from "../../shared/components/UIElement/Card";
import Input from "../../shared/components/FormElements/Input";
import { useForm } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import { useHttp } from "../../shared/hooks/http-hook";
import "./Auth.css";
import Button from "../../shared/components/FormElements/Button";

export const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const { isLoading, error, sentReq, clearError } = useHttp();

  const [fromState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (isLogin) {
      try {
        const resData = await sentReq(
          "http://localhost:5000/api/users/login",
          "POST",
          JSON.stringify({
            email: fromState.inputs.email.value,
            password: fromState.inputs.password.value,
          }),
          {
            "Content-Type": "application/json",
          }
        );
        auth.login(resData.userId, resData.token);
      } catch (err) {}
    } else {
      try {
        const formData = new FormData();
        formData.append("email", fromState.inputs.email.value);
        formData.append("name", fromState.inputs.name.value);
        formData.append("password", fromState.inputs.password.value);
        formData.append("image", fromState.inputs.image.value);
        const resData = await sentReq(
          "http://localhost:5000/api/users/signup",
          "POST",
          formData
        );
        auth.login(resData.userId, resData.token);
      } catch (err) {}
    }
  };

  const switchModeHandler = () => {
    if (!isLogin) {
      setFormData(
        {
          ...fromState.inputs,
          name: undefined,
          image: undefined,
        },
        fromState.inputs.email.isValid && fromState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...fromState.inputs,
          name: {
            value: "",
            isValid: false,
          },
          image: {
            value: null,
            isValid: false,
          },
        },
        false
      );
    }
    setIsLogin((prevMode) => !prevMode);
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required...</h2>
        <hr />
        <form onSubmit={onSubmitHandler}>
          {!isLogin && (
            <Input
              id="name"
              element="input"
              type="text"
              label="Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter valid name."
              onInput={inputHandler}
            />
          )}
          {!isLogin && (
            <ImageUpload
              center
              id="image"
              onInput={inputHandler}
              errorText="please provide an image"
            />
          )}
          <Input
            id="email"
            element="input"
            type="email"
            label="Email"
            errorText="Please Enter Valid Email"
            validators={[VALIDATOR_EMAIL()]}
            onInput={inputHandler}
          />
          <Input
            id="password"
            element="input"
            type="password"
            label="Password"
            errorText="Please Enter Valid Password (at least 6 char.)"
            validators={[VALIDATOR_MINLENGTH(6)]}
            onInput={inputHandler}
          />

          <Button type="submit" disabled={!fromState.isValid}>
            {isLogin ? "LogIn" : "SignUP"}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          Switch to {isLogin ? "SignUP" : "LogIn"}
        </Button>
      </Card>
    </>
  );
};
