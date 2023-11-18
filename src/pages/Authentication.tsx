import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Login, SignUp } from 'components';
const Authentication = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  return (
    <div className="flex justify-center items-center w-full h-screen bg-white">
      {isSignUp ? <SignUp setIsSignUp={setIsSignUp}/>: <Login setIsSignUp={setIsSignUp}/>}
    </div>
  );
};

export default Authentication;
