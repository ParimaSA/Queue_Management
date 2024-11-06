'use client'

import React from 'react'
import fetcher from "@/lib/fetcher";
import useSWR, { mutate } from "swr";
import { useEffect, useState } from 'react';
import BusinessNavbar from '../components/BusinessNavbar';
import WeeklyEntryChart from '../WeeklyEntryChart';

const TOP_QUEUE_API_URL = "/api/business/top_queues";

const ProfilePage = () => {
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: top_queue, error: topQueueError } = useSWR(TOP_QUEUE_API_URL, fetcher);
  console.log(top_queue, topQueueError);
  useEffect(() => {
    if (topQueueError) {
      console.log("Failed to load business", topQueueError);
    } else if (!top_queue) {
      console.log("Loading business...");
    } else {
      console.log("Business data:", top_queue);
    }
  }, [top_queue, topQueueError]);


  const handleBusinessNameChange = (event) => {
    setBusinessName(event.target.value);
  }

  const handleBusinessEmailChange = (event) => {
    setBusinessEmail(event.target.value);
  }

  const handleEditClick = () => {
    if (businessName && businessEmail) {
      handleSubmit();
      closeModal();
    }
    else {
      console.log('No queue added');
    }
  }

  const openModal = () => {
    setIsModalOpen(true);
    const modal = document.getElementById('my_modal_3');
    if (modal) {
      modal.showModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBusinessName('');
    setBusinessEmail('');
    const modal = document.getElementById('my_modal_3');
    if (modal) {
      modal.close();
    }
  };

  const handleSubmit = async () => {
    console.log('submit')
  };

  return (
    <>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form onSubmit={handleEditClick}>
            <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>
              ✕
            </button>
            <h3 className="font-bold text-lg">Edit Profile</h3>
            <br />
            <label className="input input-bordered flex items-center gap-2">
              Business Name
              <input
                type="text"
                className="grow font-light"
                placeholder="TeeNoi"
                value={businessName}
                onChange={handleBusinessNameChange}
              />
            </label>
            <br />
            <label className="input input-bordered flex items-center gap-2">
              Alphabet
              <input
                type="text"
                className="grow font-light"
                placeholder="A"
                value={businessEmail}
                onChange={handleBusinessEmailChange}
              />
            </label>
            <br />
            <button type="submit" className="btn btn-primary">Add</button>
          </form>
        </div>
      </dialog>
      <BusinessNavbar />
      <div className='pt-16'/>
      <div className='px-4 md:px-8 lg:px-12 py-4 md:py-8 lg:py-12 min-h-screen bg-cream2'>
        <div className='grid grid-cols-3 gap-4'>
          <div className='col-span-1'>
              <div className="card bg-base-100 w-96 shadow-xl bg-lightPurple4">
                <div className="card-body">
                    <div className='flex justify-end'>
                      <button className="btn rounded-full bg-cream1" onClick={openModal}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Edit
                      </button>
                    </div>
                    <div className='flex justify-center py-3'>
                      <div className="avatar">
                          <div className="w-34 rounded-xl">
                            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                          </div>
                      </div>
                    </div>
                    <div className='text-xl flex justify-center py-4 bg-lightPurple5 rounded-full font-bold'>Business Name</div>
                </div>
              </div>
              <div className='py-6'/>
              <div className='flex space-x-4 px-20'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-9">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
              </svg>
              <div className='text-2xl font-bold'>Top 3 Queues</div>
              <div className='py-8'/>
              </div>
              <div className="overflow-x-auto w-96">
              <table className="table">
                <tbody>
                  {top_queue && top_queue.length > 0 ? (
                    top_queue.map((queue, index) => (
                      <tr key={queue.id} className={`hover text-xl ${index === 0 ? 'bg-lightOrange1' : index === 1 ? 'bg-lightOrange2' : 'bg-lightOrange3'}`}>
                        <th>{index + 1}</th>
                        <td>{queue.name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="text-center">No queues available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className='col-span-2'>
            <div className="card bg-cream w-full h-76 shadow-xl">
              <div className="card-body">
              <h2 className="card-title">Avarage Weekly Entries Chart</h2>
                <div className='h-56 flex justify-center items-center'>
                  <WeeklyEntryChart />
                </div>
              </div>
            </div>
            <div className='pt-8'/>
            <div className="card bg-cream w-full h-76 shadow-xl">
              <div className="card-body">
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage