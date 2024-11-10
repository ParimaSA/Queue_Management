'use client';

import React, { useState } from 'react';
import { toast } from "react-toastify";

const BUSINESS_QUEUE_API_URL = "/api/business/queues";


const AddQueue = ({ business_data, onQueueAdded }) => {
  const [newQueue, setNewQueue] = useState('')
  const [newAlphabet, setNewAlphabet] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPrefix, setIsPrefix] = useState(false)

  const handleQueueChange = (event) => {
    setNewQueue(event.target.value)
  };

  const handleAlphabetChange = (event) => {
    setNewAlphabet(event.target.value)
  };

  const handleAddClick = async (event) => {
    event.preventDefault(); 
    if (newQueue && (newAlphabet || !isPrefix)) {
      console.log('New Queue:', newQueue);
      console.log('New Alphabet:', newAlphabet);
      const success = await createNewQueue(newQueue, newAlphabet);
      if (success) {
        console.log("success add queue")
        onQueueAdded();
        closeModal();
      }
    } else {
      console.log('No queue added');
    }
    closeModal();
  };

  const createNewQueue = async (queue: string, alphabet: string) => {
    try {
      const requestData = {
        name: queue,
        prefix: alphabet,
      };

      const response = await fetch(BUSINESS_QUEUE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json()
      if (data.error) {
        toast.error(data.error)
        return;
      }
      toast.success(data.msg, {style: { marginTop: "70px" }})
      return true
    } catch (error) {
      console.log('Error creating queue:', error);
      return false
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    const modal = document.getElementById('my_modal_3');
    if (modal) {
      modal.showModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewQueue('');
    setNewAlphabet('');
    const modal = document.getElementById('my_modal_3');
    if (modal) {
      modal.close();
    }
  };

  const handlePrefixToggle = ()=> {
    setIsPrefix(!isPrefix)
  }

  return (
    <>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form onSubmit={handleAddClick}>
            <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>
              ✕
            </button>
            <h3 className="font-bold text-lg">Add Queue</h3>
            <br />
            <label className="input input-bordered flex items-center gap-2">
              Queue Name
              <input
                type="text"
                className="grow font-light"
                placeholder="Dining"
                value={newQueue}
                onChange={handleQueueChange}
              />
            </label>
            <br />
            <div className="form-control flex space-x-2">
              <label className="label cursor-pointer">
                <p className='text-sm'>Set Prefix</p>
                <input 
                  type="checkbox" 
                  className="toggle toggle-success ml-0" 
                  checked={isPrefix}
                  onChange={handlePrefixToggle}/>
              </label>
            </div>
            { isPrefix && (
            <label className="input input-bordered flex items-center gap-2">
              Prefix
              <input
                type="text"
                className="grow font-light"
                placeholder="A"
                value={newAlphabet}
                onChange={handleAlphabetChange}
              />
            </label>)}
            <br />
            <button type="submit" className="btn btn-primary">Add</button>
          </form>
        </div>
      </dialog>
      <button className="btn" onClick={openModal}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
        </svg>
        Add Queue
      </button>
    </>
  );
};

export default AddQueue;