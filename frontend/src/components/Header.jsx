import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button"; // Make sure to import Button
import React,{useEffect,useState} from "react";
import axios from "axios";
import logo from "./ekyc_logo.png";
import { useNavigate } from "react-router-dom";
import './Header.css';
function Header() {
    const [user,setUser] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUserData = async () => {
          const token = localStorage.getItem("authToken");
          if (!token) {
            alert("Not logged in! Please log in...");
            navigate("/login");
            return;
          }
    
          try {
            const response = await axios.get("http://localhost:5000/api/auth/user", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setUser (response.data);
          } catch (error) {
            console.error("Error fetching user data:", error);
            alert("Failed to fetch user data. Please log in again.");
            localStorage.removeItem("authToken");
            navigate("/login");
          }
        };
    
        fetchUserData();
      }, [navigate]);
    
      if (!user) {
        return <div>Loading...</div>; // Show loading state while fetching user data
      }
    const handlename = async (e) => {
        e.preventDefault();
        
    };
    const handleLogout = () => {
      localStorage.removeItem("authToken");
      navigate("/login");
    };
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <h2 style={{ color: "white", textAlign: "center", alignItems:"center" }}>
          EKYC &nbsp;
          <img
            src={logo}
            alt="Logo"
            style={{ height: "60px" }}
          />
        </h2>
        <div className="ml-auto">
          <Button className="button" onClick={handlename}>{user.username}</Button>
          &nbsp;&nbsp;
          <Button className="button" onClick={handleLogout} style={{backgroundColor:"white",color:"black"}}>Log Out</Button>
          &nbsp;&nbsp;
        </div>
      </Container>
    </Navbar>
  );
}

export default Header;
