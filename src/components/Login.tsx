import React, { Dispatch, SetStateAction, useState } from 'react';
import { BEDlogo } from '../../assets';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import FormFieldError from './FormFieldError';
import { AuthContextType } from 'utils/Interfaces';
import { useAuthContext } from 'contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
interface FormType {
  email: string;
  password: string;
}

const Login = ({
  setIsSignUp,
}: {
  setIsSignUp: Dispatch<SetStateAction<boolean>>;
}) => {
  const { setAuth } = useAuthContext() as AuthContextType;
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm<FormType>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const onSubmit = async (data: FormType) => {
    setIsLoading(true);
    console.log(data);
    const auth = getAuth();
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      setAuth({
        uid: userCredentials.user.uid,
        email: userCredentials.user.email || '',
      });
      console.log(userCredentials);
      setAuth({
        uid: userCredentials.user.uid,
        email: userCredentials.user.email || '',
      });
      navigate('/detection');
    } catch (error: any) {
      const errorCode = error.code.split('/')[1].split('-').join(' ');
      setStatus(
        errorCode == 'invalid login credentials'
          ? 'Incorrect email or password'
          : errorCode
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md w-[800px] flex justify-between py-10 px-8 ">
      <div className="space-y-10 max-w-[350px] ">
        <div>
          <h1 className="font-bold text-2xl">Student Attendance System</h1>
          <h2>If you are a member, easily login</h2>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="mb-5">
            <input
              type="email"
              placeholder="Email"
              {...register('email', { required: true })}
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            <FormFieldError
              errField={errors.password?.type}
              descs={{
                required: 'Email is required',
              }}
            />
          </label>
          <div></div>

          <label>
            <input
              type="password"
              placeholder="Password"
              {...register('password', {
                required: true,
                minLength: 8,
              })}
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            <FormFieldError
              errField={errors.password?.type}
              descs={{
                required: 'Password  is required',
                minLength: 'Password must have at least 8 characters',
              }}
            />
          </label>

          <button className="font-bold py-3 bg-red-400 text-white rounded-lg transition-all duration-200">
            Login
          </button>
        </form>
        <h1 className="text-red-400 inline">{status}</h1>
        <h2 className="text-center">
          New here?{' '}
          <span
            onClick={() => setIsSignUp(true)}
            className="font-bold underline cursor-pointer "
          >
            Sign Up
          </span>
        </h2>
      </div>
      <img
        src={BEDlogo}
        className="w-full h-full max-w-[320px] max-h-[320px]"
      ></img>
    </div>
  );
};

export default Login;
