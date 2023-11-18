import React, { Dispatch, SetStateAction, useState } from 'react';
import { BEDlogo } from '../../assets';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import FormFieldError from './FormFieldError';
import { AuthContextType } from 'utils/Interfaces';
import { useAuthContext } from 'contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
interface FormType {
  email: string;
  password: string;
}
const SignUp = ({
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
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      console.log(userCredentials);
      setAuth({
        uid: userCredentials.user.uid,
        email: userCredentials.user.email || '',
      });
      navigate('/detection');
    } catch (error: any) {
      const errorCode = error.code.split('/')[1].split('-').join(' ');
      setStatus(errorCode);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-[420px] w-[800px] flex justify-between py-10 px-8 overflow-hidden">
      {!isLoading ? (
        <>
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
                Sign Up
              </button>
            </form>
            <h1 className="text-red-400 inline">{status}</h1>

            <h2 className="text-center">
              Already have an account?{' '}
              <span
                className="font-bold underline cursor-pointer"
                onClick={() => setIsSignUp(false)}
              >
                Login
              </span>
            </h2>
          </div>
          <img
            src={BEDlogo}
            className="w-full h-full max-w-[320px] max-h-[320px]"
          ></img>
        </>
      ) : (
        <div className="w-full h-full grid place-content-center">
          <h1 className="font-bold text-lg">Signing up...</h1>
        </div>
      )}
    </div>
  );
};

export default SignUp;
