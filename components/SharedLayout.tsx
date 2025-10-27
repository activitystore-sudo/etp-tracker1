import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../helpers/useAuth';
import { Button } from './Button';
import styles from './SharedLayout.module.css';

export const SharedLayout = ({ children }: { children: React.ReactNode }) => {
  const { authState, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img 
            src="https://assets.floot.app/a7c09339-84ab-437f-b024-6ad03969975c/684b651a-4c3b-4784-9547-8434938f27aa.jpg" 
            alt="Peamount UTD Logo" 
            className={styles.logoIcon} 
          />
          <h1 className={styles.appName}>Player Development</h1>
        </div>
        
        <div className={styles.navContainer}>
          {authState.type === 'authenticated' && (
            <>
              <nav className={styles.nav}>
                <Link to="/" className={styles.navLink}>
                  Home
                </Link>
                {authState.user.role === 'admin' && (
                  <Link to="/admin/user-approval" className={styles.navLink}>
                    User Management
                  </Link>
                )}
              </nav>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
          {authState.type === 'unauthenticated' && (
            <Button variant="primary" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
};