import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import UserAvatar from '../Feed/UserAvatar';

const PostQuest = () => {
      const [isOpen, setIsOpen] = useState(true);

      if (!isOpen) return null;

    return (
        <div className='flex justify-center items-center h-[100vh] w-full bg-black/10'>
            <Card className='w-[600px] bg-[#FFF] h-[569px]'>
                <div className='w-[576px] mx-auto p-4'>
                    <div className='flex justify-between'>
                        <p className='font-bold'>Post Quest</p>
                        <img onClick={()=>(setIsOpen(false))} src="public\cross.svg" alt="cross" />
                    </div>
                </div>
                <div className='w-[576px] mx-auto border-b-[1px] border-[#C5C4C7]'></div>
                <div className='w-[576px] mx-auto flex flex-col gap-y-[12px]'>
                    <div className='h-[57px] p-2 mx-auto w-full flex items-center'>
                        <UserAvatar
                            src="https://cdn.builder.io/api/v1/image/assets/b783a7681e9247dfa6d0b0f79c8d7bb8/5a2a7a7ce8131f512e49834519610d7a24d14fcf?placeholderIfAbsent=true"
                            alt="Profile picture"
                        />
                        <div className='p-2'>
                            <p className='font-bold'>Osama Bin Laden</p>
                            <button className='text-sm border rounded-full px-2 border-[#616161] text-[#616161] flex gap-1'>
                                <img src="public\fluent-mdl2_world.svg" alt="" />
                                Anyone
                                <img src="public\mdi_chevron-down.svg" alt="" />
                            </button>
                        </div>
                    </div>
                    <div className='h-[196px] mx-auto my-auto w-full border-2 border-[#C5C4C7] bg-[#EEEEEE] rounded-lg'>
                        <div className='h-[180px] w-[556px] m-2 border-[1px] rounded-lg border-black border-dashed flex items-center justify-center '>
                            <div className='flex flex-col justify-center items-center gap-2'>
                                <img className='w-6' src="public\material-symbols_image-outline.svg" alt="" />
                                <p>Upload a cover image</p>
                                <button className='px-3 py-2 bg-[#8B8A8F] text-white font-bold rounded-xl'>
                                    Browse
                                </button>

                            </div>
                        </div>
                    </div>
                    <div className=' h-[40px] mx-auto w-full border-2 border-[#C5C4C7] rounded-lg flex items-center'>
                        <button className='flex justify-between p-2 w-full'>
                            <div className='flex gap-3 items-center'>
                                <img src="public\tdesign_location.svg" alt="" />
                                <p className='font-semibold'>Add Location</p>
                            </div>
                            <div className='' >
                                <img src="public\material-symbols_chevron-left.svg" alt="" />
                            </div>
                        </button>
                    </div>
                    <div className=' h-[40px] mx-auto w-full border-2 border-[#C5C4C7] rounded-lg  flex items-center'>
                        <button className='flex gap-3 justify-between p-2 w-full'>
                            <div className='flex gap-3 items-center'>
                                <img src="public\mingcute_group-2-fill.svg" alt="" />
                                <p className='font-semibold'>Add Co-owners </p>
                            </div>
                            <img src="public\material-symbols_chevron-left.svg" alt="" />
                        </button>
                    </div>
                    <div className=' h-[40px] mx-auto w-full border-2 border-[#C5C4C7] rounded-lg flex items-center'>
                        <button className='flex gap-3 justify-between p-2 w-full'>
                            <div className='flex gap-3 items-center'>
                                <img src="public\lucide_tag.svg" alt="" />
                                <p className='font-semibold'> Add Tags</p>
                            </div>
                            <img src="public\material-symbols_chevron-left.svg" alt="" />
                        </button>
                    </div>
                    <div className='w-full mx-auto border-[#C5C4C7] border-b-[1px]'></div>
                </div>
                <div className='w-[576px] mx-auto'>
                    <div className='flex justify-end'>
                        <button className='bg-[#EA6100] w-[81px] h-[44px] font-bold text-white rounded-lg mt-3'>
                            Post
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PostQuest;



