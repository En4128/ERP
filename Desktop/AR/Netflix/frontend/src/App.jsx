import Nav from "./component/Nav"
import Questions from "./component/Questions"
import Reasons from "./component/Reasons"
import Trends from "./component/Trends"
import Subscription from "./component/Subscription"
import Footer from "./component/Footer"

const App = () => {
  return (
    <div className="text-white bg-black px-30">
    <Nav />
    <Trends />
    <Reasons />
    <Questions />
    <Subscription />
    <Footer />
    </div>
  )
}

export default App