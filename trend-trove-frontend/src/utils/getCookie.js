// const getCookie = (name) => {
//     const cookies = document.cookie.split(';');
//     for (let cookie of cookies) {
//       const [cookieName, cookieValue] = cookie.trim().split('=');
//       if (cookieName === name) {
//         return decodeURIComponent(cookieValue);
//       }
//     }
//     return null;
//   };
  
//   const adminId = getCookie('adminId');
//   console.log("Hitted", adminId);
  
//   if (!adminId) {
//     setError('Admin ID not found. Please login again.');
//     return;
//   }

// export default getCookie;
  