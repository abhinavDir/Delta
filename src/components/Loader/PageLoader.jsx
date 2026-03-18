import React, { useState, useEffect } from "react";
import PageSkeleton from "./PageSkeleton";

export default function PageLoader({ children }) {

  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const timer = setTimeout(()=>{
      setLoading(false);
    },400); // quick skeleton flash

    return ()=>clearTimeout(timer);

  },[]);

  if(loading){
    return <PageSkeleton/>
  }

  return children;
}