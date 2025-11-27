// import React from 'react'

// const Features = () => {
//   return (
//     <>
//     <div className="bg-[url('/bgc.svg')] h-[600px] flex justify-around  ">
//         <img src="./Mobile1.svg" alt="" />
//         <img src="./Mobile2.svg" alt="" />
//     </div>

//     </>
//   )
// }

// export default Features

// ..................................

// import React from 'react'

// const Features = () => {
//   return (
//     <>
//       {/* Desktop/Laptop Layout */}
//       <div className="hidden md:flex bg-[url('/bgc.svg')] h-[600px] justify-around items-center">
//         <img src="/Mobile1.svg" alt="" />
//         <img src="/Mobile2.svg" alt="" />
//       </div>

//       {/* Tablet + Mobile Sliding Layout */}
//       <div className="flex md:hidden bg-[url('/bgc.svg')] h-[600px] overflow-hidden items-center justify-center">
//         <div className="flex animate-slide gap-10">
//           <img src="/Mobile1.svg" className="w-[250px]" />
//           <img src="/Mobile2.svg" className="w-[250px]" />
//           <img src="/Mobile1.svg" className="w-[250px]" />
//           <img src="/Mobile2.svg" className="w-[250px]" />
//         </div>
//       </div>
//     </>
//   )
// }

// export default Features

// .........................


import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'

const Features = () => {
    const [emblaRef] = useEmblaCarousel({ loop: false })

    return (
        <>
            {/* Desktop/Laptop Layout */}
            <div className="bg-[url('/bgc.svg')] bg-cover bg-center h-[120vh] flex flex-col items-center pt-10">

                {/* Heading */}
                <h1 className="text-xl md:text-3xl font-semibold mb-10">
                    INTRODUCING QUESTS
                </h1>

                {/* Desktop layout */}
                <div className="hidden md:flex justify-around items-center gap-10 w-full max-w-5xl">
                    <img src="/Mobile1.svg" className="w-[400px]" />
                    <img src="/Mobile2.svg" className="w-[400px]" />
                </div>

                {/* Mobile/tablet swipeable layout (Embla Carousel) */}
                <div className="md:hidden w-full overflow-hidden" ref={emblaRef}>
                    <div className="flex touch-pan-y">
                        <div className="flex-[0_0_80%] min-w-0 pl-4 flex justify-center">
                            <img src="/Mobile1.svg" className="w-[280px] object-contain" />
                        </div>
                        <div className="flex-[0_0_80%] min-w-0 pl-4 flex justify-center">
                            <img src="/Mobile2.svg" className="w-[280px] object-contain" />
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Features
