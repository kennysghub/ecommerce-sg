const API_URL = "http://localhost:3000/v1";

export interface IOrderResponse {
  transactionId: string;
  amount: number;
}

export const submitOrder = async (): Promise<IOrderResponse> => {
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
