import { useEffect } from "react";
import { useRouter } from "next/router";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
  
    localStorage.setItem("accessToken", "");
    router.push("/login");
  }, [router]);

  return null; 
};

export default Logout;
