import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch all orders
  const fetchAllOrders = async () => {
    if (!token) {
      toast.error('Authentication token is missing. Please log in.');
      return;
    }

    setLoading(true);
    setError(null); // Reset error state

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );

      if (response.data && response.data.success) {
        setOrders(response.data.orders.reverse());
      } else if (response.data && response.data.message) {
        toast.error(response.data.message);
        setError(response.data.message);
      } else {
        toast.error('Failed to fetch orders. Please try again later.');
        setError('Failed to fetch orders.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;

    if (!token) {
      toast.error('Authentication token is missing. Please log in.');
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: newStatus },
        { headers: { token } }
      );

      if (response.data && response.data.success) {
        toast.success('Order status updated successfully.');
        await fetchAllOrders();
      } else if (response.data && response.data.message) {
        toast.error(response.data.message);
      } else {
        toast.error('Failed to update order status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred.';
      toast.error(errorMessage);
    }
  };

  // useEffect to fetch orders on component mount or token change
  useEffect(() => {
    if (token) {
      fetchAllOrders();
    } else {
      setOrders([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Render loading state
  if (loading) {
    return <div>Loading orders...</div>;
  }

  // Render error state
  if (error) {
    return (
      <div className="error-message">
        <p>Error: {error}</p>
        <button onClick={fetchAllOrders} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3>Order Page</h3>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div
              className="order-container grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
              key={order._id}
            >
              <img className="w-12" src={assets.parcel_icon} alt="Parcel Icon" />
              <div>
                <div>
                  {order.items.map((item, index) => (
                    <span key={index}>
                      {item.name} x {item.quantity} {item.size}
                      {index < order.items.length - 1 && ', '}
                    </span>
                  ))}
                </div>
                <p className="mt-3 mb-2 font-medium">
                  {`${order.address.firstName} ${order.address.lastName}`}
                </p>
                <div>
                  <p>{`${order.address.street},`}</p>
                  <p>{`${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}`}</p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className="text-sm sm:text-[15px]">
                  Items: {order.items.length}
                </p>
                <p className="mt-3">Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className="text-sm sm:text-[15px]">
                {currency}
                {order.amount.toFixed(2)}
              </p>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="p-2 font-semibold"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
