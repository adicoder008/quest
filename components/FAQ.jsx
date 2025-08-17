'use client'
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";


const faqs = [
    {
      question: "What is OnQuest?",
      answer:
        "OnQuest is an AI-powered travel platform that helps you plan personalized trips, discover local events, and connect with fellow travelers. Our AI companion, Mr. Pebbles, creates smart itineraries tailored to your preferences and budget.",
    },
    {
      question: "How does Mr. Pebbles work?",
      answer:
        "Mr. Pebbles is an AI-driven virtual travel guide that curates the best travel experiences for you. Just enter your destination and preferences, and he’ll generate a customized itinerary, suggest hidden gems, and assist you in real time during your journey.",
    },
    // {
    //   question: "Can I use OnQuest for group travel?",
    //   answer:
    //     "Absolutely! OnQuest allows you to create a travel group, chat with friends, share your location, and split expenses effortlessly.",
    // },
    {
      question: "Does OnQuest help with local events and activities?",
      answer:
        "Yes! Our platform highlights local events, festivals, and must-visit spots in your chosen destination, so you never miss out on exciting experiences.",
    },
    {
      question: "Is OnQuest free to use?",
      answer:
        "We offer a free version with essential trip planning features. Premium users get advanced AI recommendations, priority support, and exclusive local deals.",
    },
    {
      question: "Can I modify my itinerary after it's generated?",
      answer:
        "Yes! You can edit your itinerary at any time. Our AI dynamically adjusts recommendations based on your changes, ensuring a flexible and seamless travel experience.",
    },
    {
      question: "How does OnQuest handle expense splitting?",
      answer:
        "OnQuest has a built-in expense tracker that lets you split bills with friends seamlessly, just like Splitwise.",
    },
    // {
    //   question: "What makes OnQuest different from others?",
    //   answer:
    //     "Unlike traditional travel platforms, OnQuest offers: AI-powered trip planning instead of generic recommendations. A real-time virtual guide (Mr. Pebbles) for instant travel assistance. Integrated expense tracking for hassle-free cost splitting.\n4️⃣ Personalized local event suggestions tailored to your interests.",
    // },
  ];
  

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full  bg-[#FFFFFF]/80 bg-opacity-80 mx-auto p-6">
      <h2 className="text-4xl font-arsenal text-center mb-6 my-10 italic ">Frequently Asked <span className="text-[#F86F0A] font-arsenal italic">Questions ?</span></h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className=" pb-2 border bg-[#FFFFFF]/80 bg-opacity-80 rounded-xl">
              
                  <button
                    className="w-full flex justify-between text-lg font-medium p-3 bg-[#F86F0A]/10 bg-opacity-10 rounded-lg text-left"
                    onClick={() => toggleFAQ(index)}
                  >
                    <div>{faq.question}</div>
                    <FaChevronDown
                    className={`transform transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    />
                  </button>

                  {/* Answer (Sliding up/down) */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? "max-h-[500px] bg- opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="p-3 text-gray-700">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;

