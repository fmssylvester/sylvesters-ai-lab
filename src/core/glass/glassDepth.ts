export function depthShadow(depth:number){

return{

boxShadow:

depth===0

?"0 40px 120px rgba(0,0,0,.45)"

:depth===1

?"0 28px 70px rgba(0,0,0,.34)"

:"0 18px 45px rgba(0,0,0,.26)"

}

}
