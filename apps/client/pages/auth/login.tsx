import React from 'react';

import Image from 'next/image';

const LoginPage = () => {

  const handleSubmitLogin: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    alert('Not Implemented!')
  };

  return (
    <main className="bg-light text-center vh-100">
      <div className="container d-flex align-items-center justify-content-center h-100">
        <form onSubmit={handleSubmitLogin}>
          <Image alt="logo" className="mb-2" height={52} src="/logo.png" width={64} />
          <h1 className="h3 mb-3 fw-normal">Login</h1>
          <div className="form-floating my-1">
            <input className="form-control" id="floatingInput" placeholder="name@example.com" type="email" />
            <label htmlFor="floatingInput">Email address</label>
          </div>
          <div className="form-floating my-1">
            <input className="form-control" id="floatingPassword" placeholder="Password" type="password" />
            <label htmlFor="floatingPassword">Password</label>
          </div>
          <button className="w-100 btn btn-lg btn-primary" type="submit">
            Sign in
          </button>
          <p className="text-muted my-2">
            Not registered?{' '}
            <a className="text-decoration-none" href="/request-account">
              Request an account
            </a>
          </p>
          <p className="text-muted mt-3">© {new Date().getFullYear()} Douglas Neuroinformatics Platform</p>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
