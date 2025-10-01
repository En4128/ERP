import Trend1 from '../assets/Trend1.webp'
import Trend2 from '../assets/Trend2.webp'
import Trend3 from '../assets/Trend3.webp'
import Trend4 from '../assets/Trend4.webp'


const Trends = () => {
    const movies = [
        {
            "id":1,
            "url":Trend1
        },
        {
            "id":2,
            "url":Trend2
        },
        {
            "id":3,
            "url":Trend3
        },
        {
            "id":4,
            "url":Trend4
        },
        {
            "id":5,
            "url":Trend1
        },
        {
            "id":6,
            "url":Trend2
        },
        {
            "id":7,
            "url":Trend3
        },
        {
            "id":8,
            "url":Trend4
        }
    ]

  return (
    <div className='py-20'>
        <div className='font-bold text-2xl'>
            Trending Now
        </div>
        <div className='flex gap-10 overflow-scroll hide-scrollbar'>
            {movies.map((movie, index) => {
                return (
                    <div key={index} className='pt-5 relative'>
                        <img className='rounded-2xl min-w-[150px]' src={movie.url} alt="" />
                    <div className='text-8xl font-bold absolute bottom-0 left-[-10px] text-stroke-white'>
                       {movie.id}
                    </div>
                   </div>
                );
            })}
        </div>
    </div>
  )
}

export default Trends