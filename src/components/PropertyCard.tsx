import React from "react"

type Property = {
id:number
title:string
city:string
district:string
area:string
price:string
image:string
}

export default function PropertyCard({property}:{property:Property}){

const openDetails = ()=>{
alert("تفاصيل العقار")
}

const toggleFavorite = (e:any)=>{
e.stopPropagation()
alert("تم حفظ العقار")
}

return(

<div
className="bg-white rounded-3xl shadow-md overflow-hidden mb-6"
>

<div
className="relative cursor-pointer"
onClick={openDetails}
>

<img
src={property.image}
className="w-full h-56 object-cover"
/>

<button
onClick={toggleFavorite}
className="absolute top-3 right-3 bg-white w-10 h-10 rounded-full shadow flex items-center justify-center text-xl"
>
❤️
</button>

<div
className="absolute bottom-3 left-3 bg-white px-4 py-2 rounded-full text-blue-600 font-bold"
>
{property.price}
</div>

</div>

<div className="p-5">

<h2 className="text-lg font-bold text-center mb-4">
{property.title}
</h2>

<div className="grid grid-cols-3 gap-3 text-center">

<div className="bg-gray-100 rounded-xl p-3">
📏
<p className="text-sm">{property.area}</p>
</div>

<div className="bg-gray-100 rounded-xl p-3">
📍
<p className="text-sm">{property.district}</p>
</div>

<div className="bg-gray-100 rounded-xl p-3">
🏙
<p className="text-sm">{property.city}</p>
</div>

</div>

<button
onClick={openDetails}
className="mt-5 w-full bg-blue-900 text-white py-3 rounded-xl"
>
التفاصيل
</button>

</div>

</div>

)

}
