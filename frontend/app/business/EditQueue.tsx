'use client'

import { fetchData } from 'next-auth/client/_utils';
import React from 'react'
import { useState, useEffect } from 'react';
import { mutate } from 'swr';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PreviewIcon from '@mui/icons-material/Preview';
import Preview from './Preview';

const BUSINESS_QUEUES_API_URL = "/api/business/queues/";
const QUEUE_API_URL = "/api/queue/";

const EditQueue = ({queue}) => {
  const [QueueId, setQueueId] = useState('');
  const [editedQueue, setEditedQueue] = useState('');
  const [editedAlphabet, setEditedAlphabet] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExplanation, setIsExplanation] = useState(false)
  const [isPrefix, setIsPrefix] = useState(false)


  useEffect(() => {
    setQueueId(queue.id);
  }, [queue]);

  const handleQueueChange = (event) => {
    console.log(QueueId, " ChangeQueue")
    setEditedQueue(event.target.value);
  }

  const handleAlphabetChange = (event) => {
    setEditedAlphabet(event.target.value);
  }

  const handleAddClick = (queueID) => {
    if (editedQueue && editedAlphabet) {
      handleSubmit(parseInt(QueueId, 10));
      console.log('New Queue:', editedQueue);
      console.log('New Alphabet', editedAlphabet);
      closeModal(QueueId);
    }
    else {
      console.log('No queue added');
    }
  }

  const openModal = async (queueId) => {
    setQueueId(queueId);

    try {
      const response = await fetch(`/api/queue/${queueId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log("Failed to fetch queue data");
        return;
      }

      const data = await response.json();
      console.log("data: ", data)
      console.log(data.prefix, data.name)
      setEditedAlphabet(data.prefix)
      setEditedQueue(data.name)
      if (data.prefix){
        setIsPrefix(true)
      }
    } catch (error) {
      console.log("Error fetching queue data:", error);
    }
    setIsModalOpen(true);
    const modal = document.getElementById(QueueId);
    if (modal) {
      modal.showModal();
    }
  };


  const closeModal = (QueueId) => {
    setIsModalOpen(false);
    setEditedQueue('');
    setEditedAlphabet('');
    const modal = document.getElementById(QueueId);
    if (modal) {
      modal.close();
    }
  }

  const handleEditedQueue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedQueue(event.target.value);
  }

  const handleEditedAlphabet = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedAlphabet(event.target.value);
  }

  const handleSubmit = async (queueId: number) => {
    try {
      const response = await fetch(`/api/queue/${queueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedQueue,
          prefix: editedAlphabet
        })
      })

      if (!response.ok) {
        console.log("Failed to save edited queue")
        return
      }
      
      const data = await response.json()
      console.log("Response:", data)

      mutate(BUSINESS_QUEUES_API_URL);
    } catch (error) {
      console.log("Error save edited queue:", error)
    }
  };

  const handleDeleteClick = async (queueId: number) => {
    try {
      const response = await fetch(`${QUEUE_API_URL}/${queueId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.log("Failed to delete queue")
        return
      }
      const data = await response.json()
      mutate(BUSINESS_QUEUES_API_URL);
    } catch (error) {
      console.log("Error save delete queue:", error)
    }
  };
    
  const handlePrefixToggle = ()=> {
    setIsPrefix(!isPrefix)
    setEditedAlphabet('')
  }

  const handleExplanation = () => {
    setIsExplanation(!isExplanation)
  }

  return (
    <>
        <dialog id={QueueId} className="modal">
        <div className="modal-box">
            <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" >
              ✕
            </button>
            </form>
            <h3 className="font-bold text-lg">Edit Queue</h3>
            <br></br>
            <label className="input input-bordered flex items-center gap-2">
            Queue Name
            <input type="text" 
                  className="grow font-light" 
                  placeholder="Dining" 
                  value={editedQueue} onChange={handleQueueChange} />
            </label>
            <br></br>
            <div className="form-control flex space-x-2">
              <label className="label cursor-pointer">
                <p className='text-sm'>Set Prefix</p>
                <input
                  type="checkbox"
                  className="toggle toggle-success ml-0"
                  checked={isPrefix}
                  onChange={handlePrefixToggle}/>
                <button type="button" className="w-10 h-12 mr-0" onClick={handleExplanation}><HelpOutlineIcon style={{color: 'gray'}}/></button>
              </label>
            </div>
            {isExplanation && (
              <div className="w-full bg-yellow-200 p-1">
                <p className='text-sm font-normal'> If you set a <span className="font-bold">prefix</span> (e.g., A), entries will be numbered like <span className="font-bold">A1, A2, A3,</span> etc.</p>
                <p className='text-sm font-normal'> If you <span className="font-bold">don’t set a prefix</span>, entries will be numbered as <span className="font-bold">1, 2, 3,</span> etc.</p>
              </div>
            )}
            { isPrefix && (
              <label className="input input-bordered flex items-center gap-2">
                Prefix
                <input
                  type="text"
                  className="grow font-light"
                  placeholder="eg. A, B, C"
                  value={editedAlphabet}
                  onChange={handleAlphabetChange}
                />
              </label>)
            }
            
            <br></br>
            <form onSubmit={(e) => { e.preventDefault() }}>
                <div className='flex space-x-3'>
                    <button type="submit" className='btn btn-primary' onClick={handleAddClick}>Save</button>
                    <button type="button" className='btn' onClick={() => handleDeleteClick(QueueId)}>Delete</button>
                </div>
            </form>
        </div>
        </dialog>
        <button className="btn bg-transparent border-none p-0" onClick={() => openModal(QueueId)} key={QueueId}>  
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        </button>
    </>
  )
}

export default EditQueue