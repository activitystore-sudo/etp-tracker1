import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "../helpers/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import { PasswordLoginForm } from "../components/PasswordLoginForm";
import { PasswordRegisterForm } from "../components/PasswordRegisterForm";
import styles from "./login.module.css";

const LoginPage: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authState.type === "authenticated") {
      navigate("/", { replace: true });
    }
  }, [authState, navigate]);

  // Render nothing while checking auth state to prevent flash of login form
  if (authState.type === "loading" || authState.type === "authenticated") {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Login / Register</title>
        <meta
          name="description"
          content="Login or register for the Player Development Tracking Application."
        />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.card}>
          <Tabs defaultValue="login" className={styles.tabs}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className={styles.tabContent}>
              <h1 className={styles.title}>Welcome Back</h1>
              <p className={styles.subtitle}>
                Enter your credentials to access your account.
              </p>
              <PasswordLoginForm />
            </TabsContent>
            <TabsContent value="register" className={styles.tabContent}>
              <h1 className={styles.title}>Create an Account</h1>
              <p className={styles.subtitle}>
                Your account will require admin approval after registration.
              </p>
              <PasswordRegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default LoginPage;