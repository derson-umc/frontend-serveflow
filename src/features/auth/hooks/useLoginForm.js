import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { authApi } from '@features/auth/services/authApi';
import { loginSchema } from '../constants';
import { passwordStrength, getLoginError, roleToRoute } from '../utils';

export function useLoginForm() {
  const navigate        = useNavigate();
  const signIn          = useAuthStore((s) => s.signIn);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user            = useAuthStore((s) => s.user);

  const [showPassword,   setShowPassword]   = useState(false);
  const [capsOn,         setCapsOn]         = useState(false);
  const [shaking,        setShaking]        = useState(false);
  const [serverError,    setServerError]    = useState('');
  const [showForgotPwd,  setShowForgotPwd]  = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, touchedFields, isValid, dirtyFields },
  } = useForm({ resolver: zodResolver(loginSchema), mode: 'onChange' });

  const passwordValue = watch('password', '');
  const usernameValue = watch('username', '');
  const strength      = passwordStrength(passwordValue);

  useEffect(() => {
    if (!isAuthenticated) return;
    navigate(roleToRoute(user?.role ?? ''), { replace: true });
  }, [isAuthenticated, user, navigate]);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleCapsLock = (e) => {
    if (typeof e.getModifierState === 'function') setCapsOn(e.getModifierState('CapsLock'));
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await authApi.login({ username: data.username.trim(), password: data.password });
      signIn(res.token ?? res, res.refreshToken ?? null);
      navigate(roleToRoute(res.role ?? ''));
    } catch (err) {
      setServerError(getLoginError(err));
      triggerShake();
    }
  };

  const usernameOk  = dirtyFields.username && !errors.username;
  const usernameErr = (touchedFields.username || dirtyFields.username) && !!errors.username;
  const passwordOk  = dirtyFields.password && !errors.password;
  const passwordErr = (touchedFields.password || dirtyFields.password) && !!errors.password;

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    isValid,
    dirtyFields,
    touchedFields,
    passwordValue,
    usernameValue,
    strength,
    showPassword, setShowPassword,
    capsOn,
    shaking,
    serverError,
    showForgotPwd, setShowForgotPwd,
    usernameOk, usernameErr,
    passwordOk, passwordErr,
    handleCapsLock,
  };
}
