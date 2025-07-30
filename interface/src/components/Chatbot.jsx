import { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [openFAQ, setOpenFAQ] = useState(null);

  const askQuestion = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/chatbot', { question });
      setAnswer(res.data.answer);
    } catch {
      setAnswer('Error fetching response.');
    }
  };

  const faqData = [
    {
      id: 1,
      question: "Is RoboAnalyzer a free software?",
      answer: "We would like to term this as \"Priceless Software\" as it has immense value for a zero cost. The developers believe that \"Free Software\" word has lost its value and hence the new term!"
    },
    {
      id: 2,
      question: "Why am I not able to launch RoboAnalyzer application?",
      answer: "Most likely, you have tried to launch RoboAnalyzer.exe from a zip folder. Kindly unzip the folder and launch the application from the unzipped folder."
    },
    {
      id: 3,
      question: "Why is the 3D CAD model of the robot not loaded? I only see few coordinate frames.",
      answer: "3D CAD models of robots are not loaded maybe because of Operating System (OS) setting which considers comma for decimal. Kindly make OS settings to consider dot as decimal delimeter and the models shall be shown. We are working on fixing this issue."
    },
    {
      id: 4,
      question: "Is Undo feature supported in RoboAnalyzer and Virtual Robot Module (VRM)?",
      answer: "Unfortunately it is not there. We shall try to implement in the versions to come."
    },
    {
      id: 5,
      question: "How can we give feedback on RoboAnlayzer?",
      answer: "Kindly give your valuable feedback here."
    },
    {
      id: 6,
      question: "Can we suggest new features in RoboAnalyzer?",
      answer: "Yes. Kindly send your suggestions or features you want here."
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <h2 className='text-3xl font-bold mb-6 text-center text-gray-800'>Ask RoboAnalyzer</h2>
      
      {/* Chat Section */}
      <div className='bg-white rounded-lg shadow-lg border p-6 mb-8'>
        <h3 className='text-xl font-semibold mb-4 text-gray-700'>Chat with AI Assistant</h3>
        <div className='space-y-4'>
          <input
            type='text'
            className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='Ask your question...'
            onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
          />
          <button 
            onClick={askQuestion} 
            disabled={!question.trim()}
            className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Ask Question
          </button>
        </div>
        
        {answer && (
          <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <h4 className='font-semibold text-blue-800 mb-2'>Response:</h4>
            <p className='text-gray-700'>{answer}</p>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className='bg-white rounded-lg shadow-lg border'>
        <div className='border-b p-6 bg-gray-50'>
          <h3 className='text-2xl font-bold text-gray-800'>Frequently Asked Questions (FAQ)</h3>
          <p className='text-gray-600 mt-2'>Common questions about RoboAnalyzer</p>
        </div>
        
        <div className='divide-y divide-gray-200'>
          {faqData.map((faq) => (
            <div key={faq.id} className='border-b border-gray-200 last:border-b-0'>
              <button
                className='w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors'
                onClick={() => toggleFAQ(faq.id)}
              >
                <div className='flex items-center justify-between'>
                  <h4 className='text-lg font-semibold text-gray-800 pr-4'>{faq.question}</h4>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      openFAQ === faq.id ? 'rotate-180' : ''
                    }`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </div>
              </button>
              
              {openFAQ === faq.id && (
                <div className='px-6 pb-4'>
                  <p className='text-gray-700 leading-relaxed'>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
