import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { getTicket, closeTicket } from '../features/tickets/ticketSlice';
import {
  getNotes,
  createNotes,
  reset as notesReset,
} from '../features/notes/noteSlice';

import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import NoteItem from '../components/NoteItem';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { FaPlus } from 'react-icons/fa';

const customStyles = {
  content: {
    width: '600px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    position: 'relative',
  },
};

Modal.setAppElement('#root');

function Ticket() {
  const [modalisOpen, setModalisOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const { ticket, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.tickets
  );

  const { notes, isLoading: notesIsLoading } = useSelector(
    (state) => state.notes
  );

  const dispatch = useDispatch();
  const { ticketId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(getTicket(ticketId));
    dispatch(getNotes(ticketId));
    // eslint-disable-next-line
  }, [isError, message, ticketId]);

  const onTicketClose = () => {
    dispatch(closeTicket(ticketId));
    toast.success('Ticket closed');
    navigate('/tickets');
  };
  //onNoteSubmit
  const onNoteSubmit = (e) => {
    e.preventDefault();
    dispatch(createNotes({ ticketId, noteText }))
      .then(() => {
        setNoteText('');
        closeModal();
      })
      .catch(() => {
        toast.error('Error creating note');
      });
  };

  //open /close modal

  const openModal = () => setModalisOpen(true);
  const closeModal = () => setModalisOpen(false);
  if (isLoading || notesIsLoading) {
    return <Spinner />;
  }
  if (isError) {
    return <div>Something went wrong</div>;
  }
  return (
    <div className='ticket-page'>
      <header className='ticket-header'>
        <BackButton url='/tickets' />
        <h2>
          Ticket ID: {ticket._id}
          <span className={`status status-${ticket.status}`}>
            {ticket.status}
          </span>
        </h2>
        <h3>
          Date Submitted: {new Date(ticket.createdAt).toLocaleString('en-US')}{' '}
        </h3>
        <h3>Product: {ticket.product}</h3>
        <hr />
        <div className='ticket-desc'>
          <h4>Description of the issue</h4>
          <p>{ticket.description}</p>
        </div>
        <h2>Notes</h2>
      </header>
      {ticket.status !== 'closed' && (
        <button className='btn' onClick={openModal}>
          <FaPlus />
          Add Note
        </button>
      )}
      {notes.map((note) => (
        <NoteItem key={note._id} note={note} />
      ))}
      {ticket.status !== 'closed' && (
        <button className='btn btn-block btn-danger' onClick={onTicketClose}>
          Close Ticket
        </button>
      )}

      <Modal
        isOpen={modalisOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel='Add Note'
      >
        <h2>Add Note</h2>
        <button className='btn-close' onClick={closeModal}>
          X
        </button>
        <form onSubmit={onNoteSubmit}>
          <div className='form-group'>
            <textarea
              name='noteText'
              id='noteText'
              className='form-control'
              onChange={(e) => setNoteText(e.target.value)}
              placeholder='Enter note here'
              value={noteText}
            ></textarea>
          </div>
          <div className='form-group'>
            <button className='btn' type='submit'>
              Submit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Ticket;
