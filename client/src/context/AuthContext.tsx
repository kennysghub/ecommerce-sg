// import React, { createContext, useContext, useEffect, useState } from "react";
// import { auth } from "../firebase";
// import { onAuthStateChanged, User } from "firebase/auth";

// type AuthContextType = {
//   user: User | null;
//   loading: boolean;
// };

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
// });

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider: React.FC = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
