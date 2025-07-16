import { useState } from "react";
import "../style/contactpage.css";

function ContactPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sujet:", subject);
    console.log("Message:", message);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h2>Objet de votre demande</h2>
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      >
        <option value="">Sélectionnez un sujet</option>
        <option value="info">Demande de renseignement</option>
        <option value="application">Un problème avec l'application</option>
        <option value="account">Un problème avec votre compte</option>
        <option value="station">Un problème avec une station</option>
        <option value="other">Autres</option>
      </select>
      <h2>Votre message</h2>
      <textarea
        id="message"
        name="message"
        placeholder="Tapez votre texte ici ..."
        rows={14}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <div className="submit-button">
        <button className="button-classic" type="submit">
          Envoyer
        </button>
      </div>
    </form>
  );
}

export default ContactPage;
