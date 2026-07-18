
export const searchService = {

  searchArtists: async (query) => {

    await new Promise(resolve => setTimeout(resolve, 800));


    if (!query) return [];

    return [
      { id: 1, name: 'Sufi Ensemble', type: 'Band', price: '₹1.2L+' },
      { id: 2, name: 'Acoustic Soul', type: 'Singer', price: '₹45k+' },
      { id: 3, name: 'Elite Beats', type: 'DJ', price: '₹80k+' },
    ];
  },


  getTrendingSearches: () => [
    'Sufi Singers',
    'Live Wedding Bands',
    'Corporate DJs',
    'Violinists',
    'Jazz Ensembles'
  ]
};
