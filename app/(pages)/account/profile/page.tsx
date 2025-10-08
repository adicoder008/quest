'use client'
import React, { useState } from 'react';
import { Camera, Check, ChevronLeft, Eye, EyeOff, Pencil } from 'lucide-react';
import Footer from '@/components/phoneComponents/Footer';
import { useRouter } from 'next/navigation'
interface Props { }

function Page(props: Props) {
    const { } = props
    const router = useRouter();
    const navigateTo = (path: string) => {
        router.push(path);
      }
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        bio: '',
        email: '',
        password: '',
        phone: ''
    });

    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageUpload = () => {
        // Handle profile image upload
        console.log('Upload image');
    };

    return (
        <div className="min-h-screen bg-[#121212] flex flex-col">
            {/* Header */}
            <div className='flex justify-between items-center w-full bg-black px-5 py-4'>
                <ChevronLeft onClick={() => navigateTo('/account')} className='text-[#F7CEB0]' size={28} />
                <p className='text-2xl font-semibold text-[#F7CEB0]'>Edit Profile</p>
                <Check className='text-[#F7CEB0]' size={28} />
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <div className="z-10 w-full">
                    <div className='relative w-full h-32'>
                        <div className="flex justify-center mb-8">
                            <img src="/large.png" alt="cover-img" className="w-full h-full object-cover absolute" />

                            <div className="relative top-20">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-1 border-white bg-gray-800">
                                    <img
                                        src="/image 10.png"
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Camera Icon */}
                                <button
                                    onClick={handleImageUpload}
                                    className="absolute bottom-0 right-0 text-white "
                                >
                                    <Camera size={20} />
                                </button>
                            </div>
                            <div className='absolute bg-[#F7CEB0] text-black p-3  rounded-full -bottom-6 right-0'>
                                <Pencil size={30}/>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 p-6 pt-20">
                        {/* Name */}
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#F7CEB0] transition-colors"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#F7CEB0] transition-colors"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <input
                                type="text"
                                name="bio"
                                placeholder="Bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#F7CEB0] transition-colors"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#F7CEB0] transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3.5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#F7CEB0] transition-colors"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Phone */}
                        <div>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#F7CEB0] transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default Page