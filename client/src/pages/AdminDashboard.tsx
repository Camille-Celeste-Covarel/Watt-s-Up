import type React from "react";
import CsvImporter from "../components/CsvImporter/CsvImporter";

const AdminDashboard: React.FC = () => {
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Panneau d'Administration</h1>
      <p>Bienvenue dans l'espace réservé aux administrateurs.</p>
      <hr style={{ margin: "2rem auto", maxWidth: "600px" }} />
      <CsvImporter />
    </div>
  );
};

export default AdminDashboard;
