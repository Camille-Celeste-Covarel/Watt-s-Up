import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function EditVehiclePage() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    license_plate: "",
    id_plug: "",
    photo_url: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicle = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.vehicles && data.vehicles.length > 0) {
        const v = data.vehicles[0];
        setForm({
          id: v.id || "",
          name: v.name || "",
          license_plate: v.license_plate || "",
          id_plug: v.id_plug || "",
          photo_url: v.photo_url || "",
        });
      }
    };
    fetchVehicle();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Envoie les infos texte
    await fetch(`${import.meta.env.VITE_API_URL}/api/vehicules/${form.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    // Envoie la photo si sélectionnée
    if (photoFile) {
      const formData = new FormData();
      formData.append("vehicle_photo", photoFile);
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/vehicules/${form.id}/photo`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        },
      );
    }

    navigate("/profil");
  };

  return (
    <div className="edit-vehicle-page-container">
      <h2>Modifier mon véhicule</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nom du véhicule"
        />
        <input
          name="license_plate"
          value={form.license_plate}
          onChange={handleChange}
          placeholder="Plaque d'immatriculation"
        />
        <input
          name="id_plug"
          value={form.id_plug}
          onChange={handleChange}
          placeholder="Type de prise"
        />
        <div>
          <label>
            Changer la photo du véhicule :
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>
        </div>
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
}

export default EditVehiclePage;
