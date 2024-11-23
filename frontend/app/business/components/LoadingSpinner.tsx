const LoadingSpinner = () => {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span 
            className="loading loading-infinity"
            style={{ width: '8rem', height: '8rem', borderWidth: '0.2rem', color: "gray"}}></span>
      </div>
    );
  };
  
  export default LoadingSpinner;