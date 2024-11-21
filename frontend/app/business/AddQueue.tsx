'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from "react-toastify";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PreviewIcon from '@mui/icons-material/Preview';
import Preview from './Preview';
import { mutate } from 'swr';

const BUSINESS_QUEUE_API_URL = "/api/business/queues";


const AddQueue = ({ business_data, onQueueAdded }) => {
  const [newQueue, setNewQueue] = useState('')
  const [newAlphabet, setNewAlphabet] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPrefix, setIsPrefix] = useState(false)
  const [isExplanation, setIsExplanation] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [addedQueues, setAddedQueues] = useState([]);
  const Alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const hospitalQueues = [
    'Heart', 'Cancer', 'Bone & Spine', 'Brain', 'Trauma', 'Health Check-up', 
    'Surgery', 'Dental Care', 'Mother & Child', 'Liver & Gallbladder', 
    'Recovery & Rehabilitation', 'Female Wellness', 'Male Wellness', 
    'Child Wellness', 'Geriatric', 'Eye & Ent'
  ];
  const restaurantQueues = [
    'Reservation', 'Walk-in', 'Takeaway', 'Delivery', 'Order Pickup', 'Payment', 'VIP or Priority'
  ];

  const bankQueues = [
    'Deposit/Withdraw/Transfer', 'Pay Bills/Make Installment Payments', 
    'Open Account/ATM/Credit Card', 'Cheque Services', 
    'Consult/Invest in Mutual Funds', 'Consult/Buy Insurance', 
    'Personal/Home Loans', 'Auto Loans/Insurance'
];


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
        toast.success(`Queue ${newQueue} is successfully created.`, {style: { marginTop: "70px" }})
        closeAddModal();
      }
      else {
        toast.error(`Queue ${newQueue} can not be created.`, {style: { marginTop: "70px" }})
      }
    } else {
      console.log('No queue added');
    }
    closeAddModal();
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
        return false;
      }
      return true
    } catch (error) {
      console.log('Error creating queue:', error);
      return false
    }
  };

  const openAddModal = () => {
    setIsModalOpen(true);
    const modal = document.getElementById('my_modal_3');
    if (modal) {
      modal.showModal();
    }
  };

  const openTemplateModal = () => {
    setIsModalOpen(true);
    const modal = document.getElementById('modal_template');
    if (modal) {
      modal.showModal();
    }
  };

  const closeAddModal = () => {
    setIsExplanation(false)
    setIsPreview(false)
    setIsModalOpen(false);
    setNewQueue('');
    setNewAlphabet('');
    const modal = document.getElementById('my_modal_3');
    if (modal) {
      modal.close();
    }
  };

  const closeTemplateModal = () => {
    setIsModalOpen(false);
    setNewQueue('');
    setNewAlphabet('');
    const modal = document.getElementById('modal_template');
    if (modal) {
      modal.close();
    }
  };

  const handlePrefixToggle = ()=> {
    setIsPrefix(!isPrefix)
    setNewAlphabet('')
  }

  const handleExplanation = () => {
    setIsExplanation(!isExplanation)
  }

  const handlePreview = () => {
    setIsPreview(!isPreview)
    if (!isPreview && !(newQueue && (newAlphabet || !isPrefix))){
      toast.warning('Preview: You have not set any value.', {style: { marginTop: "70px" }})
      setIsPreview(false)
    }
  }

  const selectTemplate = (template: string) => {
    setSelectedTemplate(template);
  }

  const addTemplate = async (event) => {
    event.preventDefault();
    const templates = {
      'Restaurant': restaurantQueues,
      'Hospital': hospitalQueues,
      'Bank': bankQueues,
    }
    const Template = templates[selectedTemplate];
    if (!Template) {
      toast.error('Invalid template selected!', { style: { marginTop: "70px" } });
      return;
    }

    for (const [index, queue] of Template.entries()) {
      const success = await createNewQueue(queue, Alphabet[index]);
      if (!success) {
        toast.error(`Failed to add queue: ${queue}`, { style: { marginTop: "70px" } });
      }
      onQueueAdded();
    }
    closeTemplateModal();
      toast.success('All queues have been added!', { style: { marginTop: "70px" } });
  };
  return (
    <>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form onSubmit={handleAddClick}>
            <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeAddModal}>
              ✕
            </button>
            <div className='flex justify-between mt-4'>
              <h3 className="font-bold text-lg">Add Queue</h3>
              <button type="button" className="text-sm mr-0 flex justify-end text-blue-500" onClick={handlePreview}>See Preview <PreviewIcon/></button>
            </div>
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
                <button type="button" className="w-10 h-12 mr-0" onClick={handleExplanation}><HelpOutlineIcon style={{color: 'gray'}}/></button>
              </label>
            </div>
            { isPrefix && (
              <label className="input input-bordered flex items-center gap-2">
                Prefix
                <input
                  type="text"
                  className="grow font-light"
                  placeholder="eg. A, B, C"
                  value={newAlphabet}
                  onChange={handleAlphabetChange}
                />
              </label>)
            }
            {isExplanation && (
              <div className="w-full bg-yellow-200 p-1">
                <p className='text-sm font-normal'> If you set a <span className="font-bold">prefix</span> (e.g., A), entries will be numbered like <span className="font-bold">A1, A2, A3,</span> etc.</p>
                <p className='text-sm font-normal'> If you <span className="font-bold">don’t set a prefix</span>, entries will be numbered as <span className="font-bold">1, 2, 3,</span> etc.</p>
              </div>
            )}
            { isPreview && (newQueue && (newAlphabet || !isPrefix)) && (<Preview newQueue={newQueue} newAlphabet={newAlphabet} />)}
            <br />
            <div className='form-control flex space-x-2'>
              <button type="submit" className="btn btn-primary">Add</button>
            </div>              
          </form>
        </div>
      </dialog>
      <dialog id="modal_template" className="modal">
        <div className="modal-box w-[80%] max-w-4xl h-[80%]">
          <form onSubmit={addTemplate}>
            <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeTemplateModal}>
              ✕
            </button>
            <h2 className='mb-4'>Select Queue Template</h2>
            <div className="flex space-x-4">
              <button className={`btn rounded-full ${selectedTemplate === "Restaurant" ? "bg-gray-300" : "bg-lightPurple5"}`} type="button" onClick={() => selectTemplate("Restaurant")}>
                Restaurant
              </button>
              <button className={`btn rounded-full ${selectedTemplate === "Hospital" ? "bg-gray-300" : "bg-lightYellow"}`} type="button" onClick={() => selectTemplate("Hospital")}>
                Hospital
              </button>
              <button className={`btn rounded-full ${selectedTemplate === "Bank" ? "bg-gray-300" : "bg-lightSky"}`} type="button" onClick={() => selectTemplate("Bank")}>
                Bank
              </button>
              <button className={`btn rounded-full ${selectedTemplate === "Government Service Center" ? "bg-gray-300" : "bg-lightOrange2"}`} type="button" onClick={() => selectTemplate("Government Service Center")}>
                Government Service Center
              </button>
            </div>    
            {/* Template Preview */}
          {selectedTemplate ? (
            <div className="mt-6">
              {selectedTemplate === 'Restaurant' && (
                <Preview 
                  newQueue={restaurantQueues} 
                  newAlphabet={Alphabet.slice(0, restaurantQueues.length)} 
                />
              )}
              {selectedTemplate === 'Hospital' && (
                <Preview 
                  newQueue={hospitalQueues} 
                  newAlphabet={Alphabet.slice(0, hospitalQueues.length)} 
                />
              )}
              {selectedTemplate === 'Bank' && (
                <Preview 
                  newQueue={bankQueues} 
                  newAlphabet={Alphabet.slice(0, bankQueues.length)} 
                />
              )}
              <div className='form-control flex space-x-2 mt-5'>
                <button type="submit" className="btn btn-primary">Add {selectedTemplate} Template</button>
              </div> 
            </div>
          ): <p className="text-xl text-center mt-10 text-gray-500">Please select queue template to see preview</p>}       
          </form>
        </div>
      </dialog>
      <div className="flex space-x-2">
        <button className="btn flex justify-end" onClick={openTemplateModal}>Queue Template</button>
        <button className="btn" onClick={openAddModal}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
        </svg>
          Add Queue
        </button>
      </div>
    </>
  );
};

export default AddQueue;