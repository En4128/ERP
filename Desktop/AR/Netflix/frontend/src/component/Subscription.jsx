import React from 'react'

const Subscription = () => {
  return (
    <div className='flex flex-col items-center gap-5 py-10'>
        <div className='text-center'>
            Ready to watch? Enter your email to create or restart your membership.
        </div>
        <div>
            <input className="border border-gray-500 py-4 pl-5  pr-70 mr-5" type="email" name="" id="" placeholder="Email address"/>
                    <button className="bg-red-600 p-4 px-8 rounded cursor-pointer">Get Started</button>
        </div>
    </div>
  )
}

export default Subscription