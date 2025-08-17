import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import UserAvatar from '../Feed/UserAvatar';


function AddLocation() {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) return null;
    return (
        <div className='flex justify-center items-center h-[100vh] w-full bg-black/10'>
            <Card className='w-[600px] bg-[#FFF] h-[276px]'>
                <div className='w-[576px] mx-auto p-4'>
                    <div className='flex justify-between'>
                        <p className='font-bold'>Add Location</p>
                        <img onClick={() => (setIsOpen(false))} src="public\cross.svg" alt="cross" />
                    </div>
                </div>
                <div className='w-[576px] mx-auto border-b-[1px] border-[#C5C4C7]'></div>

                {/* Form --*/}
                <div>
                    <div className='w-[576px] mx-auto flex flex-col gap-y-[12px]'>
                        <div className='h-[40px] mx-auto my-auto w-full flex justify-center items-center'>
                            <input placeholder='Enter Location...' className='border-[1px] border-[#C5C4C7] w-full rounded-md py-1 pl-3 mt-3' type="text" />
                        </div>
                        <div className='h-[24px] mx-auto w-full flex items-center justify-center gap-2'>
                            <div className='w-[50%] border-b-[1px] border-[#C5C4C7]'></div>
                            <p className='text-[#C5C4C7] '>or</p>
                            <div className='w-[50%] border-b-[1px] border-[#C5C4C7]'></div>
                        </div>
                        <div className='h-[40px] mx-auto w-full flex items-center'>
                            <button  className='border-[1px] border-[#C5C4C7] w-full rounded-md py-2 bg-[#F9ECE2]'>
                                <div className='flex justify-center'>
                                <img src="public\tdesign_location.svg" alt="" />
                                Use Current Location
                                </div>
                            </button>
                        </div>
                        <div className='w-full mx-auto border-[#C5C4C7] border-b-[1px]'></div>
                    </div>
                    <div className='w-[576px] mx-auto mt-4'>
                        <div className='flex justify-end gap-2'>
                            <button className='bg-[#FFF] w-[81px] h-[44px] font-bold text-[#8B8A8F] border border-[#8B8A8F] rounded-lg '>
                                back
                            </button>
                            <button type='submit' className='bg-[#EA6100] w-[81px] h-[44px] font-bold text-white rounded-lg '>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default AddLocation
