import { useState, useEffect } from "react"

const TrafficLight = () => {

  const colors = [
    { color: 'green', duration: 2000 },
    { color: 'yellow', duration: 1000 },
    { color: 'red', duration: 2000 }
  ]

  useEffect(() => {
    start()
  }, [])

  const [activeColor, setActiveColor] = useState(colors[0])

  const start =  () => {
    let i = 0;
    setInterval(() => {
      setActiveColor(colors[i])
      console.log(i)
      i = (i + 1) % colors.length
      console.log(i)
    }, colors[i].duration)
  }


  return (
    <div className="flex flex-col items-center gap-12">

      <div className="bg-black py-6 h-[56vh] w-36 rounded-2xl flex flex-col gap-6 items-center">
        <div className={`${activeColor.color === 'red' ? "bg-red-500" : "bg-gray-500"} h-[15vh] w-[15vh] rounded-full`}></div>
        <div className={`${activeColor.color === 'yellow' ? "bg-yellow-500" : "bg-gray-500"} h-[15vh] w-[15vh] rounded-full`}></div>
        <div className={`${activeColor.color === 'green' ? "bg-green-500" : "bg-gray-500"} h-[15vh] w-[15vh] rounded-full`}></div>
      </div>

      <div className="bg-black py-4 h-36 w-[56vh] rounded-2xl flex justify-center gap-6">
        <div className={`${activeColor.color === 'red' ? "bg-red-500" : "bg-gray-500"} h-[15vh] w-[15vh] rounded-full`}></div>
        <div className={`${activeColor.color === 'yellow' ? "bg-yellow-500" : "bg-gray-500"} h-[15vh] w-[15vh] rounded-full`}></div>
        <div className={`${activeColor.color === 'green' ? "bg-green-500" : "bg-gray-500"} h-[15vh] w-[15vh] rounded-full`}></div>
      </div>

    </div>
  )
}

export default TrafficLight