import { useState } from "react";
import Modal from "../components/Modal/Modal.tsx";
import "../stylesheets/contactpage.css";

function ContactPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<'success' | 'error' | ''>('');
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalTitle("");
    setModalMessage("");
    setModalType('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      if (res.ok) {
        setModalTitle("Message envoyé !");
        setModalMessage("Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.");
        setModalType('success');
        setSubject("");
        setMessage("");
      } else {
        const errorData = await res.json().catch(() => ({
          message: "Erreur inconnue.",
        }));
        setModalTitle("Erreur d'envoi");
        setModalMessage(
          errorData.details ||
            errorData.message ||
            "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer plus tard.",
        );
        setModalType('error');
      }
    } catch (error) {
      setModalTitle("Erreur de connexion");
      setModalMessage(
        "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet ou réessayer plus tard.",
      );
      setModalType('error');
    } finally {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="subject">Objet de votre demande</label>
        <select
          id="subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        >
          <option value="">Sélectionnez un sujet</option>
          <option value="Demande de renseignement">Demande de renseignement</option>
          <option value="Un problème avec l'application">Un problème avec l'application</option>
          <option value="Un problème avec votre compte">Un problème avec votre compte</option>
          <option value="Un problème avec une station">Un problème avec une station</option>
          <option value="Autres">Autres</option>
        </select>
        <label htmlFor="message">Votre message</label>
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        actions={
          <button
            type="button"
            className={`btn ${modalType === 'error' ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleCloseModal}
          >
            Fermer
          </button>
        }
      >
        <p>{modalMessage}</p>
      </Modal>
    </>
  );
}

export default ContactPage;
