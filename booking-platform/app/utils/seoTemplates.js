export function generateOverview(category, city) {
  const catName = category === 'All' ? 'Artists' : category;
  const pluralCat = catName.endsWith('s') ? catName : `${catName}s`;
  
  return `
    <p style="margin-bottom: 16px;">
      Looking to book the best <strong>${pluralCat} in ${city}</strong>? Whether you are planning a grand wedding, an intimate house party, or a professional corporate event, finding the right live entertainment is crucial. Magnevents offers a curated selection of highly-rated ${pluralCat.toLowerCase()} available for hire in ${city}.
    </p>
    <p style="margin-bottom: 16px;">
      Our platform makes it incredibly easy to discover top local talent. Each artist profile includes verified reviews, high-quality performance videos, and transparent pricing. Don't leave your event's entertainment to chance—book a verified ${catName.toLowerCase()} in ${city} today and guarantee an unforgettable experience for your guests.
    </p>
  `;
}

export function generateServices(category, city) {
  const catName = category === 'All' ? 'Artist' : category;
  
  return [
    { title: `Weddings & Sangeet`, desc: `Hire a soulful ${catName.toLowerCase()} in ${city} to make your special day memorable.` },
    { title: `Corporate Events`, desc: `Professional ${catName.toLowerCase()}s perfect for galas, product launches, and annual parties in ${city}.` },
    { title: `Private House Parties`, desc: `Get your guests singing along with a highly engaging ${catName.toLowerCase()} right in your living room.` }
  ];
}

export function generateFAQs(category, city) {
  const catName = category === 'All' ? 'Artist' : category;
  return [
    {
      question: `How much does it cost to hire a ${catName} in ${city}?`,
      answer: `The cost of hiring a ${catName} in ${city} varies widely based on their experience, popularity, and the duration of the performance. On average, you can expect prices to range from ₹15,000 to ₹1,50,000+. Magnevents offers transparent pricing on all artist profiles so you can find the perfect fit for your budget.`
    },
    {
      question: `How do I book a ${catName} for an event in ${city}?`,
      answer: `Booking is simple with Magnevents. Browse our curated list of ${catName}s in ${city}, review their videos and past performance ratings, and click "Book Now" to submit an inquiry. Our team will handle the rest, ensuring a seamless booking process.`
    },
    {
      question: `Do the ${catName}s in ${city} bring their own sound equipment?`,
      answer: `Many ${catName}s come with their own basic setup (guitars, mics), but full sound systems (PA, monitors, mixers) usually need to be arranged separately. Our event experts at Magnevents can help you coordinate all technical requirements for your event in ${city}.`
    }
  ];
}

export function generateRelatedLinks(category, city) {
  const otherCategories = ['Live Band', 'Singer', 'DJ', 'Comedian', 'Musician'].filter(c => c !== category);
  
  return otherCategories.map(cat => ({
    title: `${cat} in ${city}`,
    url: `/${cat.toLowerCase().replace(/ /g, '-')}-in-${city.toLowerCase().replace(/ /g, '-')}`
  }));
}
