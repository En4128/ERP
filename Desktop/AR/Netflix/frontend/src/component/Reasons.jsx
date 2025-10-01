import { LuMonitorPlay } from "react-icons/lu";
import { IoArrowDownCircle } from "react-icons/io5";
import { IoTelescopeSharp } from "react-icons/io5";
import { LiaUsersSolid } from "react-icons/lia";


const Reasons = () => {
    const reasons = [
        {
            "title":"Enjoy on your TV",
            "detail":"Watch on smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players and more.",
            "icon":<LuMonitorPlay />
        },
        {
            "title":"Download your shows to watch offline",
            "detail":"Save your favourites easily and always have something to watch.",
            "icon":<IoArrowDownCircle />
        },
        {
            "title":"Watch everywhere",
            "detail":"Stream unlimited movies and TV shows on your phone, tablet, laptop and TV.",
            "icon":<IoTelescopeSharp />
        },
        {
            "title":"Create profiles for kids",
            "detail":"Send kids on adventures with their favourite characters in a space made just for them — free with your membership.",
            "icon":<LiaUsersSolid />
        }
    ]

  return (
    <div className='mt-5'>
        <div className='font-bold text-2xl mb-10'>
            More reasons to join
        </div>

        <div className='flex gap-5'>
            {reasons.map((reason, index)=>{
                return(
                    <div className="w-[350px] h-[325px] rounded-3xl p-5 bg-gradient-to-b from-blue-950 to-gray-900 relative">
                        <div className='font-bold text-2xl'> 
                        {reason.title}
                    </div>
                    <div className='py-5 text-gray-400 font-semibold'>
                        {reason.detail}
                    </div>
                    <div className="text-6xl -right-5 bottom-5 absolute mr-10 opacity-60">
                        {reason.icon}
                    </div>
                    </div>
                )
            })}
        </div>
    </div>
  )
}

export default Reasons