import React, { useState, useRef, useEffect } from 'react';
import { WebcamOps } from '../utils/webcam';
import { Detection as Detect } from 'components';
import { Capture } from 'utils/Interfaces';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContextType } from 'utils/Interfaces';
import { useAuthContext } from 'contexts/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import Attendance from 'components/Attendance';
const Detection = () => {
  const { id } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamOps = new WebcamOps();
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {};
  const [time, setTime] = useState<string | undefined>();
  const { setAuth } = useAuthContext() as AuthContextType;
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    const auth = getAuth();

    signOut(auth)
      .then(() => {
        navigate('/auth');
      })
      .catch((error) => console.log(error));
  };
  return (
    <>
      <div className="w-full flex justify-end p-10 absolute z-20">
        <button
          onClick={handleSignOut}
          className="font-bold py-3 px-10 w-fit z-20"
        >
          Signout
        </button>
      </div>
      <div className="h-screen relative w-screen flex p-10 pb-14">
        {/* <h1 className="text-4xl font-bold">{time}</h1> */}

        <div className="w-full h-full flex justify-center flex-col items-center space-y-10">
          {isDetecting ? (
            <>
              <Detect
                videoRef={videoRef}
                captures={captures}
                handleSubmit={handleSubmit}
                setCaptures={setCaptures}
                setIsGalleryOpen={setIsGalleryOpen}
                webcamOps={webcamOps}
                setIsDetecting={setIsDetecting}
              />
            
            </>
          ) : (
            <button
              onClick={() => setIsDetecting(true)}
              className="bg-green-500 font-bold text-2xl rounded-lg text-white py-3 px-10 w-fit"
            >
              Start
            </button>
          )}
        </div>
        <Attendance/>

      </div>
    </>
  );
};

export default Detection;
