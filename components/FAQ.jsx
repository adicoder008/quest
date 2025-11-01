'use client'
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";


const faqs = [
    {
      question: "What exactly is a Quest ?",
      answer:
        " A Quest is a structured and user customized travel plan created by AI. It links routes, stops, and logistics on an interactive map, giving you real, verified insights from people who’ve already been there.",
    },
    {
      question: "How does OnQuest help me plan my trips ?",
      answer:
        " Instead of starting from scratch, you can explore Quests made by other travelers, see their itineraries, and remix them to create your own with no endless scrolling or scattered tips"

    },
    // {
    //   question: "Can I use OnQuest for group travel?",
    //   answer:
    //     "Absolutely! OnQuest allows you to create a travel group, chat with friends, share your location, and split expenses effortlessly.",
    // },
    {
      question: "How do i know OnQuest is reliable and accurate ?",
      answer:
        "Every Quest goes through OnQuest’s 4-tier verification system, combining automated checks, peer validation, AI triangulation, and live data from sources like MapmyIndia — so you can trust what you see.",
    },
    {
      question: "Who can create a Quest?",
      answer: "Anyone! Whether you’re an explorer, trekker, or weekend traveler, you can post your route, share insights, and earn badges as your Quest helps others."
    },
    {
      question: "What makes OnQuest different from Google Maps or TripIt ?",
      answer:
        "OnQuest doesn’t just show routes, it structures and verifies them. It’s where navigation meets storytelling: a community-powered platform built around reliable, hyper-local travel intelligence.",
    },
    {
      question: "How does OnQuest stay free to use ?",
      answer:
        "OnQuest is free for travelers. It’s supported by hyper-local advertising — shown only when relevant, like near your next planned stop, so it enhances your trip instead of interrupting it.",
    },
    {
      question: "What’s included in the Feed ?",
      answer:
      "t’s your travel hub — filled with real Quests from real explorers. Browse what’s trending, save what you love, and turn ideas into your next route."
    },
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

