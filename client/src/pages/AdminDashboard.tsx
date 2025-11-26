import type React from "react";
import CsvImporter from "../components/CsvImporter/CsvImporter";
import "./AdminDashboard.css";

const AdminDashboard: React.FC = () => {
  return (
    <div className="admin-dashboard-page">
      <h1>Panneau d'Administration</h1>
      <p>Bienvenue dans l'espace réservé aux administrateurs.</p>
      <hr />
      <CsvImporter />
    </div>
  );
};

export default AdminDashboard;
