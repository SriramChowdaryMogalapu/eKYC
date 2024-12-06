import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button"; // Make sure to import Button
import React from "react";
import logo from "./ekyc_logo.png";
import { useNavigate } from "react-router-dom";
import './Header_1.css';
function ContainerInsideExample() {
    const handleSignup = async (e) => {
        e.preventDefault();
       await navigate("/signup");
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        await navigate("/login");
      };
  const navigate = useNavigate();
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
          <Button className="button" onClick={handleSignup}>Signup</Button>&nbsp;&nbsp;
          <Button className="button" onClick={handleLogin}>Login</Button>
          &nbsp;&nbsp;
        </div>
      </Container>
    </Navbar>
  );
}

export default ContainerInsideExample;
