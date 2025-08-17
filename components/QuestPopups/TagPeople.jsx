import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import UserAvatar from '../Feed/UserAvatar';


function TagPeople() {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) return null;
    return (
        <div className='flex justify-center items-center h-[100vh] w-full bg-black/10'>
            <Card className='w-[600px] bg-[#FFF] h-[353px]'>
                <div className='w-[576px] mx-auto p-4'>
                    <div className='flex justify-between'>
                        <p className='font-bold'>Add Co-Owner</p>
                        <img onClick={() => (setIsOpen(false))} src="public\cross.svg" alt="cross" />
                    </div>
                </div>
                <div className='w-[576px] mx-auto border-b-[1px] border-[#C5C4C7]'></div>
                {/* Form --*/}
                <div>
                    <div className='w-[576px] mx-auto flex flex-col gap-y-[12px]'>

                        {/* search */}
                        <div className='border-[1px] border-[#C5C4C7] pl-3 mt-3 rounded-md h-[40px] mx-auto my-auto w-full flex justify-start gap-2'>
                            <img src="public/iconamoon_search-light.svg" alt="" />
                            <input placeholder='Search...'
                                className=' w-full' type="text" />
                        </div>
                        <div className='h-[21px] mx-auto w-full flex items-center justify-start gap-2'>
                            <p>People in your connection</p>
                        </div>
                        <div className='h-[32px] mx-auto w-full flex items-center'>
                            <div className='p-2 mx-auto w-full flex items-center'>
                                <UserAvatar
                                className='w-[32px]'
                                    src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/5a2a7a7ce8131f512e49834519610d7a24d14fcf?placeholderIfAbsent=true"
                                    alt="Profile picture"
                                />
                                <div className='p-2'>
                                    <p>Osama Bin Laden</p>
                                </div>
                            </div>
                        </div>
                        <div className='h-[32px] mx-auto w-full flex items-center'>
                            <div className='p-2 mx-auto w-full flex items-center'>
                                <UserAvatar
                                className='w-[32px]'
                                    src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/5a2a7a7ce8131f512e49834519610d7a24d14fcf?placeholderIfAbsent=true"
                                    alt="Profile picture"
                                />
                                <div className='p-2'>
                                    <p>Osama Bin Laden</p>
                                </div>
                            </div>
                        </div>
                        <div className='h-[32px] mx-auto w-full flex items-center'>
                            <div className='p-2 mx-auto w-full flex items-center'>
                                <UserAvatar
                                className='w-[32px]'
                                    src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/5a2a7a7ce8131f512e49834519610d7a24d14fcf?placeholderIfAbsent=true"
                                    alt="Profile picture"
                                />
                                <div className='p-2'>
                                    <p>Osama Bin Laden</p>
                                </div>
                            </div>
                        </div>
                        <div className='w-full mx-auto border-[#C5C4C7] border-b-[1px]'></div>
                    </div>
                    <div className='w-[576px] mx-auto mt-3'>
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

export default TagPeople
