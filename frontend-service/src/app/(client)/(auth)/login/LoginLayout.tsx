"use client";

import React from "react";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="vh-100 d-flex align-items-center login-bg"
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/template/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <div className="container h-custom">
        <div className="row d-flex justify-content-center align-items-center h-100">

          <div className="col-md-9 col-lg-6 col-xl-5 text-center">
            <img
              src="/template/EngLearnLogo.png"
              className="img-fluid"
              alt="EngLearn Logo"
              style={{ maxWidth: "350px" }}
            />
          </div>

          <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
