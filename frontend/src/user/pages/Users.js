import React, { useEffect, useState } from "react";
import UsersList from "../components/UsersList";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
// import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import { useHttp } from "../../shared/hooks/http-hook";

const Users = () => {
  const { error, sentReq, clearError } = useHttp();
  const [loadedUsers, setLoadedUsers] = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const resData = await sentReq("http://localhost:5000/api/users");
        setLoadedUsers(resData.users);
      } catch (err) {}
    };
    fetchUsers();
  }, [sentReq]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {/* {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )} */}
      {loadedUsers && <UsersList items={loadedUsers} />};
    </>
  );
};

export default Users;
