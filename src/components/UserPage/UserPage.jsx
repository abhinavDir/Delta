import { 
FaUser, 
FaEnvelope, 
FaPhoneAlt, 
FaShoppingBag, 
FaArrowRight, 
FaEdit, 
FaSignOutAlt, 
FaCrown, 
FaStar, 
FaUtensils, 
FaCheckCircle, 
FaTimesCircle, 
FaComments, 
FaTruck 
} from "react-icons/fa";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FoodModal } from "../FoodItem/Food";
import "./UserPage.css";

const UserPage = ({ cartItems = [], user, setUser, orders = [], addToCart }) => {

const navigate = useNavigate();
const [openItem, setOpenItem] = useState(null);

if (!user) {
return (
<>
<div className="user-page">
<div className="page-bg-overlay"></div>
<div className="glass-panel main-empty">
<div className="lock-icon-container">
<FaUser className="lock-icon"/>
</div>
<h2>Access Denied</h2>
<p>Please login to unlock your premium canteen dashboard.</p>
<button
className="stylish-btn"
onClick={() => navigate("/login")}
>
Unlock Profile <FaArrowRight/> </button>
</div>
</div>
<button
className="floating-faq-btn"
onClick={() => navigate("/aichat")}
>
<FaComments/>
</button>
</>
);
}

const handleLogout = () => {
  if(window.confirm("Are you sure you want to logout?")){
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminHotelId");
    if(setUser) setUser(null);
    navigate("/login");
  }
};

const uniqueOrders = useMemo(() => {
  const map = new Map();
  orders.forEach(o => {
    if (!map.has(o.id)) {
      map.set(o.id, o);
    }
  });

  return Array.from(map.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}, [orders]);

const stats = useMemo(()=>{
let totals={all:0,success:0,cancelled:0};
uniqueOrders.forEach(order=>{
const total = order.total || order.items?.reduce((s,i)=>{
const price = typeof i.price==="string"
? parseInt(i.price.replace(/[^\d]/g,""))
: (i.price||0);
return s + price*(i.qty||1);
},0) || 0;
totals.all += total;
if(order.status==="Delivered"){
totals.success += total;
}
if(order.status==="Rejected" || order.status==="Cancelled"){
totals.cancelled += total;
}
});
return{
totalOrders:uniqueOrders.length,
cartCount:cartItems.length,
successSpend:totals.success,
cancelSpend:totals.cancelled,
points:Math.floor(totals.success/10)
};
},[uniqueOrders,cartItems]);

const formatINR = (amount)=>{
return new Intl.NumberFormat("en-IN",{
style:"currency",
currency:"INR",
maximumFractionDigits:0
}).format(amount);
};

return(
<>
<div className="user-page">
<div className="page-bg-overlay"></div>
<div className="premium-profile-card">
<div className="profile-banner"></div>
<div className="card-header-content">
<div className="avatar-outer-glow">
<div className="avatar-main">
{user.displayName
? user.displayName.charAt(0)
: user.name
? user.name.charAt(0)
: "U"}
</div>
</div>
<div className="header-text-info">
<div className="badge-vip">
<FaCrown/> Premium Member
</div>
<h2>{user.displayName || user.name || "Valued Customer"}</h2>
<div className="info-pills">
<span className="info-pill">
<FaEnvelope/> {user.email}
</span>
{(user.phoneNumber || user.mobile) && ( <span className="info-pill"> <FaPhoneAlt/> {user.phoneNumber || user.mobile} </span>
)}
</div>
</div>
<div className="header-right-actions">
<button className="action-btn-neon">
<FaEdit/>
</button>
<button
className="action-btn-neon logout"
onClick={handleLogout}
>
<FaSignOutAlt/>
</button>
</div>
</div>
</div>

<div className="graphics-stats-row">
<div className="graphic-stat-card orders">
<FaUtensils/>
<span className="stat-num">{stats.totalOrders}</span>
<span className="stat-txt">Orders</span>
</div>
<div className="graphic-stat-card bag">
<FaShoppingBag/>
<span className="stat-num">{stats.cartCount}</span>
<span className="stat-txt">Cart</span>
</div>
<div className="graphic-stat-card success">
<FaCheckCircle/>
<span className="stat-num">{formatINR(stats.successSpend)}</span>
<span className="stat-txt">Paid</span>
</div>
<div className="graphic-stat-card cancel">
<FaTimesCircle/>
<span className="stat-num">{formatINR(stats.cancelSpend)}</span>
<span className="stat-txt">Cancelled</span>
</div>
<div className="graphic-stat-card points">
<FaStar/>
<span className="stat-num">{stats.points}</span>
<span className="stat-txt">Points</span>
</div>
</div>

<div className="glass-panel">
  <h3>
    <FaTruck /> Order History
  </h3>
{uniqueOrders.length===0 && (
<p>No orders placed yet.</p>
)}
{uniqueOrders.map(order=>(
<div
className="graphic-order-card"
key={order.id}
>
<div className="status-dot-info">
<span className="order-ref">
Order #{order.id?.slice(0,6)}
</span>
<span className={`neon-status status-${order.status?.toLowerCase()}`}>
{order.status} </span>
</div>
<div className="order-items-scroll">
{order.items?.map((item,i)=>(
<span
key={i}
className="item-tag-graphic"
onClick={() => setOpenItem(item)}
style={{ cursor: 'pointer' }}
>
{item.name} x{item.qty} </span>
))}
</div>
<div className="order-final-row">
<span className="total-val-graphic">
{formatINR(order.total)}
</span>
<span className="date-graphic">
{new Date(order.createdAt).toLocaleDateString()}
</span>
</div>
</div>
))}
</div>
</div>
<button
className="floating-faq-btn"
onClick={()=>navigate("/aichat")}
>
<FaComments/>
</button>
{openItem && (
  <FoodModal
    item={openItem}
    onClose={() => setOpenItem(null)}
    onAdd={addToCart}
  />
)}
</>
);
};
export default UserPage;
