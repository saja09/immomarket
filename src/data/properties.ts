export type Property = {
  id: number
  title: string
  price: string
  city: string
  district: string
  beds: number
  baths: number
  area: string
  image: string
  featured?: boolean
  type: string
  status: string
  company: string
  reference: string
  tags: string[]
}

export const properties: Property[] = [
  {
    id: 1,
    title: "فيلا فاخرة بإطلالة مفتوحة",
    price: "2,500,000 DH",
    city: "الرباط",
    district: "حي الرياض",
    beds: 4,
    baths: 3,
    area: "320 m²",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    type: "Villa",
    status: "Disponible",
    company: "ImmoMarket Direct",
    reference: "IMM-001",
    tags: ["مشمش", "حديقة", "هادئ"]
  },
  {
    id: 2,
    title: "شقة للبيع بتصميم عصري",
    price: "850,000 DH",
    city: "سلا",
    district: "بطانة",
    beds: 2,
    baths: 1,
    area: "96 m²",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    type: "Appartement",
    status: "Disponible",
    company: "ImmoMarket Direct",
    reference: "IMM-002",
    tags: ["قريب للخدمات", "واجهة", "استثمار"]
  },
  {
    id: 3,
    title: "منزل عائلي قريب من الخدمات",
    price: "1,350,000 DH",
    city: "تمارة",
    district: "المسيرة 2",
    beds: 3,
    baths: 2,
    area: "180 m²",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    type: "Maison",
    status: "Disponible",
    company: "ImmoMarket Direct",
    reference: "IMM-003",
    tags: ["عائلي", "قريب للمدارس", "مناسب"]
  },
  {
    id: 4,
    title: "شقة ممتازة للاستثمار",
    price: "720,000 DH",
    city: "القنيطرة",
    district: "المعمورة",
    beds: 2,
    baths: 1,
    area: "88 m²",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    type: "Appartement",
    status: "Disponible",
    company: "ImmoMarket Direct",
    reference: "IMM-004",
    tags: ["استثمار", "موقع جيد", "مضيء"]
  },
  {
    id: 5,
    title: "فيلا حديثة مع حديقة",
    price: "3,100,000 DH",
    city: "سيدي علال البحراوي",
    district: "المنطقة الجديدة",
    beds: 5,
    baths: 4,
    area: "410 m²",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    type: "Villa",
    status: "Exclusif",
    company: "ImmoMarket Direct",
    reference: "IMM-005",
    tags: ["حصري", "حديقة", "راقي"]
  },
  {
    id: 6,
    title: "شقة اقتصادية ومناسبة",
    price: "540,000 DH",
    city: "الخميسات",
    district: "وسط المدينة",
    beds: 2,
    baths: 1,
    area: "74 m²",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    type: "Appartement",
    status: "Disponible",
    company: "ImmoMarket Direct",
    reference: "IMM-006",
    tags: ["اقتصادي", "مركز المدينة", "جاهز"]
  }
]
