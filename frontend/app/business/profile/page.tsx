'use client'

import React from 'react'
import fetcher from "@/lib/fetcher";
import useSWR, { mutate } from "swr";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from "react-toastify";
import BusinessNavbar from '../components/BusinessNavbar';
import WeeklyEntryChart from '../WeeklyEntryChart';
import EntryTimeChart from '../EntryTimeChart';
import EstimateTimeChart from '../EstimateTimeChart';
import EstimateDayChart from '../EstimateDayChart';
import TopQueue from '../TopQueue';

const MY_BUSINESS_API_URL = "/api/business/";
const MY_BUSINESS_PROFILE_URL = "/api/business/profile"

interface Business {
  id: number;           
  name: string;        
  open_time: string;  
  close_time: string; 
  image: string | null; 
}


const ProfilePage = () => {
  const [businessName, setBusinessName] = useState('');
  const [businessOpenTime, setBusinessOpenTime] = useState('');
  const [businessCloseTime, setBusinessCloseTime] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // New file to be uploaded
  // const [selectedFile, setSelectedFile] = useState(null); // New file to be uploaded
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Handles preview image
  const { data: my_business, error: myBusinessError } = useSWR<Business[]>(MY_BUSINESS_API_URL, fetcher)
  const { data: profile } = useSWR(MY_BUSINESS_PROFILE_URL, fetcher);
  useEffect(() => {
    if (profile) {
      setProfileImage(profile.image);
    }
  }, [profile]);

  console.log("Profile: ", profileImage)

  useEffect(() => {
    if (myBusinessError) {
      console.log("Failed to load business", myBusinessError);
    } else if (!my_business) {
      console.log("Loading business...");
    } else {
      console.log("Business data:", my_business);
    }
  }, [my_business, myBusinessError]);

  useEffect(() => {
    if (!isModalOpen) {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;;
        if (fileInput) {
            fileInput.value = ''; 
        }
    }
}, [isModalOpen]);
  const handleBusinessNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessName(event.target.value);
  }

  const handleOpenTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessOpenTime(event.target.value);
  }

  const handleCloseTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessCloseTime(event.target.value);
  }


  const isValidImageFile = (file: File): boolean => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    const lowerCaseName = file.name.toLowerCase();
    const isExtensionValid = imageExtensions.some((ext) => lowerCaseName.endsWith(ext));
    return file.type.startsWith("image/") && isExtensionValid;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      if (isValidImageFile(file)) {
        setSelectedFile(file); // Capture the selected file
        console.log("This is a valid image file.");
        const previewUrl = URL.createObjectURL(file); // Generate a temporary preview URL
        setPreviewImage(previewUrl);
      } else {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;;
        if (fileInput) {
            fileInput.value = ''; // Reset file input value
        }
        alert("Please select a valid image file.");
        
      }
    } else {
        setPreviewImage(profile.image); // Reset preview if no file is selected
    }
  }


  const handleEditClick = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (businessName && businessOpenTime && businessCloseTime) {
      handleSubmit();
      closeModal();
    }
    else {
      console.log('No business details');
    }
  }

  const openModal = () => {
    setIsModalOpen(true);
    if (my_business && my_business.length > 0) {
      const business = my_business[0];
      setBusinessName(business.name);
      setBusinessOpenTime(business.open_time);
      setBusinessCloseTime(business.close_time);
      setPreviewImage(business.image);
          }
    const modal = document.getElementById('profile_modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBusinessName('');
    setBusinessOpenTime('');
    setBusinessCloseTime('');
    setSelectedFile(null);
    setPreviewImage(null);
    const modal = document.getElementById('profile_modal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  };


  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/business/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: businessName,
            open_time: businessOpenTime,
            close_time: businessCloseTime,
        })
      })

      if (!response.ok) {
        console.log("Failed to save edited business")
        toast.error("Failed to save edited business", {style: { marginTop: "70px" }})
        return
      }
      
      const data = await response.json()
      console.log("Response:", data)

      mutate(MY_BUSINESS_API_URL);
    } catch (error) {
      console.log("Error save edited business:", error)
      
    }

    console.log(businessName, businessOpenTime, businessCloseTime);

    const formData = new FormData();

    if (selectedFile instanceof File) {
        formData.append("file", selectedFile, selectedFile.name); // Append file with name
        console.log("File appended:", selectedFile.name);
    } else {
        console.log("No valid file selected");
        return;
    }

    try {
        const response = await fetch(MY_BUSINESS_PROFILE_URL, {
            method: "POST",
            body: formData, // Automatically sets the content type for multipart/form-data
        });

        if (!response.ok) {
            console.log("Failed to save new profile image");
            return;
        }

        // Update data and close modal upon successful submission
        // mutate(MY_BUSINESS_API_URL);
        mutate(MY_BUSINESS_PROFILE_URL);
        // closeModal();
    } catch (error) {
        console.log("Error saving edited business profile:", error);
    }
    closeModal();
};


  return (
    <>
      <dialog id="profile_modal" className="modal">
        <div className="modal-box">
          <form onSubmit={handleEditClick}>
            <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>
              ✕
            </button>
            <div className='mb-2'>
              <h3 className="font-bold text-lg">Edit Profile</h3>
            </div>
            <div className='flex justify-center items-center'>
              <div className="avatar">
              <div className="w-34 rounded-xl">
              {previewImage ? (
                <Image src={previewImage} alt="Profile" width={500} height={300} />
              ) : profileImage ? (
                <Image src={profileImage} alt="Profile" width={500} height={300} />
              ) : (
                <Image src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt="Default profile" width={500} height={300}/>
              )}

                </div>
              </div>
            </div>
            <br/>
            <div className='mb-4'>
              <input type="file" className="file-input file-input-bordered file-input-sm w-full rounded-full" onChange={handleFileChange} />
            </div>
            <label className="input input-bordered flex items-center gap-2 font-bold mb-4 rounded-full">
              Business Name
              <input
                type="text"
                className="grow font-light"
                placeholder={businessName}
                value={businessName}
                onChange={handleBusinessNameChange}
              />
            </label>
            <label className="input input-bordered flex items-center gap-2 font-bold mb-4 rounded-full">
              Open Time
              <input
                type="text"
                className="grow font-light"
                placeholder={businessOpenTime}
                value={businessOpenTime}
                onChange={handleOpenTimeChange}
              />
            </label>
            <label className="input input-bordered flex items-center gap-2 font-bold mb-4 rounded-full">
              Close Time
              <input
                type="text"
                className="grow font-light"
                placeholder={businessCloseTime}
                value={businessCloseTime}
                onChange={handleCloseTimeChange}
              />
            </label>
            <br />
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
        </div>
      </dialog>
      <BusinessNavbar />
      <div className='pt-16'/>
      <div className='px-4 sm:px-4 sm:py-4 md:px-8 lg:px-12 py-4 md:py-8 lg:py-12 min-h-screen bg-cream2'>
        <div className='grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4'>
          <div className='lg:col-span-1 md:col-span-3 sm:col-span-3'>
              <div className="card bg-base-100 sm:w-full md:w-full lg:w-96 shadow-xl bg-lightPurple4">
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
                          {profileImage ? (
                            <Image 
                              src={profileImage} 
                              alt="User Profile Image" 
                              width={500} 
                              height={300} 
                              className="object-cover rounded-xl"
                            />
                          ) : (
                            <Image 
                              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" 
                              alt="Default Profile" 
                              width={500} 
                              height={300} 
                              className="object-cover rounded-xl"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    {my_business ? (
                      my_business.map(business => (
                        <div
                          key={business.id}
                          className='text-xl flex justify-center py-4 bg-lightPurple5 rounded-full font-bold'
                        >
                          {business.name}
                        </div>
                      ))
                    ) : null}
                </div>
              </div>
              <div className='py-6'/>
              <TopQueue />
          </div>
          <div className='lg:col-span-2 md:col-span-3 sm:col-span-3 ml-0'>
          <div role="tablist" className="tabs tabs-lifted">
            <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Time" defaultChecked/>
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6 w-full h-full" >
                <div className="card bg-cream w-full h-76 shadow-xl">
                  <div className="card-body">
                  <h2 className="card-title">Time Slot Entries Chart</h2>
                    <div className='h-56 w-full flex justify-center items-center'>
                      <EntryTimeChart />
                    </div>
                  </div>
                </div>
                <div className='pt-8'/>
                <div className="card bg-cream w-full h-76 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">Waiting Time by Time Slot Chart</h2>
                      <div className='h-56 w-full flex justify-center items-center'>
                        <EstimateTimeChart/>
                      </div>
                  </div>
                </div>
          </div>  
            <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Day"/>
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6 w-full h-full">
                <div className="card bg-cream w-full h-76 shadow-xl">
                  <div className="card-body">
                  <h2 className="card-title">Average Weekly Entries Chart</h2>
                    <div className='h-56 w-full flex justify-center items-center'>
                      <WeeklyEntryChart />
                    </div>
                  </div>
                </div>
                <div className='pt-8'/>
                <div className="card bg-cream w-full h-76 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">Waiting Time by Day Chart</h2>
                      <div className='h-56 w-full flex justify-center items-center'>
                        <EstimateDayChart/>
                      </div>
                  </div>
                </div>
            </div>

            {/* <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Queue" />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6 w-full h-full">
              Tab content 3
            </div> */}
          </div>
        </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage;