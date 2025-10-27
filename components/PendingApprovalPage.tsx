import React from "react";
import { useAuth } from "../helpers/useAuth";
import { Button } from "./Button";
import { Mail, Clock } from "lucide-react";
import styles from "./PendingApprovalPage.module.css";

export const PendingApprovalPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <Clock size={48} className={styles.icon} />
        </div>
        <h1 className={styles.title}>Account Pending Approval</h1>
        <p className={styles.message}>
          Thank you for registering! Your account is currently awaiting approval
          from an administrator. You will be notified once your account has been
          reviewed.
        </p>
        <div className={styles.contactInfo}>
          <Mail size={16} />
          <span>
            If you have any questions, please contact{" "}
            <a href="mailto:stefanpersson80@hotmail.com">
              stefanpersson80@hotmail.com
            </a>
          </span>
        </div>
        <Button
          variant="outline"
          onClick={() => logout()}
          className={styles.logoutButton}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
};