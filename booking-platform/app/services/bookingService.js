export const bookingService = {

  submitRequest: (formData) => {
    console.log("Submitting form data to server in background:", formData);

    // Run the API call in the background without awaiting it
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).catch(error => {
      console.error("Background booking service error:", error);
    });

    // Return success immediately to make the UI feel fast
    return Promise.resolve({
      success: true,
      message: "Submission received successfully."
    });
  }
};
