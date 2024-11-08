// // client/src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// // import Login from './components/Auth/Login';
// // import Signup from './components/Auth/Signup';
// // import Dashboard from './components/Dashboard/Dashboard';
// // import FileTransfer from './components/FileTransfer/FileTransfer';
// // import { AuthProvider } from './context/AuthContext';
// import FileTransferApp from './Dashboard';

import { useState } from "react";
import Auth from "./Auth";
import FileSharing from "./Dashboard";

// function App() {
//   return (
//     <>
//       <Router>
//         <Routes>
//           {/* <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/transfer" element={<FileTransfer />} /> */}
//           <Route path="/" element={<FileTransferApp/>} />
//         </Routes>
//       </Router>
//     </>
//   );
// }

// export default App;









function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <FileSharing user={user} />
      )}
    </div>
  );
}


export default App;