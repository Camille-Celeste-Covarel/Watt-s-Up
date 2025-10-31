import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "../stylesheets/editvehiclepage.css";

function EditVehiclePage() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    license_plate: "",
    id_plug: "",
    photo_url: "",
    plug: null,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [plugs, setPlugs] = useState<{ id: string; name: string }[]>([]);
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
          plug: v.plug || null,
        });
        setPhotoPreview(
          v.photo_url ? `${import.meta.env.VITE_API_URL}${v.photo_url}` : null,
        );
      }
    };
    fetchVehicle();
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/plugs`)
      .then((res) => res.json())
      .then((data) => setPlugs(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0]);
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(`${import.meta.env.VITE_API_URL}/api/vehicules/${form.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

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
      <form className="edit-vehicle-form" onSubmit={handleSubmit}>
        <div className="vehicle-photo-block">
          <img
            src={photoPreview || "/default-vehicle.png"}
            alt="véhicule"
            className="vehicle-img"
          />
          <input
            id="vehicle-photo-upload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
          <button
            type="button"
            onClick={() =>
              document.getElementById("vehicle-photo-upload")?.click()
            }
            className="vehicle-upload-btn"
          >
            Changer la photo du véhicule
          </button>
        </div>
        <div className="fields-block">
          <label>
            Nom du véhicule
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label>
            Plaque d'immatriculation
            <input
              name="license_plate"
              value={form.license_plate}
              onChange={handleChange}
            />
          </label>
          <label>
            Type de prise
            <select
              name="id_plug"
              value={form.id_plug}
              onChange={handleSelectChange}
            >
              <option value="">Sélectionnez votre prise</option>
              {plugs.map((plug) => (
                <option key={plug.id} value={plug.id}>
                  {plug.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/profil")}
          >
            Annuler
          </button>
          <button type="submit" className="save-btn">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditVehiclePage;
