/**
 * Booking Service
 * 
 * Simulated service for handling artist reservations and contact inquiries.
 */
export const bookingService = {
  /**
   * Submit a booking or contact request.
   * @param {Object} formData 
   * @returns {Promise<Object>}
   */
  submitRequest: async (formData) => {
    console.log("Submitting form data to server:", formData);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      return {
        success: true,
        message: result.message || "Submission received successfully."
      };
    } catch (error) {
      console.error("Booking service error:", error);
      throw error;
    }
  }
};
