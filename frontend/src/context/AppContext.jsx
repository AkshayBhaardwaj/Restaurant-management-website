import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosLib from "axios"; // import axios
import { toast } from "react-hot-toast";

// Create Axios instance with baseURL and cookies enabled
const axios = axiosLib.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:5000",
  withCredentials: true, // important: send cookies for auth
});

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // ----------------------- Cart -----------------------
  const fetchCartData = async () => {
    try {
      const { data } = await axios.get("/api/cart/get");
      if (data.success) setCart(data.cart);
    } catch (error) {
      console.log("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    if (cart?.items) {
      const total = cart.items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );
      setTotalPrice(total);
    }
  }, [cart]);

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const addToCart = async (menuId) => {
    try {
      const { data } = await axios.post("/api/cart/add", { menuId, quantity: 1 });
      if (data.success) {
        toast.success(data.message);
        fetchCartData();
      } else toast.error(data.message);
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Something went wrong!");
    }
  };

  // ----------------------- Categories & Menus -----------------------
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/all");
      if (data.success) setCategories(data.categories);
      else console.log("Failed to fetch categories");
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  const fetchMenus = async () => {
    try {
      const { data } = await axios.get("/api/menu/all");
      if (data.success) setMenus(data.menuItems);
      else console.log("Failed to fetch menus");
    } catch (error) {
      console.log("Error fetching menus:", error);
    }
  };

  // ----------------------- User Authentication -----------------------
  const isAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/is-auth");
      if (data.success) setUser(data.user);
      else setUser(null);
    } catch (error) {
      console.log("Auth check failed:", error);
      setUser(null);
    }
  };

  const adminLogin = async (credentials) => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/admin/login", credentials);
      if (data.success) {
        toast.success(data.message);
        setAdmin(true);
        navigate("/admin"); // redirect to admin dashboard
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Admin login error:", error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------- Admin Routes Example -----------------------
  const fetchAllBookings = async () => {
    try {
      const { data } = await axios.get("/api/booking/bookings", { withCredentials: true });
      if (data.success) return data.bookings;
      else return [];
    } catch (error) {
      console.log("Fetch bookings error:", error);
      toast.error("Failed to fetch bookings");
      return [];
    }
  };

  // ----------------------- On Mount -----------------------
  useEffect(() => {
    isAuth();
    fetchCategories();
    fetchMenus();
    fetchCartData();
  }, []);

  // ----------------------- Context Value -----------------------
  const value = {
    navigate,
    loading,
    setLoading,
    user,
    setUser,
    admin,
    setAdmin,
    adminLogin,
    categories,
    fetchCategories,
    menus,
    fetchMenus,
    addToCart,
    cartCount,
    cart,
    totalPrice,
    fetchCartData,
    fetchAllBookings, // admin helper
    axios, // use this axios instance everywhere
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
