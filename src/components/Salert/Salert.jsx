import React, { createContext, useContext, useState, useEffect } from "react";
import "./Salert.css";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

const SalertContext = createContext();

export const useSalert = () => {
  const context = useContext(SalertContext);
  if (!context) {
    throw new Error("useSalert must be used within a SalertProvider");
  }
  return context;
};

export const SalertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showSalert = (message, type = "info", duration = 4000) => {
    setAlert({ message, type, id: Date.now() });
    
    setTimeout(() => {
      setAlert(null);
    }, duration);
  };

  const closeSalert = () => setAlert(null);

  return (
    <SalertContext.Provider value={{ showSalert }}>
      {children}
      {alert && (
        <div className={`salert-container ${alert.type} active`}>
          <div className="salert-icon">
            {alert.type === "success" && <FiCheckCircle />}
            {alert.type === "error" && <FiXCircle />}
            {alert.type === "warning" && <FiAlertCircle />}
            {alert.type === "info" && <FiInfo />}
          </div>
          <div className="salert-content">
            <p>{alert.message}</p>
          </div>
          <button className="salert-close" onClick={closeSalert}>
            <FiX />
          </button>
          <div className="salert-progress"></div>
        </div>
      )}
    </SalertContext.Provider>
  );
};
