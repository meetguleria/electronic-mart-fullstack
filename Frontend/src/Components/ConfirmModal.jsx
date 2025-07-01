const ConfirmModal = ({ message, onConfirm, onCancel }) => {

  // Close the modal when the user clicks outside of it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="confirm" onClick={onConfirm}>Yes</button>
          <button className="cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;