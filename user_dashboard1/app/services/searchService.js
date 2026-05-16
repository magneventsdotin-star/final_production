/**
 * Search Service
 * 
 * Simulated service for artist and event search.
 */
export const searchService = {
  /**
   * Search for artists based on a query string.
   * @param {string} query 
   * @returns {Promise<Array>}
   */
  searchArtists: async (query) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock results based on query
    if (!query) return [];
    
    return [
      { id: 1, name: 'Sufi Ensemble', type: 'Band', price: '₹1.2L+' },
      { id: 2, name: 'Acoustic Soul', type: 'Singer', price: '₹45k+' },
      { id: 3, name: 'Elite Beats', type: 'DJ', price: '₹80k+' },
    ];
  },

  /**
   * Get trending search terms.
   * @returns {Array<string>}
   */
  getTrendingSearches: () => [
    'Sufi Singers', 
    'Live Wedding Bands', 
    'Corporate DJs', 
    'Violinists', 
    'Jazz Ensembles'
  ]
};
