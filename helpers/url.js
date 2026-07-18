/**
 * Centralized URL Builders for Magnevents Platform
 */

// Artist URLs
export const getArtistUrl = (id) => `/artist/${id}`;
export const getArtistsCategoryUrl = (category) => `/artists?category=${encodeURIComponent(category)}`;

// Blog URLs
export const getBlogUrl = (id) => `/blog-post/${id}`;
export const getBlogListingUrl = () => '/blog-post';

// Core Pages
export const getHomeUrl = () => '/';
export const getAboutUrl = () => '/about';
export const getContactUrl = () => '/contact';
export const getPricingUrl = () => '/pricing';
export const getGalleryUrl = () => '/gallery';
export const getServicesUrl = () => '/services';
export const getWhyChooseUrl = () => '/why-choose';
export const getTestimonialsUrl = () => '/testimonials';
export const getHowToBookUrl = () => '/how-to-book';

// Registration / Booking
export const getRegisterArtistUrl = () => '/register/artist';
export const getRegisterEventUrl = () => '/register/event';
export const getBookingModalType = (type) => type; // 'booking', 'contact', etc.

// Assets / Images
export const getImageUrl = (path) => (path && path.startsWith('http') ? path : `/images/${path}`);
