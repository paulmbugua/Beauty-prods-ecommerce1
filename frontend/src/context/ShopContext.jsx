import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = 'Kshs ';
    const delivery_fee = 100;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    const addToCart = async (itemId) => { // Removed 'size' parameter

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            cartData[itemId] += 1; // Increment quantity directly
        }
        else {
            cartData[itemId] = 1; // Initialize quantity
        }
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/add', { itemId }, { headers: { token } }); // Removed 'size'
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const itemId in cartItems) {
            try {
                if (cartItems[itemId] > 0) {
                    totalCount += cartItems[itemId];
                }
            } catch (error) {
                // Optional: Handle specific errors if needed
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, quantity) => { // Removed 'size' parameter

        let cartData = structuredClone(cartItems);

        cartData[itemId] = quantity;

        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/update', { itemId, quantity }, { headers: { token } }); // Removed 'size'
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }

    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            let itemInfo = products.find((product) => product._id === itemId);
            try {
                if (cartItems[itemId] > 0 && itemInfo) {
                    totalAmount += itemInfo.price * cartItems[itemId];
                }
            } catch (error) {
                // Optional: Handle specific errors if needed
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list');
            if (response.data.success) {
                setProducts(response.data.products.reverse());
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const getUserCart = async (token) => { // Removed extra space before 'token'
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } });
            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        getProductsData();
    }, []);

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'));
            getUserCart(localStorage.getItem('token'));
        }
        if (token) {
            getUserCart(token);
        }
    }, [token]);

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;
