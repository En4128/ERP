import React from 'react'

const Footer = () => {
  return (
    <div className='text-[16px] text-gray-400'>
        <div className='mb-10'>
            Questions? Call <span className='underline cursor-pointer'>000-800-919-1743</span>
        </div>
        <div className='flex justify-between underline cursor-pointer'>
            <div className='w-[200px] list-none'>
            <li className='pb-3'>FAQ</li>
            <li className='pb-3'>Investor Relations</li>
            <li className='pb-3'>Privacy </li>
            <li className='pb-3'>Speed Test</li>
        </div>
            <div className='w-[200px] list-none'>
            <li className='pb-3'>Help Centre</li>
            <li className='pb-3'>Jobs</li>
            <li className='pb-3'>Cookie Preferences</li>
            <li className='pb-3'>Legal Notices</li>
        </div>
            <div className='w-[200px] list-none'>
            <li className='pb-3'>Account</li>
            <li className='pb-3'>Ways to Watch</li>
            <li className='pb-3'>Corporate Information</li>
            <li className='pb-3'>Only on Netflix</li>
        </div>
            <div className='w-[200px] list-none'>
            <li className='pb-3'>Media Centre</li>
            <li className='pb-3'>Terms of Use</li>
            <li className='pb-3'>Contact Us</li>

        </div>
        </div>

        <div className='text-white mt-20'>
            <select className="pr-25 border p-1 mr-2 border-gray-500  " name="" id="">
                        <option className="text-black" value="English">English</option>
                        <option className="text-black" value="Tamil">Tamil</option>
                    </select>
        </div>

        <div className='h-40'>
            <div className='mt-10'>Netflix India</div>
            <div className='mt-10 text-sm'>This page is protected by Google reCAPTCHA to ensure you're not a bot. <span className='text-blue-400 cursor-pointer underline'>Learn more.</span></div>
        </div>
    </div>
  )
}

export default Footer