import bgimg from '../assets/bannerbg.jpg'

const Nav = () =>{
    return(
        <>
        <div className="px-30 py-5 bg-black bg-cover text-white z-10">
            <div className='absolute inset-0 bg-cover bg-center opacity-30' style={{backgroundImage: `url(${bgimg})`}}>
            </div>
            <div className='relative z-0 '>
                <div className="flex justify-between items-center">
                <div className="text-4xl text-red-600 font-bold">
                NETFLIX
            </div>
            <div className="flex ">
                <div>
                    <select className="pr-25 border p-1 mr-2 border-gray-500  " name="" id="">
                        <option className="text-black" value="English">English</option>
                        <option className="text-black" value="Tamil">Tamil</option>
                    </select>
                </div>
                <button className="bg-red-600 px-5 py-1 rounded">Sign In</button>
            </div>
            </div>
            <div className="py-30 flex flex-col items-center">
                <div className="text-6xl font-bold w-160 text-center ">
                    Unlimited movies, TV shows and more
                </div>
                <div className="py-5 font-bold text-[18px] ">Starts at ₹149. Cancel at any time.</div>
                <p>Ready to watch? Enter your email to create or restart your membership.</p>
                <div className="py-5">
                    <input className="border border-gray-500 p-2 pr-30 mr-5" type="email" name="" id="" placeholder="Email address"/>
                    <button className="bg-red-600 p-2 px-5 rounded ">Get Started</button>
                </div>
            </div>
            </div>
        </div>
        </>
    )
}

export default Nav