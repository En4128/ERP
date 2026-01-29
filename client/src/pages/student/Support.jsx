import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { MessageSquare, Phone, HelpCircle, FileText, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

import { useChat } from '../../context/ChatContext';

const Support = ({ role = "student" }) => {
    const { openChat } = useChat();
    const [view, setView] = useState('main'); // 'main', 'faq', 'article'
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);

    const faqs = [
        { question: "How can I check my attendance percentage?", answer: "Navigate to the 'Attendance' tab on the sidebar. You will see your overall attendance and subject-wise breakdown." },
        { question: "What should I do if my attendance is marked incorrectly?", answer: "Please contact your subject faculty immediately or raise a ticket via the 'Chat with Us' option." },
        { question: "How do I download my grade card?", answer: "Go to the 'Marks & Results' page. You can download the semester-wise grade card as a PDF." },
        { question: "Can I apply for leave online?", answer: "Yes, use the 'Apply Leave' option in the Quick Actions section of the Dashboard." },
        { question: "What is the penalty for late fee payment?", answer: "A late fee of $10 per day is applicable after the due date. Please refer to the Accounts section for more details." },
        { question: "How do I reset my password?", answer: "Go to Profile > Security > Change Password. If you cannot login, use the 'Forgot Password' link on the login page." },
    ];

    const articles = {
        'How to pay semester fees?': {
            title: 'How to pay semester fees?',
            content: (
                <div className="space-y-4 text-gray-600 dark:text-slate-300">
                    <p>Paying your semester fees is a simple secure process via the Student Portal.</p>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li>Navigate to the <strong>Fees</strong> section from the Dashboard Quick Actions.</li>
                        <li>Review your <strong>Outstanding Balance</strong>.</li>
                        <li>Click on <strong>Pay Now</strong>.</li>
                        <li>Select your preferred payment method (Credit/Debit Card, Net Banking, or UPI).</li>
                        <li>Complete the transaction. You will receive a receipt via email instantly.</li>
                    </ol>
                    <p className="text-sm italic mt-4">Note: If the transaction fails but money is deducted, please wait 24-48 hours before trying again.</p>
                </div>
            )
        },
        'How to reset my password?': {
            title: 'Reseting your Password',
            content: (
                <div className="space-y-4 text-gray-600 dark:text-slate-300">
                    <p>Security is paramount. Here is how you can update your credentials:</p>
                    <h4 className="font-bold text-slate-900 dark:text-white">If you are logged in:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Go to <strong>My Profile</strong> via the sidebar.</li>
                        <li>Scroll down to the <strong>Security</strong> section.</li>
                        <li>Click <strong>Change Password</strong>.</li>
                    </ul>
                    <h4 className="font-bold text-slate-900 dark:text-white mt-4">If you cannot login:</h4>
                    <p>Click the "Forgot Password" link on the main login screen and follow the OTP verification process sent to your registered email.</p>
                </div>
            )
        },
        'Library details and fines': {
            title: 'Library Procedures & Fines',
            content: (
                <div className="space-y-4 text-gray-600 dark:text-slate-300">
                    <p>The Central Library is open from 8 AM to 8 PM on weekdays.</p>
                    <h4 className="font-bold text-slate-900 dark:text-white">Borrowing Rules:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Undergraduate students can borrow up to <strong>3 books</strong> at a time.</li>
                        <li>Maximum borrowing period is <strong>14 days</strong>.</li>
                    </ul>
                    <h4 className="font-bold text-slate-900 dark:text-white mt-4">Fines:</h4>
                    <p>A fine of <strong>$1 per day</strong> is levied for overdue books. Books lost must be replaced or paid for at current market value.</p>
                </div>
            )
        },
        'Applying for medical leave': {
            title: 'Medical Leave Application Process',
            content: (
                <div className="space-y-4 text-gray-600 dark:text-slate-300">
                    <p>For absences due to medical reasons exceeding 3 days, a medical certificate is mandatory.</p>
                    <p><strong>Steps to Apply:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li>Go to <strong>Apply Leave</strong> in Dashboard.</li>
                        <li>Select "Medical Leave" as the leave type.</li>
                        <li>Upload a clear scan/photo of your <strong>Medical Certificate</strong>.</li>
                        <li>Submit the request. It will be forwarded to your Faculty Advisor for approval.</li>
                    </ol>
                </div>
            )
        }
    };

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    const openArticle = (topic) => {
        if (articles[topic]) {
            setSelectedArticle(articles[topic]);
            setView('article');
        }
    };

    return (
        <Layout role={role}>
            <div className="animate-fade-in-up space-y-8">
                {view === 'main' ? (
                    <>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Help & Support</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 text-center hover:shadow-lg transition">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-700">
                                    <MessageSquare size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Chat with Us</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">Start a conversation with our support team.</p>
                                <button
                                    onClick={openChat}
                                    className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition"
                                >
                                    Start Chat
                                </button>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 text-center hover:shadow-lg transition">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                                    <Phone size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Call Support</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">Available 9 AM - 6 PM</p>
                                <button className="px-6 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-white dark:hover:bg-slate-700 transition">+1 (800) 123-4567</button>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 text-center hover:shadow-lg transition">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
                                    <HelpCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">FAQs</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">Find answers to common questions.</p>
                                <button
                                    onClick={() => setView('faq')}
                                    className="px-6 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-white dark:hover:bg-slate-700 transition"
                                >
                                    View FAQs
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Common Topics</h3>
                            <div className="space-y-3">
                                {Object.keys(articles).map((topic, i) => (
                                    <button
                                        key={i}
                                        onClick={() => openArticle(topic)}
                                        className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition text-left group"
                                    >
                                        <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center">
                                            <FileText size={18} className="mr-3 text-gray-400 group-hover:text-blue-700 transition-colors" /> {topic}
                                        </span>
                                        <div className="text-blue-700 dark:text-blue-400 text-sm font-semibold flex items-center">
                                            Read Article <ArrowLeft className="ml-2 rotate-180" size={16} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : view === 'faq' ? (
                    <div className="max-w-3xl mx-auto">
                        <button
                            onClick={() => setView('main')}
                            className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition"
                        >
                            <ArrowLeft size={20} className="mr-2" /> Back to Support
                        </button>

                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Frequently Asked Questions</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">Quick answers to questions you may have.</p>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-300"
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full text-left p-5 flex justify-between items-center focus:outline-none"
                                    >
                                        <span className="font-bold text-slate-900 dark:text-white text-lg">{faq.question}</span>
                                        {expandedFaq === index ? (
                                            <ChevronUp className="text-blue-700 dark:text-blue-400" size={20} />
                                        ) : (
                                            <ChevronDown className="text-gray-400" size={20} />
                                        )}
                                    </button>

                                    <div
                                        className={`px-5 text-gray-600 dark:text-slate-300 overflow-hidden transition-all duration-300 ease-in-out ${expandedFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        {faq.answer}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Article View
                    <div className="max-w-3xl mx-auto">
                        <button
                            onClick={() => setView('main')}
                            className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition"
                        >
                            <ArrowLeft size={20} className="mr-2" /> Back to Support
                        </button>

                        {selectedArticle && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 animate-fade-in-up">
                                <div className="flex items-center mb-6">
                                    <div className="p-3 bg-blue-50 dark:bg-indigo-900/20 rounded-lg mr-4">
                                        <FileText size={28} className="text-blue-700 dark:text-blue-400" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedArticle.title}</h1>
                                </div>
                                <div className="prose dark:prose-invert max-w-none">
                                    {selectedArticle.content}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Support;
