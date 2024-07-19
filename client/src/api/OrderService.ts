const API_URL = "http://localhost:3000/v1";

export const submitOrder = async (): Promise<unknown> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_URL}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit order");
  }
  console.log("response", response);
  return response.json();
};

// Submitting order for user 87a0912a-ae52-4655-a743-bc75789245a4 with cart 791120a5-6b20-4191-89b9-478363def336
// Found 17 items in the cart
// Total order amount: 286433
// New order created with ID: 9c2d9deb-552b-4e51-ac02-840405f611e0
// Cleared cart 791120a5-6b20-4191-89b9-478363def336
