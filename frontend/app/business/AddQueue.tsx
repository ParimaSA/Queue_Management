'use client';

import React, { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PreviewIcon from '@mui/icons-material/Preview';
import Preview from './Preview';
import useSWR, { mutate } from 'swr';
import fetcher from '@/lib/fetcher';

const BUSINESS_QUEUE_API_URL = "/api/business/queues";
const QUEUE_API_URL = "/api/queue/";

interface AddQueueProps {
  onQueueAdded: () => void;
}

interface Queue {
  id: number; 
  name: string;
  prefix: string;
}


const AddQueue: React.FC<AddQueueProps> = ({ onQueueAdded }) => {
  const [newQueue, setNewQueue] = useState('')
  const [newAlphabet, setNewAlphabet] = useState('')
  const [isPrefix, setIsPrefix] = useState(false)
  const [isExplanation, setIsExplanation] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [allPass, setAllPass] = useState(true)
  const { data: queueData, error: queueError } = useSWR<Queue[]>(BUSINESS_QUEUE_API_URL, fetcher);
  const [allQueue, setAllQueue] = useState<number | null>(null);
  const Alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const hospitalQueues = [
    'Heart', 'Cancer', 'Bone & Spine', 'Brain', 'Trauma', 'Health Check-up', 
    'Surgery', 'Dental Care', 'Mother & Child', 'Liver & Gallbladder', 
    'Recovery & Rehabilitation', 'Female Wellness', 'Male Wellness', 
    'Child Wellness', 'Geriatric', 'Eye & Ent'
  ];
  const restaurantQueues = [
    'Reservation', 'Walk-in', 'Takeaway', 'Delivery', 'Order Pickup', 'Payment'
  ];

  const bankQueues = [
    'Deposit/Withdraw', 'Pay Bills/Installments', 'Open Account/ATM/CC', 
    'Cheque Services', 'Invest in Funds', 'Buy Insurance', 'Personal Loans', 
    'Auto Loans/Insurance'
  ];
  
  const governmentServiceQueues = [
    'Driving License', 'Vehicle Tax', 'Vehicle Reg', 'Excise Tax', 'e-Excise', 
    'Alcohol/Tobacco License', 'Healthcare License', 'Health Spa License', 
    'Health Course Cert', 'Pollution Report', 'Hazardous Material License', 
    'Machinery Registration', 'Unemployment Benefits', 'Pension Benefits', 
    'Social Security', 'Tour Guide License', 'Tourism Standards', 
    'Direct Selling Reg', 'Online Sales Reg'
  ];

  const airportQueues = [
    'Check-in (Regular)', 
    'Check-in (Priority)', 
    'Security (Standard)', 
    'Security (Fast Track)', 
    'Immigration (Regular)', 
    'Immigration (Fast Track)', 
    'Baggage Claim (Domestic)', 
    'Baggage Claim (International)', 
    'Customs (Regular)', 
    'Customs (Duty-Free)', 
    'Boarding (Regular)', 
    'Boarding (Priority)'
  ];

  useEffect(() => {
    if (queueData && queueData.length > 0) {
      setAllQueue(queueData[0].id);
      console.log("1: ", allQueue)
    }
  }, [queueData]);

  useEffect(() => {
    console.log("Updated allQueue: ", allQueue);
  }, [allQueue]);

  const handleQueueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewQueue(event.target.value)
  };

  const handleAlphabetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewAlphabet(event.target.value)
  };

  const handleAddClick = async (event: React.FormEvent<HTMLFormElement> ) => {
    event.preventDefault(); 
    if (newQueue && (newAlphabet || !isPrefix)) {
      console.log('New Queue:', newQueue);
      console.log('New Alphabet:', newAlphabet);
      const response = await createNewQueue(newQueue, newAlphabet);
      if (!response?.errorData) {
        console.log("success add queue")
        onQueueAdded();
        toast.success(`Queue ${newQueue} is successfully created.`, {style: { marginTop: "70px" }})
      }
      else{
        toast.error(`${response.errorData}`, { style: { marginTop: "70px" } });
      }
      closeModal();
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
        return {errorData: data.error};
      }
      return
    } catch (error) {
      return {errorData: `Error creating queue: ${error}`};
    }
  };

  const openModal = () => {
    const modal = document.getElementById('my_modal_3') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  const openTemplateModal = () => {
    const modal = document.getElementById('modal_template') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  const closeModal = () => {
    setIsExplanation(false)
    setIsPreview(false)
    setNewQueue('');
    setNewAlphabet('');
    const modal = document.getElementById('my_modal_3') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  };

  const closeTemplateModal = () => {
    const modal = document.getElementById('modal_template') as HTMLDialogElement;
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

  const addTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const templates: Record<string, string[]> = {
      'Restaurant': restaurantQueues,
      'Hospital': hospitalQueues,
      'Bank': bankQueues,
      'Government Service Center': governmentServiceQueues,
      'Airport': airportQueues,
    }

    if (selectedTemplate && templates) {
      const Template = templates[selectedTemplate];

      if (!Template) {
        toast.error('Invalid template selected!', { style: { marginTop: "70px" } });
        return;
      }
      setAllPass(true)
      for (const [index, queue] of Template.entries()) {
        const response = await createNewQueue(queue, Alphabet[index]);
        if (!response?.errorData){
          onQueueAdded();
        }
        else if (response.errorData.includes("maximum")){
          setAllPass(false)
          toast.error(`${response.errorData}`, { style: { marginTop: "70px" } });
          break
        }
        else{
          setAllPass(false)
          toast.error(`${response.errorData}`, { style: { marginTop: "70px" } });
        }
      }
      if (allPass) {
        toast.success('All queues have been added!', { style: { marginTop: "70px" } });
      }
      closeTemplateModal();
    }
  };

  const handleDeleteAll = async () => {
    try {
      for (const queue of queueData || []) {
        console.log("delete: ", queue.name);
        const response = await fetch(`${QUEUE_API_URL}/${queue.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) {
          console.error("Failed to delete queue: ", queueError);
          return;
        }
      }
      mutate(BUSINESS_QUEUE_API_URL);
    } catch (error) {
      console.error("Error occurred while deleting queues:", error);
    }
  };
  
  return (
    <>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form onSubmit={handleAddClick}>
            <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>
              ✕
            </button>
            <div className='flex justify-between mt-4'>
              <h3 className="font-bold text-lg">Add Queue</h3>
              <button type="button" className="text-sm mr-0 flex justify-end text-darkGreen2" onClick={handlePreview}>See Preview <PreviewIcon/></button>
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
            { isPreview && (newQueue && (newAlphabet || !isPrefix)) && (<Preview newQueue={Array.isArray(newQueue) ? newQueue : [newQueue]} newAlphabet={Array.isArray(newAlphabet) ? newAlphabet : [newAlphabet]} />)}
            <br />
            <div className='form-control flex space-x-2'>
              <button type="submit" className="btn btn-primary bg-hotPink hover:bg-darkPink border-white">Add</button>
            </div>              
          </form>
        </div>
      </dialog>
      <dialog id="modal_template" className="modal">
        <div className="modal-box w-[80%] lg:max-w-4xl md:max-w-2xl sm:max-w-lg h-[80%]">
          <form onSubmit={addTemplate}>
            <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeTemplateModal}>
              ✕
            </button>
            <h2 className='mb-4'>Select Queue Template</h2>
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div>
                <button className={`btn w-full p-3 rounded-full ${selectedTemplate === "Restaurant" ? "bg-gray-300" : "bg-lightPurple8"}`} type="button" onClick={() => selectTemplate("Restaurant")}>
                  Restaurant
                </button>
              </div>
              <div>
                <button className={`btn w-full p-3 rounded-full ${selectedTemplate === "Hospital" ? "bg-gray-300" : "bg-lightYellow"}`} type="button" onClick={() => selectTemplate("Hospital")}>
                  Hospital
                </button>
              </div>
              <div>
                <button className={`btn w-full p-3 rounded-full ${selectedTemplate === "Bank" ? "bg-gray-300" : "bg-lightSky"}`} type="button" onClick={() => selectTemplate("Bank")}>
                  Bank
                </button>
              </div>
              <div>
                <button className={`btn w-full p-3 rounded-full ${selectedTemplate === "Government Service Center" ? "bg-gray-300" : "bg-lightGreen6"}`} type="button" onClick={() => selectTemplate("Government Service Center")}>
                  Government Service Center
                </button>
              </div>
              <div>
                <button className={`btn w-full p-3 rounded-full ${selectedTemplate === "Airport" ? "bg-gray-300" : "bg-lightPink3"}`} type="button" onClick={() => selectTemplate("Airport")}>
                  Airport
                </button>
              </div>
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
              {selectedTemplate === 'Government Service Center' && (
                <Preview 
                  newQueue={governmentServiceQueues} 
                  newAlphabet={Alphabet.slice(0, governmentServiceQueues.length)} 
                />
              )}
              {selectedTemplate === 'Airport' && (
                <Preview 
                  newQueue={airportQueues} 
                  newAlphabet={Alphabet.slice(0, airportQueues.length)} 
                />
              )}
              <div className='form-control flex space-x-2 mt-5'>
                <button type="submit" className="btn btn-primary bg-hotPink hover:bg-darkPink border-white">Add {selectedTemplate} Template</button>
              </div> 
            </div>
          ): <p className="text-xl text-center mt-10 text-gray-500">Please select queue template to see preview</p>}       
          </form>
        </div>
      </dialog>
      <div className="flex space-x-2">
        <button className="btn flex justify-end bg-lightPurple8 hover:bg-purple" onClick={openTemplateModal}>Queue Template</button>
        <button className="btn bg-lightPurple8 hover:bg-purple" onClick={openModal}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
        </svg>
          Add Queue
        </button>
        <button className="btn bg-lightPurple1 hover:bg-purple rounded-full" onClick={handleDeleteAll}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
        </button>
      </div>
    </>
  );
};

export default AddQueue;