const count = async()=>{
    console.log('testing the sitty dom on the cart count page');
    try{
        const res=await axios.get('/cartCount',{}).then((e)=>{
            document.getElementById('cart-count').innerHTML=e.data.response
        })
    }catch(err){
    console.log(err.response.data)
    }
    try{
        const res=await axios.get('/wishlistCount',{}).then((e)=>{
            document.getElementById('wishlist-count').innerHTML=e.data.response
        })
    }catch(err){
        console.log(err.response.data)
    }
}
document.addEventListener('DOMContentLoaded',count)