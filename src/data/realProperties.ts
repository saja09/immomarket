export type RealProperty = {
  id: number
  title: string
  city: string
  district: string
  area: number
  rooms: number
  bathrooms: number
  kitchens: number
  price: string
  image: string
  gallery: string[]
  description: string
}

export const realProperties: RealProperty[] = [
  {
    id: 201,
    title: "شقة اقتصادية 50m²",
    city: "سيدي علال البحراوي",
    district: "حي اليونس",
    area: 50,
    rooms: 2,
    bathrooms: 1,
    kitchens: 1,
    price: "350,000 DH",
    image: "/properties/youness50/building.jpg",
    gallery: [
      "/properties/youness50/building.jpg",
      "/properties/youness50/salon.jpg",
      "/properties/youness50/room1.jpg",
      "/properties/youness50/room2.jpg",
      "/properties/youness50/kitchen.jpg",
      "/properties/youness50/bathroom.jpg",
      "/properties/youness50/hall.jpg"
    ],
    description:
      "شقة حقيقية للبيع في حي اليونس بسيدي علال البحراوي، بمساحة 50 متر مربع، بتشطيب عصري وسقف بإضاءة LED، تضم صالون وغرفتين ومطبخاً وحماماً، وتستفيد من دعم سكني بقيمة 10 مليون سنتيم.",
  },
  {
    id: 202,
    title: "شقة عصرية 80m²",
    city: "سيدي علال البحراوي",
    district: "حي المنزه",
    area: 80,
    rooms: 2,
    bathrooms: 1,
    kitchens: 1,
    price: "480,000 DH",
    image: "/properties/manzah80/building.jpg",
    gallery: [
      "/properties/manzah80/building.jpg",
      "/properties/manzah80/salon.jpg",
      "/properties/manzah80/room1.jpg",
      "/properties/manzah80/room2.jpg",
      "/properties/manzah80/kitchen1.jpg",
      "/properties/manzah80/kitchen2.jpg",
      "/properties/manzah80/bathroom.jpg",
      "/properties/manzah80/hall.jpg"
    ],
    description:
      "شقة حقيقية للبيع في حي المنزه بسيدي علال البحراوي، بمساحة 80 متر مربع، بتشطيب حديث ومطبخ مجهز وسقف ديكور بإضاءة LED، تضم صالوناً وغرفتين ومطبخاً وحماماً، وتستفيد من دعم سكني بقيمة 7 مليون سنتيم.",
  },
]
