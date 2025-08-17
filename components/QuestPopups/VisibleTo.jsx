import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import UserAvatar from '../Feed/UserAvatar';

function VisibleTo() {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) return null;
    return (
        <div className='flex justify-center items-center h-[100vh] w-full bg-black/10'>
            <Card className='w-[600px] bg-[#FFF] h-[360px]'>
                <div className='w-[576px] mx-auto p-4'>
                    <div className='flex justify-between'>
                        <p className='font-bold'>Post Settings</p>
                        <img onClick={() => (setIsOpen(false))} src="public\cross.svg" alt="cross" />
                    </div>
                </div>
                <div className='w-[576px] mx-auto border-b-[1px] border-[#C5C4C7]'></div>
                <div className='h-[48px] p-2 mx-auto w-full flex items-center'>
                    <p className='font-bold'>Who can see your Quest?</p>
                </div>

                {/* Form -- checklist */}
                <div>
                    <div className='w-[576px] mx-auto flex flex-col gap-y-[12px]'>
                        <div className='h-[48px] mx-auto my-auto w-full'></div>
                        <div className='h-[48px] mx-auto w-full flex items-center'></div>
                        <div className='h-[48px] mx-auto w-full flex items-center'></div>
                        <div className='w-full mx-auto border-[#C5C4C7] border-b-[1px]'></div>
                    </div>
                    <div className='w-[576px] mx-auto'>
                        <div className='flex justify-end gap-2'>
                            <button className='bg-[#FFF] w-[81px] h-[44px] font-bold text-[#8B8A8F] border border-[#8B8A8F] rounded-lg mt-2'>
                                back
                            </button>
                            <button type='submit' className='bg-[#EA6100] w-[81px] h-[44px] font-bold text-white rounded-lg mt-2'>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default VisibleTo
